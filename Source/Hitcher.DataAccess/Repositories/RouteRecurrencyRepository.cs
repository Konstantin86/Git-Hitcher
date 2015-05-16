using System;
using System.Linq;
using System.Linq.Expressions;
using Hitcher.DataAccess.Entities;

namespace Hitcher.DataAccess.Repositories
{
  public class RouteRecurrencyRepository : IDisposable
  {
    private bool _disposed;
    protected AppDbContext _context;

    public RouteRecurrencyRepository(AppDbContext context)
    {
      _context = context;
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
          if (_context != null)
          {
            _context.Dispose();
            _context = null;
          }
        }

        _disposed = true;
      }
    }

    public RouteRecurrency Get(Expression<Func<RouteRecurrency, bool>> func)
    {
      return _context.RouteRecurrencies.SingleOrDefault(func);
    }

    public void Delete(RouteRecurrency recurrency)
    {
      _context.RouteRecurrencies.Remove(recurrency);
    }

    public void Delete(Expression<Func<RouteRecurrency, bool>> func)
    {
      Delete(Get(func));
    }
  }
}