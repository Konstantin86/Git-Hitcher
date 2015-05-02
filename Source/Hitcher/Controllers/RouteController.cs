using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using Hitcher.Controllers.Base;
using Hitcher.DataAccess;
using Hitcher.DataAccess.Entities;
using Hitcher.Models.Request;
using Hitcher.Models.Response;
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
    [AllowAnonymous]
    public IHttpActionResult Get(int id)
    {
      var route = _unitOfWork.RouteRepository.Get(r => r.Id == id);
      return route != null ? Ok(route) : (IHttpActionResult)NotFound();
    }

    [Route("")]
    [HttpGet]
    [AllowAnonymous]
    public async Task<IHttpActionResult> Get([FromUri]QueryRouteRequest request)
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

      List<Route> allRoutes = _unitOfWork.RouteRepository.GetAll(m => m.Type == request.Type).Include(m => m.Coords).ToList();

      List<RouteResponse> responseRows = allRoutes.Select(m => new RouteResponse(m)).ToList();

      foreach (var route in responseRows)
      {
        var user = await AppUserManager.FindByIdAsync(route.UserId);

        if (user != null)
        {
          route.Phone = user.PhoneNumber;
          route.Name = user.UserName;
          route.PhotoPath = ConfigurationManager.AppSettings["cdnMediaBase"] + user.PhotoPath;
        }

        route.Coords = route.Coords.OrderBy(m => m.Id).ToList();
      }

      if (!request.Take.HasValue && !request.Skip.HasValue)
      {
        return Ok(responseRows);
      }

      var routes = allRoutes.Skip(request.Skip.GetValueOrDefault()).ToList();
      return Ok(routes.Any() ? (request.Take.HasValue ? routes.Take(request.Take.Value) : routes) : null);
    }

    [Route("")]
    [HttpPost]
    public async Task<IHttpActionResult> Post(PostRouteRequest route)
    {
      var user = await AppUserManager.FindByNameAsync(User.Identity.Name);

      if (user == null)
      {
        return BadRequest("Auth db corrupted");
      }

      route.UserId = user.Id;
      
      int id = _routeService.Save(route);
      return Ok(new { id });
    }
  }
}