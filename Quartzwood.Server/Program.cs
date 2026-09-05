using Microsoft.EntityFrameworkCore;
using Quartzwood.Server.Data;
using Quartzwood.Server.Repositories;
// Using Services
using Quartzwood.Server.Services.Boxs;
using Quartzwood.Server.Services.Cards;
using Quartzwood.Server.Services.Entities;
using Quartzwood.Server.Services.Groups;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=quartzwood.db"));

// Repositories
builder.Services.AddScoped<ICardRepository, CardRepository>();
builder.Services.AddScoped<IEntityRepository, EntityRepository>();
builder.Services.AddScoped<IGroupRepository, GroupRepository>();
builder.Services.AddScoped<IBoxRepository, BoxRepository>();

// Query Services
builder.Services.AddScoped<ICardQueryService, CardQueryService>();
builder.Services.AddScoped<IEntityQueryService, EntityQueryService>();
builder.Services.AddScoped<IGroupQueryService, GroupQueryService>();
builder.Services.AddScoped<IBoxQueryService, BoxQueryService>();

// Command Services
builder.Services.AddScoped<ICardCommandService, CardCommandService>();
builder.Services.AddScoped<IEntityCommandService, EntityCommandService>();
builder.Services.AddScoped<IGroupCommandService, GroupCommandService>();
builder.Services.AddScoped<IBoxCommandService, BoxCommandService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.MapControllers();

app.Run();