namespace Quartzwood.Server.DTOs;

public record GroupDto(
    Guid Id,
    string Name,
    string? Description,
    Guid? EntityId,
    Guid? ParentGroupId,
    IEnumerable<string> ChildGroupNames,
    IEnumerable<string> BoxNames
);

public record AddGroupDto(
    string Name,
    string? Description = null,
    Guid? EntityId = null,
    Guid? ParentGroupId = null
);

public record UpdateGroupDto(
    string? Name,
    string? Description,
    Guid? EntityId,
    Guid? ParentGroupId
);