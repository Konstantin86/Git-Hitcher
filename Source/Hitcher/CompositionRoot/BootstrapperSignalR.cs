using System.Collections.Generic;
using System.Reflection;
using Autofac;
using Autofac.Integration.SignalR;
using Autofac.Integration.WebApi;
using Hitcher.Blob;
using Hitcher.Core.Services;
using Hitcher.DataAccess;
using Hitcher.Models.Factory;

namespace Hitcher.CompositionRoot
{
  public class BootstrapperSignalR
  {
    private static readonly BootstrapperSignalR _instance = new BootstrapperSignalR();

    private ContainerBuilder _builder;
    private IContainer _container;

    protected BootstrapperSignalR()
    {
    }

    public static BootstrapperSignalR Instance
    {
      get
      {
        return _instance;
      }
    }

    public IContainer Build(Assembly webApiAssembly = null)
    {
      InitContainer(webApiAssembly);
      RegisterServices();
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
      _builder.RegisterHubs(webApiAssembly);
    }

    private void RegisterServices()
    {
      RegisterInstancePerLifetimeScopeDependency<RestChatSessionService, IChatSessionService>();

      _builder.RegisterType<UnitOfWork>().As<IUnitOfWork>().WithParameter("context", AppDbContext.Create()).ExternallyOwned();
      //RegisterInstancePerLifetimeScopeDependency<UnitOfWork, IUnitOfWork>();
    }

    private void RegisterInstancePerLifetimeScopeDependency<TClass, TAbstraction>(IDictionary<string, object> parameters = null)
    {
      var dependency = _builder.RegisterType<TClass>().As<TAbstraction>();

      if (parameters != null)
      {
        foreach (var parameter in parameters)
        {
          dependency.WithParameter(parameter.Key, parameter.Value);
        }
      }

      dependency.InstancePerLifetimeScope();
    }

    private IContainer BuidContainer()
    {
      _container = _builder.Build();
      return _container;
    }
  }
}