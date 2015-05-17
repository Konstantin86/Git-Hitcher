using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Hitcher.Core.Services;
using Hitcher.DataAccess;

namespace Hitcher.WebJob
{
  class Program
  {
    static void Main(string[] args)
    {
      // Go over all existing route and remove outdated ones:
      RouteService routeService = new RouteService(new UnitOfWork(AppDbContext.Create()));

      DateTime utcNow = DateTime.Now.ToUniversalTime();
      var allRoutes = routeService.GetAll(false).Where(m => m.DueDate < utcNow).ToList();

      foreach (var route in allRoutes)
      {
        routeService.Delete(route.Id);
      }

      //UnitOfWork _unitOfWork = new UnitOfWork(AppDbContext.Create());
      //_unitOfWork.RouteRepository.Delete(m => m.DueDate <= DateTime.Now);
    }
  }
}
