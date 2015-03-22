using Hitcher.DataAccess.Entities;

namespace Hitcher.DataAccess.Migrations
{
  using System;
  using System.Data.Entity;
  using System.Data.Entity.Migrations;
  using System.Linq;

  internal sealed class Configuration : DbMigrationsConfiguration<Hitcher.DataAccess.AppDbContext>
  {
    public Configuration()
    {
      AutomaticMigrationsEnabled = false;
    }

    protected override void Seed(Hitcher.DataAccess.AppDbContext context)
    {
      //  This method will be called after migrating to the latest version.

      //  You can use the DbSet<T>.AddOrUpdate() helper extension method 
      //  to avoid creating duplicate seed data. E.g.
      //
      //    context.People.AddOrUpdate(
      //      p => p.FullName,
      //      new Person { FullName = "Andrew Peters" },
      //      new Person { FullName = "Brice Lambson" },
      //      new Person { FullName = "Rowan Miller" }
      //    );
      //

      context.Routes.AddRange(new[]
      {
        new Route
        {
          StartLatLng = "49.941001,36.301818000000026",
          StartName = "Харьков, Новгородская 3б",
          EndLatLng = "50.0210186,36.2179946",
          EndName = "Харьков, героев сталинграда 136б"
        },
        new Route
        {
          StartLatLng = "49.922001,36.321818000000026",
          StartName = "Харьков, Новгородская 3б",
          EndLatLng = "50.0410186,36.2079946",
          EndName = "Харьков, героев сталинграда 136б"
        },
        new Route
        {
          StartLatLng = "49.522001,36.021818000000026",
          StartName = "Харьков, Новгородская 3б",
          EndLatLng = "51.0410186,35.9079946",
          EndName = "Харьков, героев сталинграда 136б"
        }
      });
    }
  }
}
