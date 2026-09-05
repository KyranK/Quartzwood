namespace Quartzwood.Server.DTOs;

public record EntityDto(
    Guid Id,
    string Name,
    string Type,
    string? Location,
    IEnumerable<string> GroupNames
);

public record AddEntityDto(
    string Name,
    string Type = "Personal",
    string? Location = null
);

public record UpdateEntityDto(
    string? Name,
    string? Type,
    string? Location
);