using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using Hitcher.DataAccess;
using Hitcher.DataAccess.Entities;
using Hitcher.Models.Request;
using Hitcher.Utils;

namespace Hitcher.Service
{
  public class RouteService : IRouteService
  {
    private readonly IUnitOfWork _unitOfWork;

    public RouteService(IUnitOfWork unitOfWork)
    {
      _unitOfWork = unitOfWork;
    }

    public int Save(PostRouteRequest route)
    {
      //// TODO save 3 points for 1 km:
      Route newRoute = new Route
      {
        EndLatLng = route.EndLatLng,
        StartLatLng = route.StartLatLng,
        StartName = route.StartName,
        EndName = route.EndName,
        TotalDistance = route.TotalDistance,
        TotalDuration = route.TotalDuration,
        Type = route.Type,
        Coords = new List<Coord>()
      }; 
      
      int incr = route.Path.Length / ((route.TotalDistance / 1000) * 3);

      for (int i = 0; i < route.Path.Length; i += incr)
      {
        newRoute.Coords.Add(route.Path[i]);
      }

      newRoute.Coords.Remove(newRoute.Coords.Last());
      newRoute.Coords.Add(route.Path.Last());

      int id = _unitOfWork.RouteRepository.Update(newRoute);
      return id;
      return 1;
    }

    public IEnumerable<Route> Get(float startLat, float startLng, float endLat, float endLng)
    {
      var routes = _unitOfWork.RouteRepository.GetAll(m => m.Type == 0).Include(m => m.Coords).ToList();

      var distances = new Dictionary<int, double>();

      foreach (var route in routes)
      {
        double minFromStart = 100;
        double minFromEnd = 100;

        foreach (var coord in route.Coords)
        {
          double fromStart = DistanceAlgorithm.DistanceBetweenPlaces(startLng, startLat, coord.Lng, coord.Lat);
          double fromEnd = DistanceAlgorithm.DistanceBetweenPlaces(endLng, endLat, coord.Lng, coord.Lat);

          if (fromStart < minFromStart)
          {
            minFromStart = fromStart;
          }

          if (fromEnd < minFromEnd)
          {
            minFromEnd = fromEnd;
          }
        }

        distances.Add(route.Id, minFromStart + minFromEnd);
      }
      
      return routes.Where(r => r.Id == distances.OrderBy(m => m.Value).First().Key);
    }
  }
}