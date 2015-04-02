using System;

namespace Hitcher.Utils
{
  public class DistanceAlgorithm
  {
    const double PIx = 3.141592653589793;
    const double RADIO = 6378.16;

    /// <summary>
    /// This class cannot be instantiated.
    /// </summary>
    private DistanceAlgorithm() { }

    /// <summary>
    /// Convert degrees to Radians
    /// </summary>
    /// <param name="x">Degrees</param>
    /// <returns>The equivalent in radians</returns>
    public static double Radians(double x)
    {
      return x * PIx / 180;
    }

    /// <summary>
    /// Calculate the distance between two places.
    /// </summary>
    /// <param name="lon1"></param>
    /// <param name="lat1"></param>
    /// <param name="lon2"></param>
    /// <param name="lat2"></param>
    /// <returns></returns>
    public static double DistanceBetweenPlaces(
        double lon1,
        double lat1,
        double lon2,
        double lat2)
    {
      double dlon = Radians(lon2 - lon1);
      double dlat = Radians(lat2 - lat1);

      double a = (Math.Sin(dlat / 2) * Math.Sin(dlat / 2)) + Math.Cos(Radians(lat1)) * Math.Cos(Radians(lat2)) * (Math.Sin(dlon / 2) * Math.Sin(dlon / 2));
      double angle = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
      return (angle * RADIO) * 0.62137;//distance in miles
    }

  }
}