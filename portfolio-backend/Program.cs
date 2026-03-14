using FluentValidation;
using portfolio_backend.Data;
using portfolio_backend.Services;
using portfolio_backend.Settings;
using portfolio_backend.Validators;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

//MongoDB
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));
builder.Services.AddSingleton<MongoDbService>();

// Anthropic / Claude
builder.Services.Configure<AnthropicSettings>(
    builder.Configuration.GetSection("AnthropicSettings"));

//Validation
builder.Services.AddValidatorsFromAssemblyContaining<ContactMessageValidator>();

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS for React dev server (Vite default = 5173)
builder.Services.AddCors(options =>
    options.AddPolicy("AllowFrontend", policy => 
        policy.WithOrigins("http://localhost:5173",
        "https://hemanshumahajanportfolio.vercel.app") 
        .AllowAnyHeader() 
        .AllowAnyMethod()
        .AllowCredentials()));

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

//Seed data
using var scope = app.Services.CreateScope();
var mongoservice = scope.ServiceProvider.GetRequiredService<MongoDbService>();
await SeedData.SeedAsync(mongoservice);

app.Run();