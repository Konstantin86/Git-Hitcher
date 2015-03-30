using System.Linq;
using System.Web.Http;
using Hitcher.Controllers.Base;
using Hitcher.DataAccess;
using Hitcher.DataAccess.Entities;
using Hitcher.Models.Request;

namespace Hitcher.Controllers
{
  [RoutePrefix("api/route")]
  public class RouteController : ControllerBase
  {
    private readonly IUnitOfWork _unitOfWork;

    public RouteController(IUnitOfWork unitOfWork)
    {
      _unitOfWork = unitOfWork;
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
      var allRoutes = _unitOfWork.RouteRepository.GetAll(m => m.Type == request.Type);

      if (!request.Take.HasValue && !request.Skip.HasValue)
      {
        return Ok(allRoutes);
      }

      var routes = allRoutes.Skip(request.Skip.GetValueOrDefault()).ToList();
      return Ok(routes.Any() ? (request.Take.HasValue ? routes.Take(request.Take.Value) : routes) : null);
    }

    [Route("")]
    [HttpPost]
    public IHttpActionResult Post(Route route)
    {
      int id = _unitOfWork.RouteRepository.Update(route);
      return Ok(id);
    }
  }
}