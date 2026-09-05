using Microsoft.AspNetCore.Mvc;
using Quartzwood.Server.DTOs;
using Quartzwood.Server.Services;

namespace Quartzwood.Server.Controllers;

[ApiController]
[Route("api/cards")]
public class CardsController : ControllerBase
{
    private readonly ICardQueryService _query;
    private readonly ICardCommandService _command;

    public CardsController(ICardQueryService query, ICardCommandService command)
    {
        _query = query;
        _command = command;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _query.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var card = await _query.GetByIdAsync(id);
        return card is null ? NotFound() : Ok(card);
    }

    [HttpPost]
    public async Task<IActionResult> Add(AddCardDto dto)
    {
        try
        {
            var created = await _command.AddAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateCardDto dto)
    {
        var updated = await _command.UpdateAsync(id, dto);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _command.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}