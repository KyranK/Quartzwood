using Microsoft.EntityFrameworkCore;
using Quartzwood.Server.Models;

namespace Quartzwood.Server.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Entity> Entities { get; set; }
    public DbSet<Group> Groups { get; set; }
    public DbSet<Box> Boxes { get; set; }
    public DbSet<CardInstance> Cards { get; set; }
    public DbSet<Tag> Tags { get; set; }
    public DbSet<CardTag> CardTags { get; set; }
}