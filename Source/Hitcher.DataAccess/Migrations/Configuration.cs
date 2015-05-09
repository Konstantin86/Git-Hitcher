using System.Collections.Generic;
using Hitcher.DataAccess.Entities;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;

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
      var appDbContext = new AppDbContext();
      var userManager = new UserManager<AppUser>(new UserStore<AppUser>(appDbContext));
      var roleManager = new RoleManager<IdentityRole>(new RoleStore<IdentityRole>(appDbContext));

      //List<AppUser> existingUsers = userManager.Users.ToList();

      //foreach (var usr in existingUsers)
      //{
      //  var roles = userManager.GetRoles(usr.Id);
      //  foreach (var roleName in roles)
      //  {
      //    userManager.RemoveFromRole(usr.Id, roleName);
      //  }
      //}

      List<IdentityRole> existingRoles = roleManager.Roles.ToList();

      if (!existingRoles.Any())
      {
        IdentityRole userRole = new IdentityRole("user");
        IdentityRole adminRole = new IdentityRole("admin");

        roleManager.Create(userRole);
        roleManager.Create(adminRole);
      }
    }
  }
}
