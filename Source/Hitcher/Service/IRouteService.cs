using System.Collections.Generic;
using Hitcher.DataAccess.Entities;
using Hitcher.Models.Request;

namespace Hitcher.Service
{
  public interface IRouteService
  {
    int Save(PostRouteRequest route);
    IEnumerable<Route> Get(float startLat, float startLng, float endLat, float endLng, int resultsCount);
  }
}