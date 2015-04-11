﻿using Hitcher.DataAccess.Entities;

namespace Hitcher.Models.Request
{
  public class PostRouteRequest
  {
    public int Id { get; set; }
    public string Name { get; set; }
    public string Phone { get; set; }
    public string StartName { get; set; }
    public string EndName { get; set; }
    public string StartLatLng { get; set; }
    public string EndLatLng { get; set; }
    public int Type { get; set; }
    public int TotalDistance { get; set; }
    public int TotalDuration { get; set; }
    public Coord[] Path { get; set; }
  }

  //public class Coord
  //{
  //  public float Lat { get; set; }
  //  public float Lng { get; set; }
  //}

}