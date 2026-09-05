using Microsoft.EntityFrameworkCore;
using Quartzwood.Server.Data;
using Quartzwood.Server.Models;

namespace Quartzwood.Server.Repositories;

public class BoxRepository : IBoxRepository
{
    private readonly AppDbContext _context;

    public BoxRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Box?> GetByIdAsync(Guid id)
        => await _context.Boxes
            .Include(b => b.Cards)
            .FirstOrDefaultAsync(b => b.Id == id);

    public async Task<IEnumerable<Box>> GetAllAsync()
        => await _context.Boxes
            .Include(b => b.Cards)
            .ToListAsync();

    public async Task<IEnumerable<Box>> GetByGroupAsync(Guid groupId)
        => await _context.Boxes
            .Where(b => b.GroupId == groupId)
            .Include(b => b.Cards)
            .ToListAsync();

    public async Task<Box> AddAsync(Box box)
    {
        _context.Boxes.Add(box);
        await _context.SaveChangesAsync();
        return box;
    }

    public async Task<Box> UpdateAsync(Box box)
    {
        _context.Boxes.Update(box);
        await _context.SaveChangesAsync();
        return box;
    }

    public async Task DeleteAsync(Guid id)
    {
        var box = await GetByIdAsync(id);
        if (box is not null)
        {
            _context.Boxes.Remove(box);
            await _context.SaveChangesAsync();
        }
    }
}