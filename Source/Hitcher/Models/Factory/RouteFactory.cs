using Hitcher.DataAccess.Entities;
using Hitcher.Models.Response;
using Hitcher.Service.Recurrency;

namespace Hitcher.Models.Factory
{
  public class RouteFactory
  {
    private readonly RouteRecurrencyResolver _routeRecurrencyResolver;

    public RouteFactory(RouteRecurrencyResolver routeRecurrencyResolver)
    {
      this._routeRecurrencyResolver = routeRecurrencyResolver;
    }

    public RouteResponse CreateRouteResponse(Route route)
     {
       var routeResponse = new RouteResponse(route);

       if (route.Recurrency != null)
       {
         var routeRecurrencyResponse = new RouteRecurrencyResponse();
         routeRecurrencyResponse.NextTime = _routeRecurrencyResolver.GetNextOccurrenceTime(route.Recurrency);
         routeResponse.Recurrency = routeRecurrencyResponse;
       }

       return routeResponse;
     }
  }
}