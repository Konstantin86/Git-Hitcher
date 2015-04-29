using System.Net.Http;
using System.Web.Http.Routing;
using Hitcher.DataAccess.Auth;
using Hitcher.DataAccess.Entities;
using Hitcher.Models.Response;

namespace Hitcher.Models.Factory
{
  public class ModelFactory
  {
    private readonly UrlHelper _urlHelper;
    private readonly AppUserManager _appUserManager;

    public ModelFactory(HttpRequestMessage request, AppUserManager appUserManager)
    {
      _urlHelper = new UrlHelper(request);
      _appUserManager = appUserManager;
    }

    public UserResponse Create(AppUser appUser)
    {
      return new UserResponse
      {
        Url = _urlHelper.Link("GetUserById", new { id = appUser.Id }),
        Id = appUser.Id,
        UserName = appUser.UserName,
        FirstName = appUser.FirstName,
        LastName = appUser.LastName,
        FullName = string.Format("{0} {1}", appUser.FirstName, appUser.LastName),
        Email = appUser.Email,
        EmailConfirmed = appUser.EmailConfirmed,
        Gender = appUser.Gender,
        PhoneNumber = appUser.PhoneNumber,
        Country = appUser.Country,
        City = appUser.City,
        BirthDate = appUser.BirthDate,
        JoinDate = appUser.JoinDate,
        PhotoPath = appUser.PhotoPath,
        Roles = _appUserManager.GetRolesAsync(appUser.Id).Result,
        Claims = _appUserManager.GetClaimsAsync(appUser.Id).Result
      };
    }
  }
}