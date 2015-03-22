using Hitcher.DataAccess.Entities;

namespace Hitcher.DataAccess.Repositories
{
  public class RouteRepository : RepositoryBase<Route>
  {
    public RouteRepository(AppDbContext context) : base(context)
    {
    }

    protected override void OnUpdate(Route entity, Route newEntity, AppDbContext context)
    {
      entity.StartName = newEntity.StartName;
      entity.StartLatLng = newEntity.StartLatLng;
      entity.EndName = newEntity.EndName;
      entity.EndLatLng = newEntity.EndLatLng;
    }
  }
}