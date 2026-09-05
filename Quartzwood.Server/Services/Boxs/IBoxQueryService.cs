using Quartzwood.Server.DTOs;

namespace Quartzwood.Server.Services.Boxs;

public interface IBoxQueryService
{
    Task<BoxDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<BoxDto>> GetAllAsync();
    Task<IEnumerable<BoxDto>> GetByGroupAsync(Guid groupId);
}