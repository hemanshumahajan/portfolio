using MongoDB.Driver;
using portfolio_backend.Models;
using portfolio_backend.Services;

namespace portfolio_backend.Data
{
    public class SeedData
    {
        public static async Task SeedAsync(MongoDbService db)
        {
            await SeedProjectsAsync(db);
            await SeedBlogsAsync(db);
        }

        private static async Task SeedProjectsAsync(MongoDbService db)
        {
            var collection = db.GetCollection<Project>("projects");

            var count = await collection.CountDocumentsAsync(
                Builders<Project>.Filter.Empty);

            if(count > 0)
            {
                return;
            }

            var projects = new List<Project>
            {
                new()
                {
                    Title = "Portfolio Website",
                    Description = "Full-stack portfolio built with React, TypeScript, and ASP.NET Core. Features an AI chatbot powered by Claude, dynamic projects/blog, and a contact form.",
                    Technologies = ["React", "TypeScript", "ASP.NET Core", "MongoDB", "Claude AI"],
                    GithubUrl = "https://github.com/hemanshumahajan/portfolio",
                    LiveUrl = "https://your-portfolio.vercel.app",
                    ThumbnailUrl = "https://your-thumbnail-url.com/portfolio.png",
                    CreatedAt = DateTime.UtcNow
                },

                //Add more projects here
            };

            await collection.InsertManyAsync(projects);
            Console.WriteLine($"Seeded {projects.Count} Projects");
        }

        private static async Task SeedBlogsAsync(MongoDbService db)
        {
            var collection = db.GetCollection<BlogPost>("blogs");

            var count = await collection.CountDocumentsAsync(
                Builders<BlogPost>.Filter.Empty);
            
            if(count > 0)
            {
                return;
            }

            var posts = new List<BlogPost>
            {
                new()
                {
                    Title = "Building a Full-Stack Portfolio with React and ASP.NET",
                    Slug = "building-full-stack-portfolio-react-aspnet",
                    Summary = "How I built my portfolio from scratch with React, ASP.NET Core, MongoDB and a Claude AI chatbot.",
                    Content = """
                        ## Why I built this
                        I wanted a portfolio that goes beyond a static page...

                        ## Tech stack
                        React + TypeScript on the frontend, ASP.NET Core Web API on the backend...

                        ## The AI chatbot
                        The most fun part — integrating Claude API to answer questions about me...
                        """,
                    Tags = ["React", "ASP.NET", "MongoDB", "AI"],
                    ThumbnailUrl = "https://your-thumbnail-url.com/blog1.png",
                    Images =
                    [
                        "https://your-image-url.com/screenshot1.png",
                        "https://your-image-url.com/screenshot2.png"
                    ],
                    Videos =
                    [
                        "https://www.youtube.com/embed/your-video-id"   // use /embed/ format for easy iframe rendering
                    ],
                    IsPublished = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },

                //Add more blogs here
            };

            await collection.InsertManyAsync(posts);
            Console.WriteLine($"Seeded {posts.Count} Blog Posts");
        }
    }
}