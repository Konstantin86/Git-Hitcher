using System;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Web.Http;
using Hitcher.Auth;
using Hitcher.Controllers.Base;
using Hitcher.DataAccess.Entities;
using Hitcher.Models.External;
using Hitcher.Models.Request;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.OAuth;
using Newtonsoft.Json.Linq;

namespace Hitcher.Controllers
{
  [RoutePrefix("api/auth")]
  public class AuthController : ControllerBase
  {
    private IAuthenticationManager Authentication
    {
      get { return Request.GetOwinContext().Authentication; }
    }

    [Route("user/{id:guid}", Name = "GetUserById")]
    [HttpGet]
    public async Task<IHttpActionResult> GetUser(string id)
    {
      var user = await AppUserManager.FindByIdAsync(id);
      return user != null ? (IHttpActionResult)Ok(TheModelFactory.Create(user)) : NotFound();
    }

    [Authorize]
    [Route("")]
    [HttpGet]
    public async Task<IHttpActionResult> GetUser()
    {
      var user = await AppUserManager.FindByNameAsync(User.Identity.Name);
      return user != null ? (IHttpActionResult)Ok(TheModelFactory.Create(user)) : NotFound();
    }

    [Route("")]
    [HttpPost]
    public async Task<IHttpActionResult> Create(UserAddRequest request)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest(ModelState);
      }

      var user = new AppUser { UserName = request.Username, Email = request.Email, JoinDate = DateTime.Now.Date };

      IdentityResult createUserResult = await AppUserManager.CreateAsync(user, request.Password);

      if (!createUserResult.Succeeded)
      {
        return GetErrorResult(createUserResult);
      }

      IdentityResult addUserToRoleResult = await AppUserManager.AddToRoleAsync(user.Id, "user");

      if (!addUserToRoleResult.Succeeded)
      {
        return GetErrorResult(addUserToRoleResult);
      }

      //string code = await this.AppUserManager.GenerateEmailConfirmationTokenAsync(user.Id);

      //var callbackUrl = new Uri(Url.Link("ConfirmEmailRoute", new { userId = user.Id, code }));

      await this.AppUserManager.SendEmailAsync(user.Id, "Congratulations from Hitcher Team!", "You have just created your account on the hitcher web site!");

      return Created(new Uri(Url.Link("GetUserById", new { id = user.Id })), TheModelFactory.Create(user));
    }

    [HttpGet]
    [Route("ConfirmEmail", Name = "ConfirmEmailRoute")]
    public async Task<IHttpActionResult> ConfirmEmail(string userId = "", string code = "")
    {
      if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(code))
      {
        ModelState.AddModelError("", "User Id and Code are required");
        return BadRequest(ModelState);
      }

      IdentityResult result = await this.AppUserManager.ConfirmEmailAsync(userId, code);

      return result.Succeeded
        ? Redirect(new Uri(ConfigurationManager.AppSettings["webClientHostBaseUri"] + @"#/confirm"))
        : GetErrorResult(result);
    }

    [HttpGet]
    [Route("ResetPassword", Name = "ResetPasswordRoute")]
    public async Task<IHttpActionResult> ResetPassword(string callbackLink, string userId = "", string code = "", string password = "")
    {
      if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(password))
      {
        ModelState.AddModelError("", "User Id, Code and Password are required");
        return BadRequest(ModelState);
      }

      IdentityResult result = await AppUserManager.ResetPasswordAsync(userId, code, password);

      return result.Succeeded
        ? Redirect(callbackLink)
        //? Redirect(new Uri(ConfigurationManager.AppSettings["webClientHostBaseUri"] + @"#/login"))
        : GetErrorResult(result);
    }

    [HttpGet]
    [Route("password")]
    public async Task<IHttpActionResult> RecoverPassword(string email, string callbackLink)
    {
      var user = await AppUserManager.FindByEmailAsync(email);

      if (user == null || user.Logins.Any())
      {
        return BadRequest("User with provided e-mail is not registered in the system");
      }

      string code = await AppUserManager.GeneratePasswordResetTokenAsync(user.Id);

      string password = GetAutoGenPwd();

      var callbackUrl = new Uri(Url.Link("ResetPasswordRoute", new { callbackLink, userId = user.Id, code, password }));

      await AppUserManager.SendEmailAsync(user.Id, "KeetFit Password Recovery", "Please follow <a href=\"" + callbackUrl + "\">this</a> link to reset your password. Then you'll be able to use new generated password: '" + password + "' for login.");

      return Ok();
    }

    [Authorize]
    [Route("password")]
    [HttpPut]
    public async Task<IHttpActionResult> UpdatePassword(PasswordUpdateRequest model)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest(ModelState);
      }

      var user = await AppUserManager.FindByNameAsync(User.Identity.Name);

      if (user == null)
      {
        return BadRequest("Auth db corrupted");
      }

      IdentityResult result = await AppUserManager.ChangePasswordAsync(user.Id, model.OldPassword, model.Password);

      return result.Succeeded ? Ok() : GetErrorResult(result);
    }

    [Authorize]
    [Route("")]
    [HttpPut]
    public async Task<IHttpActionResult> Update(UserUpdateRequest model)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest(ModelState);
      }

      var user = await AppUserManager.FindByNameAsync(User.Identity.Name);
      user.FirstName = model.FirstName;
      user.LastName = model.LastName;
      user.Gender = model.Gender;
      user.BirthDate = model.BirthDate;
      user.Country = model.Country;
      user.City = model.City;
      user.PhoneNumber = model.PhoneNumber;

      IdentityResult result = await AppUserManager.UpdateAsync(user);

      return result.Succeeded ? Ok() : GetErrorResult(result);
    }

    [Authorize]
    [Route("")]
    public async Task<IHttpActionResult> DeleteUser()
    {
      var user = await AppUserManager.FindByNameAsync(User.Identity.Name);

      if (user == null)
      {
        return NotFound();
      }

      IdentityResult result = await AppUserManager.DeleteAsync(user);

      return result.Succeeded ? Ok() : GetErrorResult(result);
    }

    [OverrideAuthentication]
    [HostAuthentication(DefaultAuthenticationTypes.ExternalCookie)]
    [Route("externalLogin", Name = "externalLogin")]
    public async Task<IHttpActionResult> GetExternalLogin(string provider, string error = null)
    {
      string redirectUri = string.Empty;

      if (error != null)
      {
        return BadRequest(Uri.EscapeDataString(error));
      }

      if (!User.Identity.IsAuthenticated)
      {
        return new ChallengeResult(provider, this);
      }

      var redirectUriValidationResult = ValidateClientAndRedirectUri(ref redirectUri);

      if (!string.IsNullOrWhiteSpace(redirectUriValidationResult))
      {
        return BadRequest(redirectUriValidationResult);
      }

      ExternalLoginData externalLogin = ExternalLoginData.FromIdentity(User.Identity as ClaimsIdentity);

      if (externalLogin == null)
      {
        return InternalServerError();
      }

      if (externalLogin.LoginProvider != provider)
      {
        Authentication.SignOut(DefaultAuthenticationTypes.ExternalCookie);
        return new ChallengeResult(provider, this);
      }

      AppUser user = await AppUserManager.FindAsync(new UserLoginInfo(externalLogin.LoginProvider, externalLogin.ProviderKey));

      bool registered = user != null;

      if (!registered)
      {
        string userName = Translit(externalLogin.UserName).Replace(" ", string.Empty);
        var nameParts = externalLogin.UserName.Split(' ');

        string firstName = string.Empty;
        string lastName = string.Empty;

        if (nameParts.Length > 0)
        {
          firstName = nameParts[0];
        }

        if (nameParts.Length > 1)
        {
          lastName = nameParts[1];
        }

        // TODO temporary workaround. It's better to redirect user to associate view to allow him provide e-mail
        
        user = new AppUser { UserName = userName, FirstName = firstName, LastName = lastName, Email = externalLogin.Email, EmailConfirmed = true, JoinDate = DateTime.Now };

        user.Email = string.IsNullOrEmpty(user.Email) ? "test@t.ua" : user.Email;
        
        var existingUserWithSameName = await AppUserManager.FindByNameAsync(userName);
        if (existingUserWithSameName != null)
        {
          user.UserName += "_1";
        }

        var existingUserWithSameEmail = await AppUserManager.FindByEmailAsync(user.Email);
        if (existingUserWithSameEmail != null)
        {
          user.Email += "_1";
        }

        IdentityResult result = await AppUserManager.CreateAsync(user);

        if (!result.Succeeded)
        {
          return GetErrorResult(result);
        }

        IdentityResult addUserToRoleResult = await AppUserManager.AddToRoleAsync(user.Id, "user");

        if (!addUserToRoleResult.Succeeded)
        {
          return GetErrorResult(addUserToRoleResult);
        }

        var externalAccessToken = await VerifyExternalAccessToken(provider, externalLogin.ExternalAccessToken);

        string userId = externalLogin.UserId;

        if (externalAccessToken != null)
        {
          userId = externalAccessToken.user_id;
        }

        var info = new ExternalLoginInfo
        {
          DefaultUserName = user.UserName,
          Login = new UserLoginInfo(provider, userId)
        };

        var addLoginResult = await AppUserManager.AddLoginAsync(user.Id, info.Login);

        if (!addLoginResult.Succeeded)
        {
          return GetErrorResult(addLoginResult);
        }

        registered = true;
      }

      redirectUri = string.Format("{0}#external_access_token={1}&provider={2}&haslocalaccount={3}&external_user_name={4}&email={5}&user_id={6}",
                                      redirectUri,
                                      externalLogin.ExternalAccessToken,
                                      externalLogin.LoginProvider,
                                      registered.ToString(),
                                      externalLogin.UserName,
                                      externalLogin.Email,
                                      externalLogin.UserId);

      return Redirect(redirectUri);
    }

    [Route("RegisterExternal")]
    [HttpPost]
    public async Task<IHttpActionResult> RegisterExternal(ExternalUserAddRequest model)
    {
      if (!ModelState.IsValid)
      {
        return BadRequest(ModelState);
      }

      var externalAccessToken = await VerifyExternalAccessToken(model.Provider, model.ExternalAccessToken);

      if (externalAccessToken == null)
      {
        return BadRequest("Invalid Provider or External Access Token");
      }

      AppUser appUser = await AppUserManager.FindAsync(new UserLoginInfo(model.Provider, externalAccessToken.user_id));

      if (appUser != null)
      {
        return BadRequest("External user is already registered");
      }

      appUser = new AppUser { UserName = model.Username, Email = model.Email, EmailConfirmed = true, JoinDate = DateTime.Now };

      IdentityResult result = await AppUserManager.CreateAsync(appUser, model.Password);

      if (!result.Succeeded)
      {
        return GetErrorResult(result);
      }

      IdentityResult addUserToRoleResult = await AppUserManager.AddToRoleAsync(appUser.Id, "user");

      if (!addUserToRoleResult.Succeeded)
      {
        return GetErrorResult(addUserToRoleResult);
      }

      var info = new ExternalLoginInfo
      {
        DefaultUserName = model.Username,
        Login = new UserLoginInfo(model.Provider, externalAccessToken.user_id)
      };

      result = await AppUserManager.AddLoginAsync(appUser.Id, info.Login);

      return result.Succeeded ? Ok(GenerateLocalAccessTokenResponse(model.Username)) : GetErrorResult(result);
    }

    //[AllowAnonymous]
    [HttpGet]
    [Route("LocalAccessToken")]
    public async Task<IHttpActionResult> GetLocalAccessToken(string provider, string externalAccessToken, string userId)
    {
      if (string.IsNullOrWhiteSpace(provider) || string.IsNullOrWhiteSpace(externalAccessToken))
      {
        return BadRequest("Provider or external access token is not sent");
      }

      var verifiedAccessToken = await VerifyExternalAccessToken(provider, externalAccessToken);

      if (verifiedAccessToken == null && string.IsNullOrEmpty(userId))
      {
        return BadRequest("Invalid Provider or External Access Token");
      }

      IdentityUser user = await AppUserManager.FindAsync(new UserLoginInfo(provider, verifiedAccessToken != null ? verifiedAccessToken.user_id : userId));

      if (user == null)
      {
        return BadRequest("External user is not registered");
      }

      return Ok(GenerateLocalAccessTokenResponse(user.UserName));
    }

    private string ValidateClientAndRedirectUri(ref string redirectUriOutput)
    {
      Uri redirectUri;

      var redirectUriString = GetQueryString(Request, "redirect_uri");

      if (string.IsNullOrWhiteSpace(redirectUriString) || !Uri.TryCreate(redirectUriString, UriKind.Absolute, out redirectUri))
      {
        return "redirect_uri is invalid";
      }

      redirectUriOutput = redirectUri.AbsoluteUri;

      return string.Empty;
    }

    private static string GetQueryString(HttpRequestMessage request, string key)
    {
      var queryStrings = request.GetQueryNameValuePairs();

      if (queryStrings == null)
      {
        return null;
      }

      var match = queryStrings.FirstOrDefault(keyValue => String.Compare(keyValue.Key, key, StringComparison.OrdinalIgnoreCase) == 0);

      if (string.IsNullOrEmpty(match.Value))
      {
        return null;
      }

      return match.Value;
    }

    private static async Task<ExternalAccessToken> VerifyExternalAccessToken(string provider, string accessToken)
    {
      ExternalAccessToken externalAccessToken = null;

      string verifyTokenEndPoint;

      if (provider == "Facebook")
      {
        var facebookAppToken = "1540544966219959|eATZ1vQ6TzVBWDE5SS4MGo_5ymw";
        verifyTokenEndPoint = string.Format("https://graph.facebook.com/debug_token?input_token={0}&access_token={1}", accessToken, facebookAppToken);
      }
      else if (provider == "Google")
      {
        verifyTokenEndPoint = string.Format("https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={0}", accessToken);
      }
      else
      {
        return null;
      }

      var client = new HttpClient();
      var uri = new Uri(verifyTokenEndPoint);
      var response = await client.GetAsync(uri);

      if (response.IsSuccessStatusCode)
      {
        var content = await response.Content.ReadAsStringAsync();

        dynamic jObj = Newtonsoft.Json.JsonConvert.DeserializeObject(content);

        externalAccessToken = new ExternalAccessToken();

        if (provider == "Facebook")
        {
          externalAccessToken.user_id = jObj["data"]["user_id"];
          externalAccessToken.app_id = jObj["data"]["app_id"];

          if (!string.Equals(Startup.FacebookAuthOptions.AppId, externalAccessToken.app_id, StringComparison.OrdinalIgnoreCase))
          {
            return null;
          }
        }
        else if (provider == "Google")
        {
          externalAccessToken.user_id = jObj["user_id"];
          externalAccessToken.app_id = jObj["audience"];

          if (!string.Equals(Startup.GoogleAuthOptions.ClientId, externalAccessToken.app_id, StringComparison.OrdinalIgnoreCase))
          {
            return null;
          }
        }
      }

      return externalAccessToken;
    }

    private static JObject GenerateLocalAccessTokenResponse(string userName)
    {
      var tokenExpiration = TimeSpan.FromDays(1);

      var identity = new ClaimsIdentity(OAuthDefaults.AuthenticationType);

      identity.AddClaim(new Claim(ClaimTypes.Name, userName));
      identity.AddClaim(new Claim(ClaimTypes.Role, "user"));

      var props = new AuthenticationProperties
      {
        IssuedUtc = DateTime.UtcNow,
        ExpiresUtc = DateTime.UtcNow.Add(tokenExpiration),
      };

      var ticket = new AuthenticationTicket(identity, props);

      var accessToken = Startup.OAuthBearerOptions.AccessTokenFormat.Protect(ticket);

      JObject tokenResponse = new JObject(
                                  new JProperty("userName", userName),
                                  new JProperty("access_token", accessToken),
                                  new JProperty("token_type", "bearer"),
                                  new JProperty("expires_in", tokenExpiration.TotalSeconds.ToString()),
                                  new JProperty(".issued", ticket.Properties.IssuedUtc.ToString()),
                                  new JProperty(".expires", ticket.Properties.ExpiresUtc.ToString()));

      return tokenResponse;
    }

    private static string GetAutoGenPwd()
    {
      string[] arr = "a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,1,2,3,4,5,6,7,8,9,0,!,@,#,$,%,&,?,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,".Split(',');

      string password = "";

      var rand = new Random();
      password += arr[0];
      password += arr[arr.Length - 1];

      for (int i = 0; i < 8; i++)
      {
        password += arr[rand.Next(0, arr.Length)];
      }

      return password;
    }

    public static string Translit(string str)
    {
      string[] lat_up = { "A", "B", "V", "G", "D", "E", "Yo", "Zh", "Z", "I", "Y", "K", "L", "M", "N", "O", "P", "R", "S", "T", "U", "F", "Kh", "Ts", "Ch", "Sh", "Shch", "", "Y", "", "E", "Yu", "Ya" };
      string[] lat_low = { "a", "b", "v", "g", "d", "e", "yo", "zh", "z", "i", "y", "k", "l", "m", "n", "o", "p", "r", "s", "t", "u", "f", "kh", "ts", "ch", "sh", "shch", "", "y", "", "e", "yu", "ya" };
      string[] rus_up = { "А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж", "З", "И", "Й", "К", "Л", "М", "Н", "О", "П", "Р", "С", "Т", "У", "Ф", "Х", "Ц", "Ч", "Ш", "Щ", "Ъ", "Ы", "Ь", "Э", "Ю", "Я" };
      string[] rus_low = { "а", "б", "в", "г", "д", "е", "ё", "ж", "з", "и", "й", "к", "л", "м", "н", "о", "п", "р", "с", "т", "у", "ф", "х", "ц", "ч", "ш", "щ", "ъ", "ы", "ь", "э", "ю", "я" };
      for (int i = 0; i <= 32; i++)
      {
        str = str.Replace(rus_up[i], lat_up[i]);
        str = str.Replace(rus_low[i], lat_low[i]);
      }
      return str;
    }
  }
}