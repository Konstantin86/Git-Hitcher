using System.Collections.Generic;
using Hitcher.Core.Models;
using Hitcher.DataAccess.Entities;

namespace Hitcher.Core.Services
{
  public interface IRouteService
  {
    int Save(SaveRouteRequest route);
    IEnumerable<Route> GetAll(bool upToDate = true);
    IEnumerable<Route> Get(float startLat, float startLng, float endLat, float endLng, int resultsCount, int type);
    bool Delete(int id);
  }
}