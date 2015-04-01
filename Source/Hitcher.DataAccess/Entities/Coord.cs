using Hitcher.DataAccess.Entities.Base;

namespace Hitcher.DataAccess.Entities
{
  public class Coord : EntityBase
  {
    public float Lat { get; set; }

    public float Lng { get; set; }

    public int RouteId { get; set; }
  }
}