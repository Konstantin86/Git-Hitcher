using System;

using Hitcher.DataAccess.Entities;
using Hitcher.Service.Models;
using Hitcher.Service.Models.Extensions;

namespace Hitcher.Service.Recurrency
{
  public class RouteRecurrencyResolver
  {
    public DateTime GetNextOccurrenceTime(RouteRecurrency recurrency)
    {
      DateTime result;

      if (recurrency.Mode == 0)
      {
        result = this.ResolveNextOccurenceDaily(recurrency);
      }
      else if (recurrency.Mode == 1)
      {
        result = this.ResolveNextOccurenceWeekly(recurrency);
      }
      else
      {
        result = this.ResolveNextOccurenceMonthly(recurrency);
      }
      //throw new NotImplementedException();

      return DateTime.Now.AddMonths(2);
    }

    public bool OccurOn(RouteRecurrency recurrency, DateTime dateTime)
    {
      if (recurrency.Mode == 0)
      {
        return this.ResolveDaily(recurrency, dateTime);
      }
      if (recurrency.Mode == 1)
      {
        return this.ResolveWeekly(recurrency, dateTime);
      }

      return this.ResolveMonthly(recurrency, dateTime);
    }

    private bool ResolveMonthly(RouteRecurrency recurrency, DateTime dateTime)
    {
      throw new NotImplementedException();
    }

    private bool ResolveWeekly(RouteRecurrency recurrency, DateTime dateTime)
    {
      throw new NotImplementedException();
    }

    private bool ResolveDaily(RouteRecurrency recurrency, DateTime dateTime)
    {
      throw new NotImplementedException();
    }

    private DateTime ResolveNextOccurenceMonthly(RouteRecurrency recurrency)
    {
      throw new NotImplementedException();
    }

    private DateTime ResolveNextOccurenceWeekly(RouteRecurrency recurrency)
    {
      //if (((WeekDays)recurrency.Weekdays).Fits(DayOfWeek.Friday))
    }

    private DateTime ResolveNextOccurenceDaily(RouteRecurrency recurrency)
    {
      throw new NotImplementedException();
    }
  }
}