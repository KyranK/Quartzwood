using Quartzwood.Server.DTOs;
using Quartzwood.Server.Models;
using Quartzwood.Server.Repositories;

namespace Quartzwood.Server.Services;

public class EntityCommandService : IEntityCommandService
{
    private readonly IEntityRepository _entities;

    public EntityCommandService(IEntityRepository entities)
    {
        _entities = entities;
    }

    public async Task<EntityDto> AddAsync(AddEntityDto dto)
    {
        if (!Enum.TryParse<EntityType>(dto.Type, true, out var type))
            throw new ArgumentException($"Invalid entity type: {dto.Type}");

        var entity = new Entity
        {
            Name = dto.Name,
            Type = type,
            Location = dto.Location
        };

        var created = await _entities.AddAsync(entity);
        return ToDto(created);
    }

    public async Task<EntityDto?> UpdateAsync(Guid id, UpdateEntityDto dto)
    {
        var entity = await _entities.GetByIdAsync(id);
        if (entity is null) return null;

        if (dto.Name != null) entity.Name = dto.Name;
        if (dto.Location != null) entity.Location = dto.Location;
        if (dto.Type != null && Enum.TryParse<EntityType>(dto.Type, true, out var type))
            entity.Type = type;

        var updated = await _entities.UpdateAsync(entity);
        return ToDto(updated);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _entities.GetByIdAsync(id);
        if (entity is null) return false;
        await _entities.DeleteAsync(id);
        return true;
    }

    private static EntityDto ToDto(Entity e) => new(
        e.Id,
        e.Name,
        e.Type.ToString(),
        e.Location,
        e.Groups.Select(g => g.Name)
    );
}