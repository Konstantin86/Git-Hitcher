namespace Hitcher.Models.Request
{
  public class QueryRouteRequest : QueryRequestBase
  {
    public int Type { get; set; }

    public float? StartLat { get; set; }

    public float? StartLng { get; set; }

    public float? EndLat { get; set; }

    public float? EndLng { get; set; }

    public bool CurrentUserOnly { get; set; }
  }
}