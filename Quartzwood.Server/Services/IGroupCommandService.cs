using Quartzwood.Server.DTOs;

namespace Quartzwood.Server.Services;

public interface IGroupCommandService
{
    Task<GroupDto> AddAsync(AddGroupDto dto);
    Task<GroupDto?> UpdateAsync(Guid id, UpdateGroupDto dto);
    Task<bool> DeleteAsync(Guid id);
}