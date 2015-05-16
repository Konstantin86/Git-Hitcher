using System;
using System.Linq;
using Hitcher.Core.Recurrency.Extensions;
using Hitcher.Core.Recurrency.Models;
using Hitcher.Core.Utils;
using Hitcher.DataAccess.Entities;

namespace Hitcher.Core.Recurrency.Services
{
  public class RouteRecurrencyResolver
  {
    private readonly Route _route;

    public RouteRecurrencyResolver(Route route)
    {
      _route = route;
    }

    public DateTime? OccurNext()
    {
      DateTime? result;

      if (_route.Recurrency.Mode == 0)
      {
        result = this.ResolveNextOccurenceDaily();
      }
      else if (_route.Recurrency.Mode == 1)
      {
        result = this.ResolveNextOccurenceWeekly();
      }
      else
      {
        result = this.ResolveNextOccurenceMonthly();
      }

      return result;
    }

    public bool OccurOn(DateTime date)
    {
      if (_route.Recurrency.Mode == 0)
      {
        return this.ResolveDaily(date);
      }

      return _route.Recurrency.Mode == 1 ? this.ResolveWeekly(date) : this.ResolveMonthly(date);
    }

    private bool ResolveMonthly(DateTime dateTime)
    {
      if ((DateTimeHelper.GetMonthCountBetweenDates(dateTime, _route.StartTime.Date) % _route.Recurrency.Interval != 0) || (dateTime.Date > _route.DueDate.Date) || (dateTime.Date < _route.StartTime.Date))
      {
        return false;
      }

      int daysInMonth = DateTime.DaysInMonth(dateTime.Year, dateTime.Month);

      int day = _route.StartTime.Day > daysInMonth ? daysInMonth : _route.StartTime.Day;

      return day == dateTime.Day;
    }

    private bool ResolveWeekly(DateTime date)
    {
      return ((WeekDays)_route.Recurrency.Weekdays).Fits(date.DayOfWeek) && (date.Date >= _route.StartTime.Date && date <= _route.DueDate);
    }

    private bool ResolveDaily(DateTime date)
    {
      return ((date - _route.StartTime.Date).Days % _route.Recurrency.Interval == 0) && (date.Date >= _route.StartTime.Date && date <= _route.DueDate);
    }

    // Algorythm is not definitely optimal, though simplicity is cool enough :)
    private DateTime? ResolveNextOccurenceDaily()
    {
      DateTime nextOccurence = DateTimeHelper.DaysBetween(DateTime.Today, _route.DueDate).FirstOrDefault(ResolveDaily);

      return nextOccurence != DateTime.MinValue
        ? (DateTime?)new DateTime(nextOccurence.Year, nextOccurence.Month, nextOccurence.Day, _route.StartTime.Hour, _route.StartTime.Minute, _route.StartTime.Second)
        : null;
    }

    private DateTime? ResolveNextOccurenceWeekly()
    {
      DateTime nextOccurence = DateTimeHelper.DaysBetween(DateTime.Today, _route.DueDate).FirstOrDefault(ResolveWeekly);

      return nextOccurence != DateTime.MinValue
        ? (DateTime?)new DateTime(nextOccurence.Year, nextOccurence.Month, nextOccurence.Day, _route.StartTime.Hour, _route.StartTime.Minute, _route.StartTime.Second)
        : null;
    }

    // Algorythm is not definitely optimal, though simplicity is cool enough :)
    private DateTime? ResolveNextOccurenceMonthly()
    {
      DateTime nextOccurence = DateTimeHelper.DaysBetween(DateTime.Today, _route.DueDate).FirstOrDefault(ResolveMonthly);

      return nextOccurence != DateTime.MinValue
        ? (DateTime?) new DateTime(nextOccurence.Year, nextOccurence.Month, nextOccurence.Day, _route.StartTime.Hour, _route.StartTime.Minute, _route.StartTime.Second)
        : null;
    }
  }
}