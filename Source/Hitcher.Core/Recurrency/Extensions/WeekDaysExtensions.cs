using System;
using System.Collections.Generic;
using System.Linq;
using Hitcher.Core.Recurrency.Models;

namespace Hitcher.Core.Recurrency.Extensions
{
  public static class WeekDaysExtensions
  {
    private static readonly Dictionary<DayOfWeek, WeekDays> WeekDay = new Dictionary<DayOfWeek, WeekDays>
                                                                         {
                                                                           { DayOfWeek.Monday, WeekDays.Monday },
                                                                           { DayOfWeek.Tuesday, WeekDays.Tuesday },
                                                                           { DayOfWeek.Wednesday, WeekDays.Wednesday },
                                                                           { DayOfWeek.Thursday, WeekDays.Thursday },
                                                                           { DayOfWeek.Friday, WeekDays.Friday },
                                                                           { DayOfWeek.Saturday, WeekDays.Saturday },
                                                                           { DayOfWeek.Sunday, WeekDays.Sunday }
                                                                         };

    public static bool Fits(this WeekDays wd, DayOfWeek dayOfWeek)
    {
      return (wd & WeekDay[dayOfWeek]) == WeekDay[dayOfWeek];
    }

    public static bool Fits(this WeekDays wd, WeekDays weekDay)
    {
      return (wd & weekDay) == weekDay;
    }

    public static string ToFormattedString(this WeekDays wd)
    {
      string mon = wd.Fits(WeekDays.Monday) ? "Пн" : string.Empty;
      string tue = wd.Fits(WeekDays.Tuesday) ? "Вт" : string.Empty;
      string wed = wd.Fits(WeekDays.Wednesday) ? "Ср" : string.Empty;
      string thr = wd.Fits(WeekDays.Thursday) ? "Чт" : string.Empty;
      string fri = wd.Fits(WeekDays.Friday) ? "Пт" : string.Empty;
      string sat = wd.Fits(WeekDays.Saturday) ? "Сб" : string.Empty;
      string sun = wd.Fits(WeekDays.Sunday) ? "Вс" : string.Empty;

      return string.Join(", ", new []{ mon, tue, wed, thr, fri, sat, sun }.Where(s => !string.IsNullOrEmpty(s)));

    }
  }
}