using Quartzwood.Server.Models;

namespace Quartzwood.Server.Repositories;

public interface IGroupRepository
{
    Task<Group?> GetByIdAsync(Guid id);
    Task<IEnumerable<Group>> GetAllAsync();
    Task<IEnumerable<Group>> GetByEntityAsync(Guid entityId);
    Task<IEnumerable<Group>> GetByParentGroupAsync(Guid parentGroupId);
    Task<Group> AddAsync(Group group);
    Task<Group> UpdateAsync(Group group);
    Task DeleteAsync(Guid id);
}