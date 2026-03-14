using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using portfolio_backend.Models;
using portfolio_backend.Services;

namespace portfolio_backend.Controllers
{
    [ApiController]
    [Route("api/blog")]
    public class BlogsController : ControllerBase
    {
        private readonly IMongoCollection<BlogPost> _blogs;

        public BlogsController(MongoDbService db) => _blogs = db.GetCollection<BlogPost>("blogs");

        [HttpGet]
        public async Task<List<BlogPost>> GetPublished()
        {
            return await _blogs.Find(b => b.IsPublished)
                               .SortByDescending(b => b.CreatedAt)
                               .ToListAsync();
        }

        [HttpGet("{slug}")]
        public async Task<ActionResult<BlogPost>> GetBySlug(string slug)
        {
            var post = await _blogs.Find(b => b.Slug == slug && b.IsPublished)
                                   .FirstOrDefaultAsync();

            if (post == null)
            {
                return NotFound();
            }

            return Ok(post);
        }

        [HttpPost]
        public async Task<IActionResult> Create(BlogPost post)
        {
            post.CreatedAt = DateTime.UtcNow;
            post.UpdatedAt = DateTime.UtcNow;
            await _blogs.InsertOneAsync(post);

            return CreatedAtAction(nameof(GetBySlug), new { slug = post.Slug }, post);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, BlogPost updated)
        {
            updated.Id = id;
            updated.UpdatedAt = DateTime.UtcNow;
            await _blogs.ReplaceOneAsync(b => b.Id ==  id, updated);

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _blogs.DeleteOneAsync(b => b.Id == id);
            return NoContent();
        }
    }
}