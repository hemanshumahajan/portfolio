using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using portfolio_backend.Models;
using portfolio_backend.Settings;
using System.Text;
using System.Text.Json;

namespace portfolio_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly string _apiKey;

        //This system prompt makes the AI respond as YOUR portfolio assistant
        private const string SystemPrompt = """
            You are a helpful assistant on Hemansh's portfolio website.
            Answer questions about his skills, projects, experience, and background
            in a friendly and concise way. If asked something unrelated to his 
            professional work, politely redirect the conversation.
            Keep responses short — this is a chat widget, not an essay.
            """;

        public ChatController(IOptions<AnthropicSettings> settings) => _apiKey = settings.Value.APIKey;

        [HttpPost]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Add("x-api-key", _apiKey);
            httpClient.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");

            var body = new
            {
                model = "claude-sonnet-4-5",
                max_tokens = 1024,
                system = SystemPrompt,
                messages = request.Messages.Select(m => new
                {
                    role = m.Role,
                    content = m.Content
                })
            };

            var json = JsonSerializer.Serialize(body);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await httpClient.PostAsync("https://api.anthropic.com/v1/messages", content);

            if(!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, "AI service error");
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseBody);

            var reply = doc.RootElement
                .GetProperty("content")[0]
                .GetProperty("text")
                .GetString();

            return Ok(new { reply });
        }
    }
}