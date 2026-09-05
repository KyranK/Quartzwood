using Quartzwood.Server.DTOs;

namespace Quartzwood.Server.Services.Cards;

public interface ICardQueryService
{
    Task<CardDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<CardDto>> GetAllAsync();
    Task<IEnumerable<CardDto>> GetByBoxAsync(Guid boxId);
}