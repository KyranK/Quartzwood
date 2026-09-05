using Quartzwood.Server.Models;

namespace Quartzwood.Server.Repositories;

public interface IBoxRepository
{
    Task<Box?> GetByIdAsync(Guid id);
    Task<IEnumerable<Box>> GetAllAsync();
    Task<IEnumerable<Box>> GetByGroupAsync(Guid groupId);
    Task<Box> AddAsync(Box box);
    Task<Box> UpdateAsync(Box box);
    Task DeleteAsync(Guid id);
}