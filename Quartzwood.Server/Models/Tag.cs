using System.ComponentModel.DataAnnotations;

namespace Quartzwood.Server.Models;

public class Tag
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string Name { get; set; } = string.Empty;

    // Navigation
    public ICollection<CardTag> CardTags { get; set; } = new List<CardTag>();
}