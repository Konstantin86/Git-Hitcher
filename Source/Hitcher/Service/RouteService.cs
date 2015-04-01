using System.Collections.Generic;
using System.Linq;
using Hitcher.DataAccess;
using Hitcher.DataAccess.Entities;
using Hitcher.Models.Request;

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
  }
}