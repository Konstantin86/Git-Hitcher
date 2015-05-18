using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using Hitcher.DataAccess.Entities.Base;

namespace Hitcher.DataAccess.Repositories
{
  public abstract class RepositoryBase<T> : IDisposable where T : EntityBase
  {
    private bool _disposed;
    protected AppDbContext _context;

    protected RepositoryBase(AppDbContext context)
    {
      _context = context;
    }

    public virtual T Get(int id)
    {
      return _context.Set<T>().FirstOrDefault(e => e.Id == id);
    }

    public virtual T Get(Expression<Func<T, bool>> func)
    {
      return _context.Set<T>().FirstOrDefault(func);
    }

    public virtual IQueryable<T> GetAll(Expression<Func<T, bool>> func = null)
    {
      var dbSet = _context.Set<T>();
      return func == null ? dbSet : dbSet.Where(func);
    }

    public int Add(T t, bool saveChanges = true)
    {
      OnAdd(t, _context);

      var entity = _context.Set<T>().Add(t);

      if (saveChanges)
      {
        _context.SaveChanges();
      }

      return entity.Id;
    }

    /// <summary>
    /// Either update existing entity or create new
    /// </summary>
    /// <param name="t">Entity</param>
    /// <param name="saveChanges">Parameter indicating whether changes should by applied to underlying storage</param>
    public int Update(T t, bool saveChanges = true)
    {
      T entity = Get(t.Id);

      if (entity == null)
      {
        return Add(t, saveChanges);
      }

      OnUpdate(t, _context);

      if (saveChanges)
      {
        _context.SaveChanges();
      }

      return entity.Id;
    }

    public void Update(IEnumerable<T> entityCollection, bool saveChanges = true)
    {
      foreach (T entity in entityCollection)
      {
        Update(entity, saveChanges);
      }
    }

    public virtual void Delete(T entity, bool saveChanges = true)
    {
      _context.Set<T>().Remove(entity);

      if (saveChanges)
      {
        _context.SaveChanges();
      }
    }

    public virtual bool Delete(int id, bool saveChanges = true)
    {
      T entity = Get(id);
      _context.Set<T>().Remove(entity);

      if (saveChanges)
      {
        _context.SaveChanges();
      }

      return true;
    }

    public virtual void Delete(IEnumerable<int> ids, bool saveChanges = true)
    {
      foreach (int id in ids)
      {
        Delete(id, saveChanges);
      }
    }

    public virtual void Delete(Expression<Func<T, bool>> filter, bool saveChanges = true)
    {
      foreach (T entity in GetAll(filter).ToList())
      {
        Delete(entity.Id, saveChanges);
      }
    }

    protected abstract void OnUpdate(T newEntity, AppDbContext context);

    protected virtual void OnAdd(T entity, AppDbContext context) { }

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
  }
}