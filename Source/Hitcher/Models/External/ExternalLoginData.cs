using System;
using System.Security.Claims;
using Microsoft.AspNet.Identity;

namespace Hitcher.Models.External
{
  public class ExternalLoginData
  {
    public string LoginProvider { get; set; }
    public string ProviderKey { get; set; }
    public string UserName { get; set; }
    public string UserId { get; set; }
    public string Email { get; set; }
    public string ExternalAccessToken { get; set; }

    public static ExternalLoginData FromIdentity(ClaimsIdentity identity)
    {
      if (identity == null)
      {
        return null;
      }

      Claim providerKeyClaim = identity.FindFirst(ClaimTypes.NameIdentifier);

      if (providerKeyClaim == null || String.IsNullOrEmpty(providerKeyClaim.Issuer) || String.IsNullOrEmpty(providerKeyClaim.Value))
      {
        return null;
      }

      if (providerKeyClaim.Issuer == ClaimsIdentity.DefaultIssuer)
      {
        return null;
      }

      foreach (Claim claim in identity.Claims)
      {
        var ss = claim;

        if (ss.Value == string.Empty)
        {
          // Google returns e-mail address from the http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress claim. We can use it for social login registration when creating local account.
        }
      }

      var email = identity.FindFirstValue(ClaimTypes.Email);

      return new ExternalLoginData
      {
        LoginProvider = providerKeyClaim.Issuer,
        ProviderKey = providerKeyClaim.Value,
        UserName = identity.FindFirstValue(ClaimTypes.Name),
        UserId = identity.FindFirstValue(ClaimTypes.NameIdentifier),
        Email = email,
        ExternalAccessToken = identity.FindFirstValue("ExternalAccessToken")
      };
    }
  }
}