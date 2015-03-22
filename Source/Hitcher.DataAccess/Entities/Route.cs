using Hitcher.DataAccess.Entities.Base;

namespace Hitcher.DataAccess.Entities
{
  public class Route : EntityBase
  {
    public string StartName { get; set; }

    public string StartLatLng { get; set; }

    public string EndName { get; set; }

    public string EndLatLng { get; set; }
  }
}