namespace portfolio_backend.Settings
{
    public class GitHubSettings
    {
        public string Username { get; set; } = "hemanshumahajan";

        // Optional. A fine-grained token with no extra scopes (public data only)
        // raises the REST limit from 60 to 5,000 requests/hour and enables the
        // GraphQL contribution calendar. Without it we fall back to scraping
        // the public contributions page.
        public string? Token { get; set; }

        public int CacheMinutes { get; set; } = 60;
    }
}
