﻿using System;

namespace Hitcher.Service.Models
{
  // This is should be convertible to int enum (int value should be stored in db)
  // See also http://stackoverflow.com/questions/1285986/flags-enum-bitwise-operations-vs-string-of-bits
  [Flags]
  public enum WeeklyRecurrencyDays
  {
    Monday = 1,
    Tuesday = 2,
    Wednesday = 4,
    Thursday = 8,
    Friday = 16,
    Saturday = 32,
    Sunday = 64
  }
}