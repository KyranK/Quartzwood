using Quartzwood.Server.DTOs;

namespace Quartzwood.Server.Services;

public interface IGroupQueryService
{
    Task<GroupDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<GroupDto>> GetAllAsync();
    Task<IEnumerable<GroupDto>> GetByEntityAsync(Guid entityId);
    Task<IEnumerable<GroupDto>> GetByParentGroupAsync(Guid parentGroupId);
}