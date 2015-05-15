using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using Hitcher.Core.Recurrency.Helpers;
using Hitcher.DataAccess;
using Hitcher.DataAccess.Entities;
using Hitcher.DataAccess.Extensions;
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
      RouteRecurrency routeRecurrency = null;
      if (route.Recurrency)
      {
        routeRecurrency = new RouteRecurrency();
        routeRecurrency.Mode = route.RecurrencyMode;
        routeRecurrency.Interval = route.RecurrencyInterval;
        routeRecurrency.Weekdays = RecurrencyHelper.GetWeekdays(route.RecurrencyWeeklyMon, route.RecurrencyWeeklyTue, route.RecurrencyWeeklyWed, route.RecurrencyWeeklyThr, route.RecurrencyWeeklyFri, route.RecurrencyWeeklySat, route.RecurrencyWeeklySun);
      }

      Route newRoute = new Route
      {
        Id = route.Id,
        UserId = route.UserId,
        EndLatLng = route.EndLatLng,
        StartLatLng = route.StartLatLng,
        StartName = route.StartName,
        EndName = route.EndName,
        TotalDistance = route.TotalDistance,
        TotalDuration = route.TotalDuration,
        Type = route.Type,
        StartTime = route.StartTime.ToLocalTime(),    // TODO Probably wrong way of doing so on the server, we need to bind to local time of individual client and do nothing with it on server side. 
        DueDate = route.DueDate.ToLocalTime(),
        Coords = new List<Coord>(),
        Recurrency = routeRecurrency
      };

      if (!route.Recurrency)
      {
        newRoute.DueDate = route.StartTime;
      }

      //int incr = route.Path.Length / ((route.TotalDistance / 1000) * 3);

      for (int i = 0; i < route.Path.Length; i++)
      {
        newRoute.Coords.Add(route.Path[i]);
      }

      newRoute.Coords.Remove(newRoute.Coords.Last());
      newRoute.Coords.Add(route.Path.Last());

      return _unitOfWork.RouteRepository.Update(newRoute);
    }

    public IEnumerable<Route> Get(float startLat, float startLng, float endLat, float endLng, int resultsCount, int type)
    {
      var routes = _unitOfWork.RouteRepository.GetAll(m => m.Type == type).Include(m => m.Coords).ToList();

      var distances = routes.ToDictionary(route => route.Id, route => RouteDistanceSelector(startLat, startLng, endLat, endLng, route));

      var top2Dist = distances.Where(m => m.Value > 0).OrderBy(m => m.Value).Select(m => m.Key).Take(resultsCount);

      return routes.Where(r => top2Dist.Contains(r.Id));
    }

    private static double RouteDistanceSelector(float startLat, float startLng, float endLat, float endLng, Route route)
    {
      double minFromStart = route.Coords.Select(m => DistanceAlgorithm.DistanceBetweenPlaces(startLng, startLat, m.Lng, m.Lat)).Min();
      double minFromEnd = route.Coords.Select(m => DistanceAlgorithm.DistanceBetweenPlaces(endLng, endLat, m.Lng, m.Lat)).Min();

      double[] routeStartLatLng = route.ParseStartCoords();
      double routeStartLat = routeStartLatLng[0];
      double routeStartLng = routeStartLatLng[1];

      double[] routeEndLatLng = route.ParseEndCoords();
      double routeEndLat = routeEndLatLng[0];
      double routeEndLng = routeEndLatLng[1];

      double startFromStart = DistanceAlgorithm.DistanceBetweenPlaces(startLng, startLat, routeStartLng, routeStartLat);
      double endFromEnd = DistanceAlgorithm.DistanceBetweenPlaces(endLng, endLat, routeEndLng, routeEndLat);

      // Filter distances:
      if (minFromStart > 5 || minFromEnd > 5)
      {
        return 0;
      }

      //return minFromStart + minFromEnd;
      return minFromStart + minFromEnd + startFromStart + endFromEnd;
    }
  }
}