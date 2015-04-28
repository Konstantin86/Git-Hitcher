using System.Data.Entity;
using System.Linq;
using System.Web.Http;
using Hitcher.Controllers.Base;
using Hitcher.DataAccess;
using Hitcher.DataAccess.Entities;
using Hitcher.Models.Request;
using Hitcher.Service;

namespace Hitcher.Controllers
{
  [Authorize]
  [RoutePrefix("api/route")]
  public class RouteController : ControllerBase
  {
    private readonly IUnitOfWork _unitOfWork;
    private readonly IRouteService _routeService;

    private const int DefaultResultsCount = 2;

    public RouteController(IUnitOfWork unitOfWork, IRouteService routeService)
    {
      _unitOfWork = unitOfWork;
      _routeService = routeService;
    }

    [Route("")]
    [HttpGet]
    public IHttpActionResult Get(int id)
    {
      var route = _unitOfWork.RouteRepository.Get(r => r.Id == id);
      return route != null ? Ok(route) : (IHttpActionResult)NotFound();
    }

    [Route("")]
    [HttpGet]
    public IHttpActionResult Get([FromUri]QueryRouteRequest request)
    {
      if (request != null && request.StartLat.HasValue && request.StartLng.HasValue && request.EndLat.HasValue && request.EndLng.HasValue)
      {
        int resultsCount = request.Take ?? DefaultResultsCount;
        var enumerable = _routeService.Get(request.StartLat.Value, request.StartLng.Value, request.EndLat.Value, request.EndLng.Value, resultsCount).ToList();

        foreach (var route in enumerable)
        {
          route.Coords = route.Coords.OrderBy(m => m.Id).ToList();
        }

        return Ok(enumerable);
      }

      IQueryable<Route> allRoutes = _unitOfWork.RouteRepository.GetAll(m => m.Type == request.Type).Include(m => m.Coords);

      foreach (var route in allRoutes)
      {
        route.Coords = route.Coords.OrderBy(m => m.Id).ToList();
      }

      if (!request.Take.HasValue && !request.Skip.HasValue)
      {
        return Ok(allRoutes);
      }

      var routes = allRoutes.Skip(request.Skip.GetValueOrDefault()).ToList();
      return Ok(routes.Any() ? (request.Take.HasValue ? routes.Take(request.Take.Value) : routes) : null);
    }

    [Route("")]
    [HttpPost]
    public IHttpActionResult Post(PostRouteRequest route)
    {
      int id = _routeService.Save(route);
      return Ok(new { id });
    }
  }
}