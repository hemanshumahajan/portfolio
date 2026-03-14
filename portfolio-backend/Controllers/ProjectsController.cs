using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using portfolio_backend.Models;
using portfolio_backend.Services;

namespace portfolio_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly IMongoCollection<Project> _projects;

        public ProjectsController(MongoDbService db) => _projects = db.GetCollection<Project>("projects");

        [HttpGet]
        public async Task<List<Project>> GetAll()
        {
            return await _projects.Find(_ => true)
                                  .SortByDescending(p => p.CreatedAt)
                                  .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetById(string id)
        {
            var project = await _projects.Find(p => p.Id == id).FirstOrDefaultAsync();
            
            if(project == null)
            {
                NotFound();
            }

            return Ok(project);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Project project)
        {
            await _projects.InsertOneAsync(project);

            return CreatedAtAction(nameof(GetById), new {id = project.Id}, project);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Project updated)
        {
            updated.Id = id;
            await _projects.ReplaceOneAsync(p => p.Id == id, updated);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _projects.DeleteOneAsync(p => p.Id == id);
            return NoContent();
        }
    }
}