using System;
using System.Linq;
using System.Net.Http.Formatting;
using System.Reflection;
using System.Web.Http;
using Hitcher.CompositionRoot;
using Hitcher.DataAccess;
using Microsoft.Owin;
using Microsoft.Owin.Security.OAuth;
using Newtonsoft.Json.Serialization;
using Owin;

namespace Hitcher
{
  public class Startup
  {
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
      //app.CreatePerOwinContext<AppUserManager>(AppUserManager.Create);
      //app.CreatePerOwinContext<AppRoleManager>(AppRoleManager.Create);

      //OAuthAuthorizationServerOptions oAuthServerOptions = new OAuthAuthorizationServerOptions()
      //{
      //  AllowInsecureHttp = true,
      //  TokenEndpointPath = new PathString("/token"),
      //  AccessTokenExpireTimeSpan = TimeSpan.FromDays(1),
      //  //Provider = new AppAuthorizationServerProvider()
      //};

      var oAuthBearerOptions = new OAuthBearerAuthenticationOptions();

      //app.UseOAuthAuthorizationServer(oAuthServerOptions);
      //app.UseOAuthBearerAuthentication(oAuthBearerOptions);
    }

    private void ConfigureWebApi(HttpConfiguration config)
    {
      config.MapHttpAttributeRoutes();
      var jsonFormatter = config.Formatters.OfType<JsonMediaTypeFormatter>().First();
      jsonFormatter.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver();
    }
  }
}