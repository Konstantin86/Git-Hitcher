using Hitcher.DataAccess.Entities;
using Hitcher.Models.Request;

namespace Hitcher.Service
{
  public interface IRouteService
  {
    int Save(PostRouteRequest route);
  }
}