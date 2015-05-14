using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using Hitcher.DataAccess.Entities.Base;

namespace Hitcher.DataAccess.Entities
{
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