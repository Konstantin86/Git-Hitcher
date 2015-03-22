using System;
using System.Collections.Generic;
using System.Linq;
using Hitcher.DataAccess.Repositories;

namespace Hitcher.DataAccess
{
  public interface IUnitOfWork : IDisposable
  {
    RouteRepository RouteRepository { get; }

    void SaveChanges();
  }

  public class UnitOfWork : IUnitOfWork
  {
    private bool _disposed;

    private readonly List<IDisposable> _disposableObjects;

    private readonly AppDbContext _context;

    public UnitOfWork(AppDbContext context)
    {
      _context = context;

      RouteRepository = new RouteRepository(context);

      _disposableObjects = new List<IDisposable> { context, RouteRepository };
    }


    public RouteRepository RouteRepository { get; private set; }

    public void SaveChanges()
    {
      _context.SaveChanges();
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