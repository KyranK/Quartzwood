using Quartzwood.Server.DTOs;
using Quartzwood.Server.Models;
using Quartzwood.Server.Repositories;

namespace Quartzwood.Server.Services.Groups;

public class GroupQueryService : IGroupQueryService
{
    private readonly IGroupRepository _groups;

    public GroupQueryService(IGroupRepository groups)
    {
        _groups = groups;
    }

    public async Task<GroupDto?> GetByIdAsync(Guid id)
    {
        var group = await _groups.GetByIdAsync(id);
        return group is null ? null : ToDto(group);
    }

    public async Task<IEnumerable<GroupDto>> GetAllAsync()
    {
        var groups = await _groups.GetAllAsync();
        return groups.Select(ToDto);
    }

    public async Task<IEnumerable<GroupDto>> GetByEntityAsync(Guid entityId)
    {
        var groups = await _groups.GetByEntityAsync(entityId);
        return groups.Select(ToDto);
    }

    public async Task<IEnumerable<GroupDto>> GetByParentGroupAsync(Guid parentGroupId)
    {
        var groups = await _groups.GetByParentGroupAsync(parentGroupId);
        return groups.Select(ToDto);
    }

    private static GroupDto ToDto(Group g) => new(
        g.Id,
        g.Name,
        g.Description,
        g.EntityId,
        g.ParentGroupId,
        g.ChildGroups.Select(c => c.Name),
        g.Boxes.Select(b => b.Name)
    );
}