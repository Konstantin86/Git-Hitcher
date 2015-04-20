using System.Security.Claims;
using System.Threading.Tasks;
using Duke.Owin.VkontakteMiddleware.Provider;

namespace Hitcher.Auth.Providers
{
  public class CustomVkAuthenticationProvider : VkAuthenticationProvider
  {
    public override Task Authenticated(VkAuthenticatedContext context)
    {
      context.Identity.AddClaim(new Claim("ExternalAccessToken", context.AccessToken));
      return Task.FromResult<object>(null);
    }
  }
}