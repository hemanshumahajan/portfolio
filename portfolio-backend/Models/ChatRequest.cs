namespace portfolio_backend.Models
{
    public class ChatRequest
    {
        public string Message { get; set; } = null!;
        public List<ChatMessage> History { get; set; } = [];
    }

    public class ChatMessage
    {
        public string Role { get; set; } = null!; // "user" or "assistant"
        public string Content { get; set; } = null!;
    }
}