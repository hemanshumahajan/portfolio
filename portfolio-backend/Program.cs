using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using portfolio_backend.Services;
using portfolio_backend.Settings;
using portfolio_backend.Validators;
using System.Text;

// NOTE: this file is unchanged from the previous version — only the using
// statements above were missing in the copy you had open in the editor.

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

//MongoDB
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));
builder.Services.AddSingleton<MongoDbService>();

// OpenAI
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

// CORS for React dev server (Vite default = 5173)
builder.Services.AddCors(options =>
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:5173",
        "https://hemanshumahajan.vercel.app")
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

app.MapControllers();

app.Run();