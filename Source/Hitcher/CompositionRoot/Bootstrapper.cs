using System.Collections.Generic;
using System.Reflection;
using Autofac;
using Autofac.Integration.WebApi;
using Hitcher.Blob;
using Hitcher.Core.Services;
using Hitcher.DataAccess;
using Hitcher.Models.Factory;

namespace Hitcher.CompositionRoot
{
  public class Bootstrapper
  {
    private static readonly Bootstrapper _instance = new Bootstrapper();

    private ContainerBuilder _builder;
    private IContainer _container;

    protected Bootstrapper()
    {
    }

    public static Bootstrapper Instance
    {
      get
      {
        return _instance;
      }
    }

    public IContainer Build(Assembly webApiAssembly = null)
    {
      InitContainer(webApiAssembly);

      bool webApi = webApiAssembly != null;

      RegisterManagers(webApi);
      RegisterJiraClientComponents(webApi);
      RegisterDataAccessComponents(webApi);
      RegisterServices(webApi);

      return BuidContainer();
    }

    public T Get<T>()
    {
      return _container.Resolve<T>();
    }

    public IContainer GetContainer(Assembly webApiAssembly)
    {
      return Build(webApiAssembly);
    }

    private void InitContainer(Assembly webApiAssembly)
    {
      _builder = new ContainerBuilder();

      if (webApiAssembly != null)
      {
        _builder.RegisterApiControllers(webApiAssembly);
      }
    }

    private void RegisterManagers(bool webapi)
    {
      RegisterDependency<AzureBlobStorageRepository, IBlobStorageRepository>(webapi);
    }

    private void RegisterDataAccessComponents(bool webapi)
    {
      RegisterDependency<AppDbContext>(webapi);
      RegisterDependency<UnitOfWork, IUnitOfWork>(webapi);
    }

    private void RegisterServices(bool webapi)
    {
      RegisterDependency<RouteService, IRouteService>(webapi);

      //RegisterDependency<RouteRecurrencyResolver>(webapi);
      RegisterDependency<RouteFactory>(webapi);
    }

    private void RegisterJiraClientComponents(bool webapi)
    {
      //RegisterDependency<JiraRestClientFactory, IJiraRestClientFactory>(webapi);
      //RegisterDependency<JiraRestClient, IJiraRestClient>(webapi);
      //RegisterDependency<JiraRestClientProvider, IJiraRestClientProvider>(webapi);
      //RegisterDependency<JiraGateway, IJiraGateway>(webapi, new Dictionary<string, object>
      //      {
      //          { "jiraUrl", PlexStatSettings.JiraUrl },
      //          { "credentials", new JiraUserCredentials { Username = PlexStatSettings.JiraUserName, Password = PlexStatSettings.JiraPassord } }
      //      });

      //RegisterDependency<QueryBuilder, IQueryBuilder>(webapi);
      //RegisterDependency<ComputationHelper, IComputationHelper>(webapi);
      //RegisterDependency<DataMapper, IDataMapper>(webapi);
      //RegisterDependency<IssuesProvider, IIssuesProvider>(webapi);
    }

    private void RegisterDependency<TClass, TAbstraction>(bool webapi, IDictionary<string, object> parameters = null)
    {
      var dependency = _builder.RegisterType<TClass>().As<TAbstraction>();

      if (parameters != null)
      {
        foreach (var parameter in parameters)
        {
          dependency.WithParameter(parameter.Key, parameter.Value);
        }
      }

      if (webapi)
      {
        dependency.InstancePerRequest();
      }
      else
      {
        dependency.InstancePerDependency();
      }
    }

    private void RegisterDependency<TClass>(bool webapi, IDictionary<string, object> parameters = null)
    {
      var dependency = _builder.RegisterType<TClass>().AsSelf();

      if (parameters != null)
      {
        foreach (var parameter in parameters)
        {
          dependency.WithParameter(parameter.Key, parameter.Value);
        }
      }

      if (webapi)
      {
        dependency.InstancePerRequest();
      }
      else
      {
        dependency.InstancePerDependency();
      }
    }

    private IContainer BuidContainer()
    {
      _container = _builder.Build();
      return _container;
    }
  }
}