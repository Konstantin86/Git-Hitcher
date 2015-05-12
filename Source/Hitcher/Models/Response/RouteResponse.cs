using System;
using System.Collections.Generic;
using Hitcher.DataAccess.Entities;

namespace Hitcher.Models.Response
{
  public class RouteResponse
  {
    public RouteResponse(Route route)
    {
      Id = route.Id;
      StartName = route.StartName;
      StartTime = route.StartTime;
      StartLatLng = route.StartLatLng;
      EndName = route.EndName;
      EndLatLng = route.EndLatLng;
      TotalDistance = route.TotalDistance;
      TotalDuration = route.TotalDuration;
      Type = route.Type;
      Coords = route.Coords;
      UserId = route.UserId;
    }

    public DateTime StartTime { get; set; }

    public int Id { get; set; }

    public string Name { get; set; }

    public string Phone { get; set; }

    public string StartName { get; set; }

    public string StartLatLng { get; set; }

    public string EndName { get; set; }

    public string EndLatLng { get; set; }

    public int TotalDistance { get; set; }

    public int TotalDuration { get; set; }

    public int Type { get; set; }   // 0 - Hitcher, 1 - Driver

    public ICollection<Coord> Coords { get; set; }

    public string UserId { get; set; }

    public string PhotoPath { get; set; }

    public bool IsCurrentUserRoute { get; set; }
  }
}