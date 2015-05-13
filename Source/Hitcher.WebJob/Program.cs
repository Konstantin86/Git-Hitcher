using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Hitcher.DataAccess;

namespace Hitcher.WebJob
{
  class Program
  {
    static void Main(string[] args)
    {
      // Go over all existing route and remove outdated ones:
      UnitOfWork _unitOfWork = new UnitOfWork(AppDbContext.Create());
      _unitOfWork.RouteRepository.Delete(m => m.StartTime <= DateTime.Now);
    }
  }
}
