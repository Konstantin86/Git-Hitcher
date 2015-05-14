using System;
using System.Data.Entity;
using System.Linq;
using System.Linq.Expressions;

using Hitcher.DataAccess.Entities;

namespace Hitcher.DataAccess.Repositories
{
  public class RouteRepository : RepositoryBase<Route>
  {
    public RouteRepository(AppDbContext context) : base(context)
    {
    }

    public override Route Get(Expression<Func<Route, bool>> func)
    {
      return _context.Set<Route>().Include(m => m.Recurrency).FirstOrDefault(func);
    }

    protected override void OnUpdate(Route newEntity, AppDbContext context)
    {
      var entity = GetAll(m => m.Id == newEntity.Id).Include(m => m.Coords).Single();

      foreach (var child in entity.Coords.ToList())
      {
        context.Coords.Remove(child);
      }

      entity.StartName = newEntity.StartName;
      entity.StartLatLng = newEntity.StartLatLng;
      entity.EndName = newEntity.EndName;
      entity.EndLatLng = newEntity.EndLatLng;
      entity.Type = newEntity.Type;
      entity.Coords = newEntity.Coords;
    }
  }
}