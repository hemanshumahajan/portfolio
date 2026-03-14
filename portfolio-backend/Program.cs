using portfolio_backend.Services;
using portfolio_backend.Settings;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

//MongoDB
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));
builder.Services.AddSingleton<MongoDbService>();

// Anthropic / Claude
builder.Services.Configure<AnthropicSettings>(
    builder.Configuration.GetSection("AnthropicSettings"));

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS for React dev server (Vite default = 5173)
builder.Services.AddCors(options =>
    options.AddPolicy("AllowFrontend", policy => 
        policy.WithOrigins("http://localhost:5173")
        .AllowAnyHeader() 
        .AllowAnyMethod()));

var app = builder.Build();

//// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("AllowFrontend");

//app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
