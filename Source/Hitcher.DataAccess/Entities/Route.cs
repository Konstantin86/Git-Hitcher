using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Hitcher.DataAccess.Entities.Base;

namespace Hitcher.DataAccess.Entities
{
  public class Route : EntityBase
  {
    public string StartName { get; set; }

    public string StartLatLng { get; set; }

    public string EndName { get; set; }

    public string EndLatLng { get; set; } 

    public int TotalDistance { get; set; }

    public int TotalDuration { get; set; }

    public int Type { get; set; }   // 0 - Hitcher, 1 - Driver

    public virtual ICollection<Coord> Coords { get; set; }

    public string UserId { get; set; }
  }
}