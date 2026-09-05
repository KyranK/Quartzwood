using Microsoft.EntityFrameworkCore;
using Quartzwood.Server.Data;
using Quartzwood.Server.Models;

namespace Quartzwood.Server.Repositories;

public class EntityRepository : IEntityRepository
{
    private readonly AppDbContext _context;

    public EntityRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Entity?> GetByIdAsync(Guid id)
        => await _context.Entities
            .Include(e => e.Groups)
            .FirstOrDefaultAsync(e => e.Id == id);

    public async Task<IEnumerable<Entity>> GetAllAsync()
        => await _context.Entities
            .Include(e => e.Groups)
            .ToListAsync();

    public async Task<Entity> AddAsync(Entity entity)
    {
        _context.Entities.Add(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task<Entity> UpdateAsync(Entity entity)
    {
        _context.Entities.Update(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task DeleteAsync(Guid id)
    {
        var entity = await GetByIdAsync(id);
        if (entity is not null)
        {
            _context.Entities.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}