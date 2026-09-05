using Quartzwood.Server.DTOs;
using Quartzwood.Server.Models;
using Quartzwood.Server.Repositories;

namespace Quartzwood.Server.Services;

public class EntityQueryService : IEntityQueryService
{
    private readonly IEntityRepository _entities;

    public EntityQueryService(IEntityRepository entities)
    {
        _entities = entities;
    }

    public async Task<EntityDto?> GetByIdAsync(Guid id)
    {
        var entity = await _entities.GetByIdAsync(id);
        return entity is null ? null : ToDto(entity);
    }

    public async Task<IEnumerable<EntityDto>> GetAllAsync()
    {
        var entities = await _entities.GetAllAsync();
        return entities.Select(ToDto);
    }

    private static EntityDto ToDto(Entity e) => new(
        e.Id,
        e.Name,
        e.Type.ToString(),
        e.Location,
        e.Groups.Select(g => g.Name)
    );
}