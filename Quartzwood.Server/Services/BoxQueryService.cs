using Quartzwood.Server.DTOs;
using Quartzwood.Server.Models;
using Quartzwood.Server.Repositories;

namespace Quartzwood.Server.Services;

public class BoxQueryService : IBoxQueryService
{
    private readonly IBoxRepository _boxes;

    public BoxQueryService(IBoxRepository boxes)
    {
        _boxes = boxes;
    }

    public async Task<BoxDto?> GetByIdAsync(Guid id)
    {
        var box = await _boxes.GetByIdAsync(id);
        return box is null ? null : ToDto(box);
    }

    public async Task<IEnumerable<BoxDto>> GetAllAsync()
    {
        var boxes = await _boxes.GetAllAsync();
        return boxes.Select(ToDto);
    }

    public async Task<IEnumerable<BoxDto>> GetByGroupAsync(Guid groupId)
    {
        var boxes = await _boxes.GetByGroupAsync(groupId);
        return boxes.Select(ToDto);
    }

    private static BoxDto ToDto(Box b) => new(
        b.Id,
        b.Name,
        b.GroupId,
        b.Cards.Count
    );
}