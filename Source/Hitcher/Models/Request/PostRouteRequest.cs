using System;
using Hitcher.DataAccess.Entities;

namespace Hitcher.Models.Request
{
  public class PostRouteRequest
  {
    public int Id { get; set; }
    public string UserId { get; set; }
    public string Name { get; set; }
    public string Phone { get; set; }
    public string StartName { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime DueDate { get; set; }
    public string EndName { get; set; }
    public string StartLatLng { get; set; }
    public string EndLatLng { get; set; }
    public int Type { get; set; }
    public int TotalDistance { get; set; }
    public int TotalDuration { get; set; }
    public Coord[] Path { get; set; }

    public bool Recurrency { get; set; }
    public int RecurrencyMode { get; set; }
    public int RecurrencyInterval { get; set; }

    public bool RecurrencyWeeklyMon { get; set; }
    public bool RecurrencyWeeklyTue { get; set; }
    public bool RecurrencyWeeklyWed { get; set; }
    public bool RecurrencyWeeklyThr { get; set; }
    public bool RecurrencyWeeklyFri { get; set; }
    public bool RecurrencyWeeklySat { get; set; }
    public bool RecurrencyWeeklySun { get; set; }
  }
}