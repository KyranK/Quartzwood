using Microsoft.AspNetCore.Mvc;
using Quartzwood.Server.DTOs;
using Quartzwood.Server.Models;
using Quartzwood.Server.Repositories;

namespace Quartzwood.Server.Controllers;

[ApiController]
[Route("api/cards")]
public class CardsController : ControllerBase
{
    private readonly ICardRepository _cards;

    public CardsController(ICardRepository cards)
    {
        _cards = cards;
    }

    // GET api/cards
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var cards = await _cards.GetAllAsync();
        return Ok(cards.Select(ToDto));
    }

    // GET api/cards/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var card = await _cards.GetByIdAsync(id);
        if (card is null) return NotFound();
        return Ok(ToDto(card));
    }

    // POST api/cards
    [HttpPost]
    public async Task<IActionResult> Add(AddCardDto dto)
    {
        if (!Enum.TryParse<Condition>(dto.Condition, true, out var condition))
            return BadRequest($"Invalid condition: {dto.Condition}");

        if (!Enum.TryParse<FoilType>(dto.FoilType, true, out var foilType))
            return BadRequest($"Invalid foil type: {dto.FoilType}");

        if (!Enum.TryParse<StampType>(dto.StampType, true, out var stampType))
            return BadRequest($"Invalid stamp type: {dto.StampType}");

        var card = new CardInstance
        {
            SetCode = dto.SetCode,
            SetNumber = dto.SetNumber,
            Name = dto.Name,
            Condition = condition,
            FoilType = foilType,
            StampType = stampType,
            Language = dto.Language,
            IsProxy = dto.IsProxy,
            IsSigned = dto.IsSigned,
            AlterArtist = dto.AlterArtist,
            Notes = dto.Notes,
            BoxId = dto.BoxId,
            AcquiredDate = dto.AcquiredDate,
            PurchasePrice = dto.PurchasePrice,
            NameSource = dto.Name != null ? NameSource.Manual : NameSource.Unknown
        };

        var created = await _cards.AddAsync(card);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ToDto(created));
    }

    // PUT api/cards/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateCardDto dto)
    {
        var card = await _cards.GetByIdAsync(id);
        if (card is null) return NotFound();

        if (dto.Condition != null && Enum.TryParse<Condition>(dto.Condition, true, out var condition))
            card.Condition = condition;
        if (dto.FoilType != null && Enum.TryParse<FoilType>(dto.FoilType, true, out var foilType))
            card.FoilType = foilType;
        if (dto.StampType != null && Enum.TryParse<StampType>(dto.StampType, true, out var stampType))
            card.StampType = stampType;
        if (dto.SetCode != null) card.SetCode = dto.SetCode;
        if (dto.SetNumber != null) card.SetNumber = dto.SetNumber;
        if (dto.Name != null) { card.Name = dto.Name; card.NameSource = NameSource.Manual; }
        if (dto.Language != null) card.Language = dto.Language;
        if (dto.IsProxy.HasValue) card.IsProxy = dto.IsProxy.Value;
        if (dto.IsSigned.HasValue) card.IsSigned = dto.IsSigned.Value;
        if (dto.AlterArtist != null) card.AlterArtist = dto.AlterArtist;
        if (dto.Notes != null) card.Notes = dto.Notes;
        if (dto.BoxId.HasValue) card.BoxId = dto.BoxId.Value;
        if (dto.AcquiredDate.HasValue) card.AcquiredDate = dto.AcquiredDate.Value;
        if (dto.PurchasePrice.HasValue) card.PurchasePrice = dto.PurchasePrice.Value;

        var updated = await _cards.UpdateAsync(card);
        return Ok(ToDto(updated));
    }

    // DELETE api/cards/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var card = await _cards.GetByIdAsync(id);
        if (card is null) return NotFound();
        await _cards.DeleteAsync(id);
        return NoContent();
    }

    private static CardDto ToDto(CardInstance c) => new(
        c.Id,
        c.Name,
        c.SetCode,
        c.SetNumber,
        c.ScryfallId,
        c.Condition.ToString(),
        c.FoilType.ToString(),
        c.StampType.ToString(),
        c.Language,
        c.IsProxy,
        c.IsSigned,
        c.AlterArtist,
        c.Notes,
        c.BoxId,
        c.CardTags.Select(ct => ct.Tag.Name)
    );
}