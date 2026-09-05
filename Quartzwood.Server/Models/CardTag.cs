using System.ComponentModel.DataAnnotations;

namespace Quartzwood.Server.Models;

public class CardTag
{
    public Guid CardInstanceId { get; set; }
    public CardInstance Card { get; set; } = null!;

    public Guid TagId { get; set; }
    public Tag Tag { get; set; } = null!;
}