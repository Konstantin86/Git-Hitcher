using System;

using Hitcher.Service.Models;

namespace Hitcher.Service.Recurrency
{
  public class RecurrencyHelper
  {
    public static int GetWeekdays(bool mon, bool tue, bool wed, bool thr, bool fri, bool sat, bool sun)
    {
      return (Convert.ToInt32(mon) * (int)WeekDays.Monday)
          | (Convert.ToInt32(tue) * (int)WeekDays.Tuesday) 
          | (Convert.ToInt32(wed) * (int)WeekDays.Wednesday)
          | (Convert.ToInt32(thr) * (int)WeekDays.Thursday)
          | (Convert.ToInt32(fri) * (int)WeekDays.Friday)
          | (Convert.ToInt32(sat) * (int)WeekDays.Saturday)
          | (Convert.ToInt32(sun) * (int)WeekDays.Sunday);
    }
  }
}