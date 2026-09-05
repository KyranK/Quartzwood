using Quartzwood.Server.Models;

namespace Quartzwood.Server.Repositories;

public interface IEntityRepository
{
    Task<Entity?> GetByIdAsync(Guid id);
    Task<IEnumerable<Entity>> GetAllAsync();
    Task<Entity> AddAsync(Entity entity);
    Task<Entity> UpdateAsync(Entity entity);
    Task DeleteAsync(Guid id);
}