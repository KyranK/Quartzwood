using System.ComponentModel.DataAnnotations;

namespace Quartzwood.Server.Models;

public class Group
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    
    [Required]
    public string Name { get; set; } = string.Empty;
    
    public string? Description { get; set; }
    
    // Either owned by Entity OR nested under another Group
    public Guid? EntityId { get; set; }
    public Entity? Entity { get; set; }
    
    public Guid? ParentGroupId { get; set; }
    public Group? ParentGroup { get; set; }
    
    // Navigation
    public ICollection<Group> ChildGroups { get; set; } = new List<Group>();
    public ICollection<Box> Boxes { get; set; } = new List<Box>();
}