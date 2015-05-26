using System;
using System.Collections.Generic;
using System.Linq;
using Hitcher.DataAccess.Repositories;

namespace Hitcher.DataAccess
{
  public interface IUnitOfWork : IDisposable
  {
    RouteRepository RouteRepository { get; }
    RouteRecurrencyRepository RouteRecurrencyRepository { get; }
    ChatMessageRepository ChatMessageRepository { get; }
    PrivateChatMessageRepository PrivateChatMessageRepository { get; }

    void SaveChanges();
  }

  public class UnitOfWork : IUnitOfWork
  {
    private bool _disposed;

    private readonly List<IDisposable> _disposableObjects;

    public UnitOfWork(AppDbContext context)
    {
      DbContext = context;
      RouteRepository = new RouteRepository(context);
      RouteRecurrencyRepository = new RouteRecurrencyRepository(context);
      ChatMessageRepository = new ChatMessageRepository(context);
      PrivateChatMessageRepository = new PrivateChatMessageRepository(context);

      _disposableObjects = new List<IDisposable> { context, RouteRepository, RouteRecurrencyRepository, ChatMessageRepository, PrivateChatMessageRepository };
    }


    public RouteRepository RouteRepository { get; private set; }

    public RouteRecurrencyRepository RouteRecurrencyRepository { get; private set; }

    public ChatMessageRepository ChatMessageRepository { get; private set; }

    public PrivateChatMessageRepository PrivateChatMessageRepository { get; private set; }

    private AppDbContext DbContext { get; set; }

    public void SaveChanges()
    {
      DbContext.SaveChanges();
    }

    public void Dispose()
    {
      Dispose(true);
      GC.SuppressFinalize(this);
    }

    protected void Dispose(bool disposing)
    {
      if (!_disposed)
      {
        if (disposing)
        {
          foreach (var disposable in _disposableObjects.Where(disposable => disposable != null))
          {
            disposable.Dispose();
          }
        }

        _disposed = true;
      }
    }
  }
}