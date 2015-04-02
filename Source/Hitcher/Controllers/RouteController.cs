﻿using System.Collections.Generic;
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
  [RoutePrefix("api/route")]
  public class RouteController : ControllerBase
  {
    private readonly IUnitOfWork _unitOfWork;
    private readonly IRouteService _routeService;

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
      List<Route> allRoutes;

      if (request.StartLat.HasValue && request.StartLng.HasValue && request.EndLat.HasValue && request.EndLng.HasValue)
      {
        var enumerable = _routeService.Get(request.StartLat.Value, request.StartLng.Value, request.EndLat.Value, request.EndLng.Value);
        return Ok(enumerable);
      }
      else
      {
        allRoutes = _unitOfWork.RouteRepository.GetAll(m => m.Type == request.Type).ToList();
      }
      //var allRoutes = _unitOfWork.RouteRepository.GetAll(m => m.Type == request.Type).Include(m => m.Coords);

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
      //int id = _unitOfWork.RouteRepository.Update(route);
      return Ok(id);
      return Ok(1);
    }
  }
}