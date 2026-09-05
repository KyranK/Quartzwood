using Microsoft.AspNetCore.Mvc;
using Quartzwood.Server.DTOs;
using Quartzwood.Server.Services;

namespace Quartzwood.Server.Controllers;

[ApiController]
[Route("api/groups")]
public class GroupsController : ControllerBase
{
    private readonly IGroupQueryService _query;
    private readonly IGroupCommandService _command;

    public GroupsController(IGroupQueryService query, IGroupCommandService command)
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
        var group = await _query.GetByIdAsync(id);
        return group is null ? NotFound() : Ok(group);
    }

    [HttpGet("by-entity/{entityId}")]
    public async Task<IActionResult> GetByEntity(Guid entityId)
        => Ok(await _query.GetByEntityAsync(entityId));

    [HttpGet("by-parent/{parentId}")]
    public async Task<IActionResult> GetByParent(Guid parentId)
        => Ok(await _query.GetByParentGroupAsync(parentId));

    [HttpPost]
    public async Task<IActionResult> Add(AddGroupDto dto)
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
    public async Task<IActionResult> Update(Guid id, UpdateGroupDto dto)
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