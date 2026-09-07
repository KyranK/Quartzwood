namespace Quartzwood.Server.DTOs;

public record BreadcrumbDto(
    string? EntityName,
    string? EntityId,
    string? RootGroupName,
    string? RootGroupId,
    bool HasCollapsed,
    string? ParentGroupName,
    string? ParentGroupId,
    string? BoxName,
    string? BoxId
);