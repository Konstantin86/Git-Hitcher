using System.Data.Entity;
using Hitcher.DataAccess.Entities;
using Microsoft.AspNet.Identity.EntityFramework;

namespace Hitcher.DataAccess
{
  public class AppDbContext : IdentityDbContext<AppUser>
  {
    public DbSet<Route> Routes { get; set; }

    public DbSet<Coord> Coords { get; set; }

    public AppDbContext()
      : base("DefaultConnection", throwIfV1Schema: false)
    {
      Configuration.ProxyCreationEnabled = false;   // Because ASP.NET Web Api cannot serialize dynamic proxy objects. They appear when some entities have lazy loaded related entities.
    }

    public static AppDbContext Create()
    {
      return new AppDbContext();
    }

    //protected override void OnModelCreating(DbModelBuilder modelBuilder)
    //{
    //  modelBuilder.Entity<AppUser>()
    //      .HasRequired(a => a.Routes)
    //      .WithRequiredDependent()
    //      .WillCascadeOnDelete(true);

    //  base.OnModelCreating(modelBuilder);
    //}
  }
}