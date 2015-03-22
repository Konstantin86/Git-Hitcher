using System.Data.Entity;
using Hitcher.DataAccess.Entities;
using Microsoft.AspNet.Identity.EntityFramework;

namespace Hitcher.DataAccess
{
  public class AppDbContext : IdentityDbContext<AppUser>
  {
    public DbSet<Route> Routes { get; set; }

    public AppDbContext()
      : base("DefaultConnection", throwIfV1Schema: false)
    {
    }

    public static AppDbContext Create()
    {
      return new AppDbContext();
    }
  }
}