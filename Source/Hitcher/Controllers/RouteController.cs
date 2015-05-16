using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using Hitcher.Controllers.Base;
using Hitcher.Core.Models;
using Hitcher.Core.Services;
using Hitcher.DataAccess;
using Hitcher.DataAccess.Entities;
using Hitcher.Models.Factory;
using Hitcher.Models.Request;
using Hitcher.Models.Response;

namespace Hitcher.Controllers
{
  [Authorize]
  [RoutePrefix("api/route")]
  public class RouteController : ControllerBase
  {
    private readonly IUnitOfWork _unitOfWork;
    private readonly IRouteService _routeService;
    private readonly RouteFactory _routeFactory;

    private const int DefaultResultsCount = 2;

    public RouteController(IUnitOfWork unitOfWork, IRouteService routeService, RouteFactory routeFactory)
    {
      _unitOfWork = unitOfWork;
      _routeService = routeService;
      _routeFactory = routeFactory;
    }

    [Route("")]
    [HttpGet]
    [AllowAnonymous]
    public IHttpActionResult Get(int id)
    {
      var route = _unitOfWork.RouteRepository.Get(r => r.Id == id);
      return route != null ? Ok(route) : (IHttpActionResult)NotFound();
    }

    [Route("mostRecent")]
    [HttpGet]
    [AllowAnonymous]
    public IHttpActionResult GetMostRecent()
    {
      var route = _unitOfWork.RouteRepository.GetAll().OrderByDescending(m => m.Id).FirstOrDefault();
      return route != null ? Ok(route) : (IHttpActionResult)NotFound();
    }

    [Route("")]
    [HttpDelete]
    public async Task<IHttpActionResult> Delete(int id)
    {
      return _routeService.Delete(id) ? (IHttpActionResult)Ok(id) : NotFound();
    }

    [Route("")]
    [HttpGet]
    [AllowAnonymous]
    public async Task<IHttpActionResult> GetAll([FromUri]QueryRouteRequest request)
    {
      IEnumerable<Route> allRoutes;
      AppUser user = await AppUserManager.FindByNameAsync(User.Identity.Name);

      if (request == null)
      {
        return BadRequest();
      }

      // "My Routes" command is called
      if (request.CurrentUserOnly)
      {
        if (user == null)
        {
          return NotFound();
        }

        allRoutes = _routeService.GetAll().Where(m => m.UserId == user.Id);
      }
      // "Search"
      else if (request.StartLat.HasValue && request.StartLng.HasValue && request.EndLat.HasValue && request.EndLng.HasValue)
      {
        allRoutes = _routeService.Get(request.StartLat.Value, request.StartLng.Value, request.EndLat.Value, request.EndLng.Value, request.Take ?? DefaultResultsCount, request.Type);

        if (user != null)
        {
          allRoutes = allRoutes.Where(m => m.UserId != user.Id).ToList();
        }
      }
      // "Get All" to display all routes on the map for specific role
      else
      {
        allRoutes = _routeService.GetAll().Where(m => m.Type == request.Type);
      }

      return Ok(await GetResponse(allRoutes, user));
    }

    [Route("")]
    [HttpPost]
    public async Task<IHttpActionResult> Save(SaveRouteRequest route)
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

    private async Task<List<RouteResponse>> GetResponse(IEnumerable<Route> allRoutes, AppUser user = null)
    {
      List<RouteResponse> responseRows = allRoutes.Select(m => _routeFactory.CreateRouteResponse(m)).ToList();

      foreach (var route in responseRows)
      {
        var routeUser = await AppUserManager.FindByIdAsync(route.UserId);

        if (routeUser != null)
        {
          route.Phone = routeUser.PhoneNumber;
          route.Name = routeUser.UserName;
          route.PhotoPath = ConfigurationManager.AppSettings["cdnMediaBase"] + routeUser.PhotoPath;
          route.IsCurrentUserRoute = user != null && user.Id == route.UserId;
        }
      }

      return responseRows;
    }
  }
}