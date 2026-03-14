namespace portfolio_backend.Models
{
    public class ChatRequest
    {
        public List<ChatMessage> Messages { get; set; } = [];
    }

    public class ChatMessage
    {
        public string Role { get; set; } = null!; // "user" or "assistant"
        public string Content { get; set; } = null!;
    }
}