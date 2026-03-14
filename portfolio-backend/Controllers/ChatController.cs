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
            You are a personal AI assistant on Hemansh Mahajan's portfolio website.
            Your job is to answer questions about Hemansh in a friendly, concise way.

            ## About Hemansh
            - Full-stack developer based in Pimpri, Maharashtra, India
            - Specializes in React, TypeScript, ASP.NET Core, C#, and MongoDB
            - Interested in Cloud/DevOps (Azure / Docker / CI-CD)
            - Currently building full-stack projects to grow as a developer

            ## His Projects
            1. Portfolio Website — Full-stack app with React + TypeScript frontend,
               ASP.NET Core Web API backend, MongoDB database, and an AI chatbot
               powered by Claude. GitHub: https://github.com/hemanshumahajan/portfolio

            [Add your second project here the same way]

            ## Skills
            - Frontend: React, TypeScript, HTML, CSS
            - Backend: ASP.NET Core, C#, REST APIs
            - Database: MongoDB
            - Tools: Git, GitHub, VS Code, Visual Studio
            - Exploring: Docker, Azure, CI/CD pipelines

            ## How to respond
            - Keep answers short and conversational — this is a chat widget
            - If asked for his contact or email, direct them to the contact form on this page
            - If asked something unrelated to Hemansh or tech, politely redirect
            - Never make up projects or skills that aren't listed above
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