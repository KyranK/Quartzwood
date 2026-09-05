using Quartzwood.Server.DTOs;

namespace Quartzwood.Server.Services;

public interface IBoxCommandService
{
    Task<BoxDto> AddAsync(AddBoxDto dto);
    Task<BoxDto?> UpdateAsync(Guid id, UpdateBoxDto dto);
    Task<bool> DeleteAsync(Guid id);
}