using FluentValidation;
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
        private readonly IValidator<ContactMessage> _validator;

        public ContactController(MongoDbService db, IValidator<ContactMessage> validator)
        {
            _messages = db.GetCollection<ContactMessage>("messages");
            _validator = validator;
        }

        [HttpPost]
        public async Task<IActionResult> Send(ContactMessage message)
        {
            // Validate first
            var result = await _validator.ValidateAsync(message);

            if(!result.IsValid)
            {
                var errors = result.Errors
                    .GroupBy(e => e.PropertyName.ToLower())
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(e => e.ErrorMessage).ToArray()
                    );

                return BadRequest(errors);
            }

            message.SentAt = DateTime.UtcNow;
            await _messages.InsertOneAsync(message);

            return Ok(new { success = true, message = "Thanks! I'll get back to you soon." });
        }
    }
}