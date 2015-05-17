using Hitcher.Core.Recurrency.Extensions;
using Hitcher.Core.Recurrency.Models;
using Hitcher.Core.Recurrency.Services;
using Hitcher.DataAccess.Entities;
using Hitcher.Models.Response;

namespace Hitcher.Models.Factory
{
  public class RouteFactory
  {
    public RouteResponse CreateRouteResponse(Route route)
    {
      var routeResponse = new RouteResponse(route);

      if (route.Recurrency != null)
      {
        var routeRecurrencyResponse = new RouteRecurrencyResponse();
        var routeRecurrencyResolver = new RouteRecurrencyResolver(route);
        routeRecurrencyResponse.NextTime = routeRecurrencyResolver.OccurNext();
        routeResponse.Recurrency = routeRecurrencyResponse;

        if (route.Recurrency.Mode == 1)
        {
          routeResponse.Recurrency.RecurrencyInfo = ((WeekDays)route.Recurrency.Weekdays).ToFormattedString();
        }
        else
        {
          routeResponse.Recurrency.RecurrencyInfo = string.Format("Каждые {0} {1}", route.Recurrency.Interval,
            route.Recurrency.Mode == 0 ? "дней" : "Месяцев");
        }

        routeResponse.StartTime = routeRecurrencyResponse.NextTime.GetValueOrDefault();
      }

      return routeResponse;
    }
  }
}