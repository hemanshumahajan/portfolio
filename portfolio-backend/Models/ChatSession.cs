using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace portfolio_backend.Models
{
    public class ChatMessageLog
    {
        public string Role { get; set; } = null!; // "user" or "assistant"
        public string Content { get; set; } = null!;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class ChatSession
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        // Client-generated GUID, one per visitor's browser session/tab load.
        // Used to group messages into a single thread and to detect
        // "is this a brand new conversation" for the email notification.
        public string SessionId { get; set; } = null!;

        public List<ChatMessageLog> Messages { get; set; } = [];

        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastMessageAt { get; set; } = DateTime.UtcNow;
    }
}