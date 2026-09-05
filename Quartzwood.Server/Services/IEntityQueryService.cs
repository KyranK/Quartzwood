using Quartzwood.Server.DTOs;

namespace Quartzwood.Server.Services;

public interface IEntityQueryService
{
    Task<EntityDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<EntityDto>> GetAllAsync();
}