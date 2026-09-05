using Quartzwood.Server.Models;

namespace Quartzwood.Server.Repositories;

public interface ICardRepository
{
    Task<CardInstance?> GetByIdAsync(Guid id);
    Task<IEnumerable<CardInstance>> GetAllAsync();
    Task<IEnumerable<CardInstance>> GetByBoxAsync(Guid boxId);
    Task<CardInstance> AddAsync(CardInstance card);
    Task<CardInstance> UpdateAsync(CardInstance card);
    Task DeleteAsync(Guid id);
}