using Microsoft.AspNetCore.Mvc;
using Quartzwood.Server.DTOs;
using Quartzwood.Server.Services;

namespace Quartzwood.Server.Controllers;

[ApiController]
[Route("api/boxes")]
public class BoxesController : ControllerBase
{
    private readonly IBoxQueryService _query;
    private readonly IBoxCommandService _command;

    public BoxesController(IBoxQueryService query, IBoxCommandService command)
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
        var box = await _query.GetByIdAsync(id);
        return box is null ? NotFound() : Ok(box);
    }

    [HttpGet("by-group/{groupId}")]
    public async Task<IActionResult> GetByGroup(Guid groupId)
        => Ok(await _query.GetByGroupAsync(groupId));

    [HttpPost]
    public async Task<IActionResult> Add(AddBoxDto dto)
    {
        var created = await _command.AddAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateBoxDto dto)
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