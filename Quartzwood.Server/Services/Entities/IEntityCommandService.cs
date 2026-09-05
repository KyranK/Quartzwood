using Quartzwood.Server.DTOs;

namespace Quartzwood.Server.Services.Entities;

public interface IEntityCommandService
{
    Task<EntityDto> AddAsync(AddEntityDto dto);
    Task<EntityDto?> UpdateAsync(Guid id, UpdateEntityDto dto);
    Task<bool> DeleteAsync(Guid id);
}