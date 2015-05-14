using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using Hitcher.DataAccess.Entities.Base;

namespace Hitcher.DataAccess.Entities
{
  // It's Value object with no identity. 
  // Since route recurrency doesn't have any sense without route itself, it's essentially one-to-zero relation between route and route recurrency
  // Some stubs are temporary used to access route recurrency since normal repo is bound to identities (those entities which have "Id").
  public class RouteRecurrency
  {
    public int Mode { get; set; }
    public int Interval { get; set; }
    public int Weekdays { get; set; }

    [Key, ForeignKey("Route")]
    public int RouteId { get; set; }
    public virtual Route Route { get; set; }
  }
}