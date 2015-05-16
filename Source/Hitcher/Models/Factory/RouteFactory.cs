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
      }

      return routeResponse;
    }
  }
}