using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using Hitcher.Controllers.Base;
using Hitcher.DataAccess;
using Hitcher.DataAccess.Entities;
using Hitcher.Models.Factory;
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
    public IHttpActionResult Get()
    {
      var route = _unitOfWork.RouteRepository.GetAll().Include(m => m.Coords).OrderByDescending(m => m.Id).FirstOrDefault();
      return route != null ? Ok(route) : (IHttpActionResult)NotFound();
    }

    [Route("")]
    [HttpDelete]
    public async Task<IHttpActionResult> Delete(int id)
    {
      var route = _unitOfWork.RouteRepository.Get(m => m.Id == id);

      if (route == null)
      {
        return NotFound();
      }

      if (route.Recurrency != null)
      {
        var recurrency = _unitOfWork.DbContext.RouteRecurrencies.SingleOrDefault(m => m.RouteId == id);
        _unitOfWork.DbContext.RouteRecurrencies.Remove(recurrency);
      }

      _unitOfWork.RouteRepository.Delete(m => m.Id == id);

      return Ok(id);
    }

    [Route("")]
    [HttpGet]
    [AllowAnonymous]
    public async Task<IHttpActionResult> Get([FromUri]QueryRouteRequest request)
    {
      List<Route> allRoutes;
      AppUser user = await AppUserManager.FindByNameAsync(User.Identity.Name);

      // "My Routes" command is called
      if (request != null && request.CurrentUserOnly)
      {
        if (user == null)
        {
          return NotFound();
        }

        allRoutes = _unitOfWork.RouteRepository.GetAll(m => m.UserId == user.Id).Include(m => m.Coords).ToList();
      }
      // "Search" command is called
      else if (request != null && request.StartLat.HasValue && request.StartLng.HasValue && request.EndLat.HasValue && request.EndLng.HasValue)
      {
        int resultsCount = request.Take ?? DefaultResultsCount;
        allRoutes = _routeService.Get(request.StartLat.Value, request.StartLng.Value, request.EndLat.Value, request.EndLng.Value, resultsCount, request.Type).ToList();

        // Begin https://github.com/Konstantin86/Git-Hitcher/issues/33 Do not show own routes
        if (user != null)
        {
          allRoutes = allRoutes.Where(m => m.UserId != user.Id).ToList();
        }
        // End 

        foreach (var route in allRoutes)
        {
          route.Coords = route.Coords.OrderBy(m => m.Id).ToList();
        }
      }
      // Usual "GetAll", called when user changes mode to see available routes
      else
      {
        allRoutes = _unitOfWork.RouteRepository.GetAll(m => m.Type == request.Type).Include(m => m.Coords).ToList();
      }

      List<RouteResponse> responseRows = allRoutes.Where(m => m.DueDate >= DateTime.Now.ToUniversalTime()).Select(m => _routeFactory.CreateRouteResponse(m)).ToList();

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

        route.Coords = route.Coords.OrderBy(m => m.Id).ToList();
      }

      if ((!request.Take.HasValue && !request.Skip.HasValue) || request.CurrentUserOnly)
      {
        return Ok(responseRows);
      }

      var routes = responseRows.Skip(request.Skip.GetValueOrDefault()).ToList();
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