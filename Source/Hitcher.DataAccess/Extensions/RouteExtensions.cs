using System.Linq;
using Hitcher.DataAccess.Entities;

namespace Hitcher.DataAccess.Extensions
{
  public static class RouteExtensions
  {
    public static double[] ParseStartCoords(this Route route)
    {
      return route.StartLatLng.Split(',').Select(double.Parse).ToArray();
    }

    public static double[] ParseEndCoords(this Route route)
    {
      return route.EndLatLng.Split(',').Select(double.Parse).ToArray();
    }
  }
}