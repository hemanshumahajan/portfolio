using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using portfolio_backend.Models;
using portfolio_backend.Services;

namespace portfolio_backend.Controllers
{
    [ApiController]
    [Route("api/chat-sessions")]
    [Authorize]
    public class ChatSessionsController : ControllerBase
    {
        private readonly IMongoCollection<ChatSession> _sessions;

        public ChatSessionsController(MongoDbService db) =>
            _sessions = db.GetCollection<ChatSession>("chatSessions");

        // Returns sessions newest-first, without the full message bodies —
        // just enough for a list view (first message as a preview).
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var sessions = await _sessions.Find(_ => true)
                .SortByDescending(s => s.LastMessageAt)
                .ToListAsync();

            var summaries = sessions.Select(s => new
            {
                s.Id,
                s.SessionId,
                s.StartedAt,
                s.LastMessageAt,
                MessageCount = s.Messages.Count,
                Preview = s.Messages.FirstOrDefault(m => m.Role == "user")?.Content
                          ?? s.Messages.FirstOrDefault()?.Content
                          ?? ""
            });

            return Ok(summaries);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ChatSession>> GetById(string id)
        {
            var session = await _sessions.Find(s => s.Id == id).FirstOrDefaultAsync();

            if (session == null)
            {
                return NotFound();
            }

            return Ok(session);
        }
    }
}