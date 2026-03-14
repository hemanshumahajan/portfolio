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
            You are a helpful assistant for Hemanshu's portfolio website. 
            You know about his skills, projects, and experience as a developer.
            Answer questions about his work, skills, and background in a friendly, concise way.
            If someone asks something unrelated to the portfolio or professional topics, 
            politely redirect them. Keep responses short and helpful.
        """;

        public ChatController(IOptions<AnthropicSettings> settings) => _apiKey = settings.Value.APIKey;

        [HttpPost]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            using var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Add("x-api-key", _apiKey);
            httpClient.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");

            // Messages array including conversation history
            var messages = request.History
                .Select(h => new {role = h.Role, content = h.Content })
                .Append(new {role = "user", content = request.Message })
                .ToList();

            var body = new
            {
                model = "claude-sonnet-4-5",
                max_tokens = 1024,
                system = SystemPrompt,
                messages
            };

            var json = JsonSerializer.Serialize(body);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await httpClient.PostAsync("https://api.anthropic.com/v1/messages", content);
            var responseBody = await response.Content.ReadAsStringAsync();

            if(!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, "AI service error");
            }

            using var doc = JsonDocument.Parse(responseBody);
            var reply = doc.RootElement
                .GetProperty("content")[0]
                .GetProperty("text")
                .GetString();

            return Ok(new { reply });
        }
    }
}