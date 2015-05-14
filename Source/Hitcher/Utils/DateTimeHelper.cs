using System;
using System.Collections.Generic;

namespace Hitcher.Utils
{
  public class DateTimeHelper
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
  }
}