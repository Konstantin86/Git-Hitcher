using System.Net.Http;
using System.Web.Http;
using Hitcher.DataAccess.Auth;
using Hitcher.Models.Factory;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;

namespace Hitcher.Controllers.Base
{
  public class ControllerBase : ApiController
  {
    private ModelFactory _modelFactory;
    private AppUserManager _appUserManager = null;

    public ControllerBase()
    {
    }

    protected AppUserManager AppUserManager
    {
      get { return _appUserManager ?? Request.GetOwinContext().GetUserManager<AppUserManager>(); }
    }

    protected ModelFactory TheModelFactory
    {
      get { return _modelFactory ?? (_modelFactory = new ModelFactory(Request, AppUserManager)); }
    }

    protected IHttpActionResult GetErrorResult(IdentityResult result)
    {
      if (result == null)
      {
        return InternalServerError();
      }

      if (result.Succeeded) return null;

      if (result.Errors != null)
      {
        foreach (string error in result.Errors)
        {
          ModelState.AddModelError("", error);
        }
      }

      if (ModelState.IsValid)
      {
        return BadRequest();
      }

      return BadRequest(ModelState);
    }
  }
}