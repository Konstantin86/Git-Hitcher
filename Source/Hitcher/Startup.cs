using System;
using System.Linq;
using System.Net.Http.Formatting;
using System.Reflection;
using System.Web.Http;
using Duke.Owin.VkontakteMiddleware;
using Hitcher.Auth.Providers;
using Hitcher.CompositionRoot;
using Hitcher.DataAccess;
using Hitcher.DataAccess.Auth;

using Microsoft.Owin;
using Microsoft.Owin.Security.Facebook;
using Microsoft.Owin.Security.Google;
using Microsoft.Owin.Security.OAuth;
using Newtonsoft.Json.Serialization;
using Owin;

namespace Hitcher
{
  public class Startup
  {
    public static OAuthBearerAuthenticationOptions OAuthBearerOptions { get; private set; }
    public static GoogleOAuth2AuthenticationOptions GoogleAuthOptions { get; private set; }
    public static FacebookAuthenticationOptions FacebookAuthOptions { get; private set; }

    public void Configuration(IAppBuilder app)
    {
      var config = new HttpConfiguration();

      var diContainer = Bootstrapper.Instance.GetContainer(Assembly.GetExecutingAssembly());

      ConfigureAuth(app);

      ConfigureWebApi(config);

      app.UseCors(Microsoft.Owin.Cors.CorsOptions.AllowAll);

      app.UseAutofacMiddleware(diContainer);
      app.UseAutofacWebApi(config);

      app.UseWebApi(config);

    }

    private void ConfigureAuth(IAppBuilder app)
    {
      app.CreatePerOwinContext(AppDbContext.Create);
      app.CreatePerOwinContext<AppUserManager>(AppUserManager.Create);
      app.CreatePerOwinContext<AppRoleManager>(AppRoleManager.Create);

      var oAuthServerOptions = new OAuthAuthorizationServerOptions
      {
        AllowInsecureHttp = true,
        TokenEndpointPath = new PathString("/token"),
        AccessTokenExpireTimeSpan = TimeSpan.FromDays(1),
        Provider = new AppAuthorizationServerProvider()
      };

      app.UseExternalSignInCookie(Microsoft.AspNet.Identity.DefaultAuthenticationTypes.ExternalCookie);
      OAuthBearerOptions = new OAuthBearerAuthenticationOptions();

      GoogleAuthOptions = new GoogleOAuth2AuthenticationOptions
      {
        ClientId = "762577690085-8q5b7s18bmdfjel6h8ihcc14tmongbd2.apps.googleusercontent.com",
        ClientSecret = "MuYGSdOcr5suTwYiUjOrh_52",
        Provider = new GoogleAuthProvider()
      };
      app.UseGoogleAuthentication(GoogleAuthOptions);

      // Prod:
      FacebookAuthOptions = new FacebookAuthenticationOptions
      {
        AppId = "1564101533872186",
        AppSecret = "82828e2f0763e9e561c25d14fbf24c34",
        Provider = new FacebookAuthProvider()
      };

      // Dev:
      #if DEBUG
      //FacebookAuthOptions = new FacebookAuthenticationOptions
      //{
      //  AppId = "1564102313872108",
      //  AppSecret = "ff54b5171b3b0e6ff4e0a5c9229437bc",
      //  Provider = new FacebookAuthProvider()
      //};
      #endif
      
      app.UseFacebookAuthentication(FacebookAuthOptions);

      // Prod:
      var vkAuthenticationOptions = new VkAuthenticationOptions
      {
        AppId = "4887889",
        AppSecret = "JgT4ZDrcxZvQYLa5o0zI",
        Provider = new CustomVkAuthenticationProvider()
      };

      // Dev:
      #if DEBUG
      //vkAuthenticationOptions = new VkAuthenticationOptions
      //{
      //  AppId = "4886156",
      //  AppSecret = "eTlQrHXr6Kjk8BRZXwFi",
      //  Provider = new CustomVkAuthenticationProvider()
      //};
      #endif

      app.UseVkontakteAuthentication(vkAuthenticationOptions);

      app.UseOAuthAuthorizationServer(oAuthServerOptions);
      app.UseOAuthBearerAuthentication(OAuthBearerOptions);
    }

    private void ConfigureWebApi(HttpConfiguration config)
    {
      config.MapHttpAttributeRoutes();
      var jsonFormatter = config.Formatters.OfType<JsonMediaTypeFormatter>().First();
      jsonFormatter.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
    }
  }
}