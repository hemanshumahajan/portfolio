using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using portfolio_backend.Models;
using portfolio_backend.Services;
using portfolio_backend.Settings;
using portfolio_backend.Validators;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

//MongoDB
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));
builder.Services.AddSingleton<MongoDbService>();

// Gemini API
builder.Services.Configure<GeminiSettings>(
    builder.Configuration.GetSection("GeminiSettings"));

//Email (Resend)
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddScoped<EmailService>();

// Admin / JWT
builder.Services.Configure<AdminSettings>(
    builder.Configuration.GetSection("AdminSettings"));
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection("JwtSettings"));

var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()
    ?? throw new InvalidOperationException("JwtSettings section is missing from configuration.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization();

// GitHub stats proxy (cached in memory so visitors never hit GitHub's rate limit)
builder.Services.Configure<GitHubSettings>(
    builder.Configuration.GetSection("GitHubSettings"));
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient(GitHubStatsService.HttpClientName, client =>
{
    client.DefaultRequestHeaders.UserAgent.ParseAdd("hemanshu-portfolio");
    client.Timeout = TimeSpan.FromSeconds(15);
});
builder.Services.AddSingleton<GitHubStatsService>();

//Validation
builder.Services.AddValidatorsFromAssemblyContaining<ContactMessageValidator>();

// Controllers with camelCase JSON
builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase);

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS: production domains + local dev servers. Extra origins (e.g. a Vercel
// preview URL) can be added without a code change via configuration:
//   Cors__AllowedOrigins__0=https://my-preview.vercel.app
string[] defaultOrigins =
[
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:3000",
    "https://hemanshumahajan.vercel.app",
    "https://hemanshumahajan.com",
    "https://www.hemanshumahajan.com",
];
var extraOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(defaultOrigins.Concat(extraOrigins).Distinct().ToArray())
        .AllowAnyHeader()
        .AllowAnyMethod()));

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowFrontend");

// Authentication must run before Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => Results.Ok(new { status = "Portfolio API is running" }));
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

app.MapGet("/sitemap.xml", async (MongoDbService db) =>
{
    const string baseUrl = "https://hemanshumahajan.com";

    var blogs = db.GetCollection<BlogPost>("blogs");
    var projects = db.GetCollection<Project>("projects");

    var publishedBlogs = await blogs.Find(b => b.IsPublished).ToListAsync();
    var allProjects = await projects.Find(_ => true).ToListAsync();

    var sb = new StringBuilder();
    sb.AppendLine("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
    sb.AppendLine("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">");

    sb.AppendLine($"  <url><loc>{baseUrl}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>");

    foreach (var post in publishedBlogs)
    {
        var lastmod = post.UpdatedAt.ToString("yyyy-MM-dd");
        sb.AppendLine($"  <url><loc>{baseUrl}/blog/{post.Slug}</loc><lastmod>{lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>");
    }

    foreach (var project in allProjects)
    {
        sb.AppendLine($"  <url><loc>{baseUrl}/projects/{project.Id}</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>");
    }

    sb.AppendLine("</urlset>");

    return Results.Content(sb.ToString(), "application/xml");
});

app.MapControllers();

app.Run();