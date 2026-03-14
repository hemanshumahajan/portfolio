using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace portfolio_backend.Models
{
    public class BlogPost
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public string Title { get; set; } = null!;
        public string Slug { get; set; } = null!;       // URL-friendly: "my-first-post"
        public string Summary { get; set; } = null!;    // Short preview
        public string Content { get; set; } = null!;    // Full markdown content
        public string[] Tags { get; set; } = [];
        public string? CoverImageUrl { get; set; }
        public string? ThumbnailUrl { get; set; } 
        public string[] Images { get; set; } = [];     
        public string[] Videos { get; set; } = [];
        public bool IsPublished { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}