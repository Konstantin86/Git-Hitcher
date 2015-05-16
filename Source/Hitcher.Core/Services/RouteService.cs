using System;
using System.Collections.Generic;
using System.Linq;
using Hitcher.Core.Models;
using Hitcher.Core.Recurrency.Helpers;
using Hitcher.Core.Routing;
using Hitcher.DataAccess;
using Hitcher.DataAccess.Entities;
using Hitcher.DataAccess.Extensions;

namespace Hitcher.Core.Services
{
  public class RouteService : IRouteService
  {
    private readonly IUnitOfWork _unitOfWork;

    public RouteService(IUnitOfWork unitOfWork)
    {
      _unitOfWork = unitOfWork;
    }

    public int Save(SaveRouteRequest route)
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
        StartTime = route.StartTime,
        DueDate = route.DueDate,
        Coords = new List<Coord>(),
        Recurrency = routeRecurrency
      };

      if (!route.Recurrency)
      {
        newRoute.DueDate = newRoute.StartTime;
      }

      for (int i = 0; i < route.Path.Length; i++)
      {
        newRoute.Coords.Add(route.Path[i]);
      }

      newRoute.Coords.Remove(newRoute.Coords.Last());
      newRoute.Coords.Add(route.Path.Last());

      return _unitOfWork.RouteRepository.Update(newRoute);
    }

    public IEnumerable<Route> GetAll(bool upToDate = true)
    {
      var allRoutes = _unitOfWork.RouteRepository.GetAll();

      foreach (var route in allRoutes)
      {
        route.Coords = route.Coords.OrderBy(m => m.Id).ToList();
      }

      DateTime utcNow = DateTime.Now.ToUniversalTime();

      return upToDate ? allRoutes.Where(m => m.DueDate >= utcNow) : allRoutes;
    }

    public IEnumerable<Route> Get(float startLat, float startLng, float endLat, float endLng, int resultsCount, int type)
    {
      var routes = GetAll().Where(m => m.Type == type).ToList();
      var distances = routes.ToDictionary(route => route.Id, route => RouteDistanceSelector(startLat, startLng, endLat, endLng, route));
      var topDistance = distances.Where(m => m.Value > 0).OrderBy(m => m.Value).Select(m => m.Key).Take(resultsCount);
      return routes.Where(r => topDistance.Contains(r.Id)).ToList();
    }

    public bool Delete(int id)
    {
      return _unitOfWork.RouteRepository.Delete(id);
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