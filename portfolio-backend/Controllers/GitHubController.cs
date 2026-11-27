using Microsoft.AspNetCore.Mvc;
using portfolio_backend.Models;
using portfolio_backend.Services;

namespace portfolio_backend.Controllers
{
    [ApiController]
    [Route("api/github")]
    public class GitHubController : ControllerBase
    {
        private readonly GitHubStatsService _stats;

        public GitHubController(GitHubStatsService stats) => _stats = stats;

        [HttpGet]
        public async Task<ActionResult<GitHubStats>> Get(CancellationToken ct)
        {
            var stats = await _stats.GetStatsAsync(ct);

            // The real cache is server-side; this just lets browsers/CDNs
            // skip a round trip for repeat views within a few minutes.
            Response.Headers.CacheControl = "public, max-age=600";
            return Ok(stats);
        }
    }
}
