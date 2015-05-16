using System;
using System.Collections.Generic;

namespace Hitcher.Core.Utils
{
  public static class DateTimeHelper
  {
    public static IEnumerable<DateTime> DaysBetween(DateTime from, DateTime thru)
    {
      for (var day = from.Date; day.Date <= thru.Date; day = day.AddDays(1))
        yield return day;
    }

    public static int GetMonthCountBetweenDates(DateTime date1, DateTime date2)
    {
      return ((date1.Year - date2.Year) * 12) + date1.Month - date2.Month;
    }

    public static DateTime StartOfWeek(this DateTime dt, DayOfWeek startOfWeek)
    {
      int diff = dt.DayOfWeek - startOfWeek;
      if (diff < 0)
      {
        diff += 7;
      }

      return dt.AddDays(-1 * diff).Date;
    }

    public static DateTime GetDayOfWeek(this DateTime dt, DayOfWeek dayOfWeek)
    {
      return dt.StartOfWeek(DayOfWeek.Monday).NextDay(dayOfWeek);
    }

    public static DateTime NextDay(this DateTime dt, DayOfWeek dayOfWeek)
    {
      DateTime date = dt;

      do
      {
        date = date.AddDays(1);
      } while (date.DayOfWeek != dayOfWeek);

      return date;
    }
  }
}