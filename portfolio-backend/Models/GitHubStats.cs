namespace portfolio_backend.Models
{
    public class GitHubStats
    {
        public int? PublicRepos { get; set; }
        public int? Followers { get; set; }
        public int? Commits { get; set; }
        public long? EstimatedLines { get; set; }
        public int? Stars { get; set; }
        public int? TotalContributions { get; set; }

        // 52 weeks, oldest first; each week is 7 levels (0-4), Sunday first.
        public List<int[]> Weeks { get; set; } = [];

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
