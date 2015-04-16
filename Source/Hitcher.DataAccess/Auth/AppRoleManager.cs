using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;

namespace Hitcher.DataAccess.Auth
{
  public class AppRoleManager : RoleManager<IdentityRole>
  {
    public AppRoleManager(IRoleStore<IdentityRole, string> store)
      : base(store)
    {
    }

    public static AppRoleManager Create(IdentityFactoryOptions<AppRoleManager> options, IOwinContext context)
    {
      var appDbContext = context.Get<AppDbContext>();
      var appRoleManager = new AppRoleManager(new RoleStore<IdentityRole>(appDbContext));
      return appRoleManager;
    }
  }
}