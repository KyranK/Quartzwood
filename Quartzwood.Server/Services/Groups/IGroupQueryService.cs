using Quartzwood.Server.DTOs;

namespace Quartzwood.Server.Services.Groups;

public interface IGroupQueryService
{
    Task<GroupDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<GroupDto>> GetAllAsync();
    Task<IEnumerable<GroupDto>> GetByEntityAsync(Guid entityId);
    Task<IEnumerable<GroupDto>> GetByParentGroupAsync(Guid parentGroupId);
}