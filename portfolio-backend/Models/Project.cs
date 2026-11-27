using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace portfolio_backend.Models
{
    public class Project
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string[] Technologies { get; set; } = [];
        public string? GithubUrl { get; set; }
        public string? LiveUrl { get; set; }          // Deployed app -> "View project"
        public string? DemoVideoUrl { get; set; }     // Google Drive or .mp4/.webm -> "View demo"
        public string? ImageUrl { get; set; }
        public string? ThumbnailUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}