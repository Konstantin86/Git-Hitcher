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

    public override IQueryable<Route> GetAll(Expression<Func<Route, bool>> func = null)
    {
      return base.GetAll(func).Include(m => m.Coords).Include(m => m.Recurrency);
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

    public override bool Delete(int id, bool saveChanges = true)
    {
      var route = Get(id);

      if (route == null)
      {
        return false;
      }

      if (route.Recurrency != null)
      {
        var recurrency = _context.RouteRecurrencies.SingleOrDefault(r => r.RouteId == route.Id);
        _context.RouteRecurrencies.Remove(recurrency);
      }

      return base.Delete(id, saveChanges);
    }
  }
}