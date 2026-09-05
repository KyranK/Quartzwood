using Quartzwood.Server.DTOs;
using Quartzwood.Server.Models;
using Quartzwood.Server.Repositories;

namespace Quartzwood.Server.Services;

public class BoxCommandService : IBoxCommandService
{
    private readonly IBoxRepository _boxes;

    public BoxCommandService(IBoxRepository boxes)
    {
        _boxes = boxes;
    }

    public async Task<BoxDto> AddAsync(AddBoxDto dto)
    {
        var box = new Box
        {
            Name = dto.Name,
            GroupId = dto.GroupId
        };

        var created = await _boxes.AddAsync(box);
        return ToDto(created);
    }

    public async Task<BoxDto?> UpdateAsync(Guid id, UpdateBoxDto dto)
    {
        var box = await _boxes.GetByIdAsync(id);
        if (box is null) return null;

        if (dto.Name != null) box.Name = dto.Name;
        if (dto.GroupId.HasValue) box.GroupId = dto.GroupId.Value;

        var updated = await _boxes.UpdateAsync(box);
        return ToDto(updated);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var box = await _boxes.GetByIdAsync(id);
        if (box is null) return false;
        await _boxes.DeleteAsync(id);
        return true;
    }

    private static BoxDto ToDto(Box b) => new(
        b.Id,
        b.Name,
        b.GroupId,
        b.Cards.Count
    );
}