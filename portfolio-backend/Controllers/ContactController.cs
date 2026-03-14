using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using portfolio_backend.Models;
using portfolio_backend.Services;

namespace portfolio_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactController : ControllerBase
    {
        private readonly IMongoCollection<ContactMessage> _messages;

        public ContactController(MongoDbService db) => _messages = db.GetCollection<ContactMessage>("messages");

        [HttpPost]
        public async Task<IActionResult> Send(ContactMessage message)
        {
            message.SentAt = DateTime.UtcNow;
            await _messages.InsertOneAsync(message);

            return Ok(new { success = true, message = "Thanks! I'll get back to you soon." });
        }
    }
}