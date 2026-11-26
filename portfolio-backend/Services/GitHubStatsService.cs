using System.Globalization;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using portfolio_backend.Models;
using portfolio_backend.Settings;

namespace portfolio_backend.Services
{
    /// <summary>
    /// Server-side proxy for public GitHub stats so the browser never calls
    /// GitHub directly. Results are cached in memory (default 1 hour); when
    /// GitHub is unavailable or rate-limited the last good snapshot is served
    /// and a refresh is retried a few minutes later.
    /// </summary>
    public partial class GitHubStatsService
    {
        public const string HttpClientName = "github";

        private const string CacheKey = "github-stats";
        private const int WeeksToShow = 52;
        // Rough average for source files; the UI labels this as an estimate.
        private const int BytesPerLine = 40;
        private static readonly TimeSpan RetryAfterFailure = TimeSpan.FromMinutes(5);

        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IMemoryCache _cache;
        private readonly GitHubSettings _settings;
        private readonly ILogger<GitHubStatsService> _logger;
        private readonly SemaphoreSlim _refreshLock = new(1, 1);
        private GitHubStats? _lastGood;

        public GitHubStatsService(
            IHttpClientFactory httpClientFactory,
            IMemoryCache cache,
            IOptions<GitHubSettings> settings,
            ILogger<GitHubStatsService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _cache = cache;
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task<GitHubStats> GetStatsAsync(CancellationToken ct = default)
        {
            if (_cache.TryGetValue(CacheKey, out GitHubStats? cached) && cached is not null)
            {
                return cached;
            }

            await _refreshLock.WaitAsync(ct);
            try
            {
                if (_cache.TryGetValue(CacheKey, out cached) && cached is not null)
                {
                    return cached;
                }

                // Not tied to the caller's token: one visitor closing the tab
                // shouldn't abort the shared refresh everyone else is waiting on.
                var fresh = await FetchAsync(CancellationToken.None);
                var complete = IsComplete(fresh);
                var stats = FillGaps(fresh, _lastGood);

                if (complete)
                {
                    _lastGood = stats;
                }

                var ttl = complete ? TimeSpan.FromMinutes(_settings.CacheMinutes) : RetryAfterFailure;
                _cache.Set(CacheKey, stats, ttl);
                return stats;
            }
            finally
            {
                _refreshLock.Release();
            }
        }

        private async Task<GitHubStats> FetchAsync(CancellationToken ct)
        {
            var client = _httpClientFactory.CreateClient(HttpClientName);
            var user = Uri.EscapeDataString(_settings.Username);

            var profileTask = GetApiJsonAsync(client, $"https://api.github.com/users/{user}", ct);
            var reposTask = GetApiJsonAsync(client, $"https://api.github.com/users/{user}/repos?per_page=100&type=owner&sort=updated", ct);
            var commitsTask = GetApiJsonAsync(client, $"https://api.github.com/search/commits?q=author:{user}&per_page=1", ct);
            var calendarTask = GetContributionCalendarAsync(client, user, ct);

            await Task.WhenAll(profileTask, reposTask, commitsTask, calendarTask);

            var profile = profileTask.Result;
            var repos = reposTask.Result;
            var commits = commitsTask.Result;
            var (levels, totalContributions) = calendarTask.Result;

            var stats = new GitHubStats
            {
                PublicRepos = profile is { } p ? GetInt(p, "public_repos") : null,
                Followers = profile is { } f ? GetInt(f, "followers") : null,
                Commits = commits is { } c ? GetInt(c, "total_count") : null,
                TotalContributions = totalContributions,
                Weeks = BuildWeeks(levels),
                UpdatedAt = DateTime.UtcNow,
            };

            if (repos is { ValueKind: JsonValueKind.Array } repoArray)
            {
                var owned = repoArray.EnumerateArray()
                    .Where(r => !(r.TryGetProperty("fork", out var fork) && fork.ValueKind == JsonValueKind.True))
                    .ToList();

                stats.Stars = owned.Sum(r => GetInt(r, "stargazers_count") ?? 0);

                var languageUrls = owned
                    .Select(r => r.TryGetProperty("languages_url", out var u) ? u.GetString() : null)
                    .OfType<string>()
                    .ToList();

                var languageResults = await Task.WhenAll(languageUrls.Select(url => GetApiJsonAsync(client, url, ct)));

                // Only report a number if every repo answered; a partial sum
                // would quietly under-count.
                if (languageResults.All(r => r is not null))
                {
                    long bytes = languageResults.Sum(r => r!.Value.EnumerateObject().Sum(lang => lang.Value.TryGetInt64(out var b) ? b : 0));
                    stats.EstimatedLines = bytes > 0 ? bytes / BytesPerLine : null;
                }
            }

            return stats;
        }

        // ---------------------------------------------------------------
        // Contribution calendar
        // ---------------------------------------------------------------

        private async Task<(Dictionary<DateOnly, int> Levels, int? Total)> GetContributionCalendarAsync(
            HttpClient client, string user, CancellationToken ct)
        {
            if (!string.IsNullOrWhiteSpace(_settings.Token))
            {
                var fromGraphQl = await GetCalendarFromGraphQlAsync(client, user, ct);
                if (fromGraphQl.Levels.Count > 0)
                {
                    return fromGraphQl;
                }
            }

            return await GetCalendarFromProfilePageAsync(client, user, ct);
        }

        private async Task<(Dictionary<DateOnly, int> Levels, int? Total)> GetCalendarFromGraphQlAsync(
            HttpClient client, string user, CancellationToken ct)
        {
            const string query = """
                query($login: String!) {
                  user(login: $login) {
                    contributionsCollection {
                      contributionCalendar {
                        totalContributions
                        weeks { contributionDays { date contributionLevel } }
                      }
                    }
                  }
                }
                """;

            var levels = new Dictionary<DateOnly, int>();
            try
            {
                using var request = CreateApiRequest(HttpMethod.Post, "https://api.github.com/graphql");
                var payload = JsonSerializer.Serialize(new { query, variables = new { login = Uri.UnescapeDataString(user) } });
                request.Content = new StringContent(payload, Encoding.UTF8, "application/json");

                using var response = await client.SendAsync(request, ct);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("GitHub GraphQL returned {Status}", (int)response.StatusCode);
                    return (levels, null);
                }

                await using var stream = await response.Content.ReadAsStreamAsync(ct);
                using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);

                if (!doc.RootElement.TryGetProperty("data", out var data)
                    || !data.TryGetProperty("user", out var userEl) || userEl.ValueKind != JsonValueKind.Object)
                {
                    return (levels, null);
                }

                var calendar = userEl.GetProperty("contributionsCollection").GetProperty("contributionCalendar");
                int? total = GetInt(calendar, "totalContributions");

                foreach (var week in calendar.GetProperty("weeks").EnumerateArray())
                {
                    foreach (var day in week.GetProperty("contributionDays").EnumerateArray())
                    {
                        if (DateOnly.TryParseExact(day.GetProperty("date").GetString(), "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
                        {
                            levels[date] = day.GetProperty("contributionLevel").GetString() switch
                            {
                                "FIRST_QUARTILE" => 1,
                                "SECOND_QUARTILE" => 2,
                                "THIRD_QUARTILE" => 3,
                                "FOURTH_QUARTILE" => 4,
                                _ => 0,
                            };
                        }
                    }
                }

                return (levels, total);
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException or KeyNotFoundException or InvalidOperationException)
            {
                _logger.LogWarning(ex, "GitHub GraphQL contribution calendar failed");
                return (levels, null);
            }
        }

        private async Task<(Dictionary<DateOnly, int> Levels, int? Total)> GetCalendarFromProfilePageAsync(
            HttpClient client, string user, CancellationToken ct)
        {
            var levels = new Dictionary<DateOnly, int>();
            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Get, $"https://github.com/users/{user}/contributions");
                request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("text/html"));

                using var response = await client.SendAsync(request, ct);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("GitHub contributions page returned {Status}", (int)response.StatusCode);
                    return (levels, null);
                }

                var html = await response.Content.ReadAsStringAsync(ct);

                // The calendar is a table laid out by weekday rows, so document
                // order is not chronological — key every cell by its date.
                foreach (Match cell in TableCellRegex().Matches(html))
                {
                    var tag = cell.Value;
                    var dateMatch = DataDateRegex().Match(tag);
                    var levelMatch = DataLevelRegex().Match(tag);
                    if (dateMatch.Success && levelMatch.Success
                        && DateOnly.TryParseExact(dateMatch.Groups[1].Value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
                    {
                        levels[date] = int.Parse(levelMatch.Groups[1].Value, CultureInfo.InvariantCulture);
                    }
                }

                int? total = null;
                var totalMatch = TotalContributionsRegex().Match(html);
                if (totalMatch.Success
                    && int.TryParse(totalMatch.Groups[1].Value.Replace(",", ""), NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed))
                {
                    total = parsed;
                }

                return (levels, total);
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
            {
                _logger.LogWarning(ex, "GitHub contributions page failed");
                return (levels, null);
            }
        }

        private static List<int[]> BuildWeeks(Dictionary<DateOnly, int> levels)
        {
            if (levels.Count == 0)
            {
                return [];
            }

            var latest = levels.Keys.Max();
            var lastWeekStart = latest.AddDays(-(int)latest.DayOfWeek);
            var firstWeekStart = lastWeekStart.AddDays(-7 * (WeeksToShow - 1));

            var weeks = new List<int[]>(WeeksToShow);
            for (var w = 0; w < WeeksToShow; w++)
            {
                var week = new int[7];
                for (var d = 0; d < 7; d++)
                {
                    var date = firstWeekStart.AddDays(w * 7 + d);
                    week[d] = levels.TryGetValue(date, out var level) ? Math.Clamp(level, 0, 4) : 0;
                }
                weeks.Add(week);
            }
            return weeks;
        }

        // ---------------------------------------------------------------
        // Helpers
        // ---------------------------------------------------------------

        private HttpRequestMessage CreateApiRequest(HttpMethod method, string url)
        {
            var request = new HttpRequestMessage(method, url);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/vnd.github+json"));
            request.Headers.Add("X-GitHub-Api-Version", "2022-11-28");
            if (!string.IsNullOrWhiteSpace(_settings.Token))
            {
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _settings.Token);
            }
            return request;
        }

        private async Task<JsonElement?> GetApiJsonAsync(HttpClient client, string url, CancellationToken ct)
        {
            try
            {
                using var request = CreateApiRequest(HttpMethod.Get, url);
                using var response = await client.SendAsync(request, ct);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("GitHub {Url} returned {Status}", url, (int)response.StatusCode);
                    return null;
                }

                await using var stream = await response.Content.ReadAsStreamAsync(ct);
                using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
                return doc.RootElement.Clone();
            }
            catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or JsonException)
            {
                _logger.LogWarning(ex, "GitHub request to {Url} failed", url);
                return null;
            }
        }

        private static int? GetInt(JsonElement element, string property) =>
            element.ValueKind == JsonValueKind.Object
            && element.TryGetProperty(property, out var value)
            && value.TryGetInt32(out var result)
                ? result
                : null;

        private static bool IsComplete(GitHubStats s) =>
            s.PublicRepos is not null && s.Followers is not null && s.Commits is not null
            && s.EstimatedLines is not null && s.Stars is not null && s.Weeks.Count > 0;

        private static GitHubStats FillGaps(GitHubStats fresh, GitHubStats? previous)
        {
            if (previous is null)
            {
                return fresh;
            }

            fresh.PublicRepos ??= previous.PublicRepos;
            fresh.Followers ??= previous.Followers;
            fresh.Commits ??= previous.Commits;
            fresh.EstimatedLines ??= previous.EstimatedLines;
            fresh.Stars ??= previous.Stars;
            if (fresh.Weeks.Count == 0)
            {
                fresh.Weeks = previous.Weeks;
                fresh.TotalContributions ??= previous.TotalContributions;
            }
            return fresh;
        }

        [GeneratedRegex(@"<td\b[^>]*>", RegexOptions.IgnoreCase)]
        private static partial Regex TableCellRegex();

        [GeneratedRegex(@"data-date=""(\d{4}-\d{2}-\d{2})""")]
        private static partial Regex DataDateRegex();

        [GeneratedRegex(@"data-level=""(\d)""")]
        private static partial Regex DataLevelRegex();

        [GeneratedRegex(@"([\d,]+)\s+contributions?\s+in\s+the\s+last\s+year", RegexOptions.IgnoreCase)]
        private static partial Regex TotalContributionsRegex();
    }
}
