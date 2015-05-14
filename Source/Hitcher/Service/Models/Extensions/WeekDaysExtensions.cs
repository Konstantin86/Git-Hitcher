using System;
using System.Collections.Generic;

namespace Hitcher.Service.Models.Extensions
{
  public static class WeekDaysExtensions
  {
    private static readonly Dictionary<DayOfWeek, WeekDays> _weekDay = new Dictionary<DayOfWeek, WeekDays>
                                                                         {
                                                                           { DayOfWeek.Monday, WeekDays.Monday },
                                                                           { DayOfWeek.Tuesday, WeekDays.Tuesday },
                                                                           { DayOfWeek.Wednesday, WeekDays.Wednesday },
                                                                           { DayOfWeek.Thursday, WeekDays.Thursday },
                                                                           { DayOfWeek.Friday, WeekDays.Friday },
                                                                           { DayOfWeek.Saturday, WeekDays.Saturday },
                                                                           { DayOfWeek.Sunday, WeekDays.Sunday }
                                                                         };

    public static bool Fits(this WeekDays weekDays, DayOfWeek dayOfWeek)
    {
      return (weekDays & _weekDay[dayOfWeek]) == _weekDay[dayOfWeek];
    }
  }
}