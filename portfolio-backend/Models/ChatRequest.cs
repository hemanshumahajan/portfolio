namespace portfolio_backend.Models
{
    public class ChatRequest
    {
        public List<ChatMessage> Messages { get; set; } = [];

        // Client-generated GUID, one per browser session. Optional so the
        // endpoint doesn't hard-break if an old cached frontend build
        // calls it without one — in that case we just skip logging.
        public string? SessionId { get; set; }
    }

    public class ChatMessage
    {
        public string Role { get; set; } = null!; // "user" or "assistant"
        public string Content { get; set; } = null!;
    }
}