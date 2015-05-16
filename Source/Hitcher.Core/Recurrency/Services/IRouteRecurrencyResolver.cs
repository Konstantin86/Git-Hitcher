using System;

namespace Hitcher.Core.Recurrency.Services
{
  public interface IRouteRecurrencyResolver
  {
    DateTime? OccurNext();
    bool OccurOn(DateTime date);
  }
}