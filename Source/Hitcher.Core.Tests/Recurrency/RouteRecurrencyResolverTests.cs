using System;
using System.Linq;
using Hitcher.Core.Recurrency.Helpers;
using Hitcher.Core.Recurrency.Services;
using Hitcher.Core.Utils;
using Hitcher.DataAccess.Entities;
using NUnit.Framework;

namespace Hitcher.Core.Tests.Recurrency
{
  [TestFixture]
  public class RouteRecurrencyResolverTests
  {
    private RouteRecurrencyResolver _routeRecurrencyResolver;

    [Test]
    [TestCase(5, 15, new[] { true, false, false, false, false, true, false, false, false, false, true, false, false, false, false, true })]
    [TestCase(4, 12, new[] { true, false, false, false, true, false, false, false, true, false, false, false, true })]
    [TestCase(3, 9, new[] { true, false, false, true, false, false, true, false, false, true })]
    [TestCase(2, 6, new[] { true, false, true, false, true, false, true })]
    [TestCase(1, 3, new[] { true, true, true, true })]
    public void TestOccurOnDaily(int interval, int addDays, bool[] expected)
    {
      Route route = new Route
      {
        StartTime = DateTime.Now,
        DueDate = DateTime.Now.AddMonths(1),
        Recurrency = new RouteRecurrency
        {
          Interval = interval,
          Mode = 0,
        }
      };

      _routeRecurrencyResolver = new RouteRecurrencyResolver(route);

      var results = DateTimeHelper.DaysBetween(DateTime.Today, DateTime.Today.AddDays(addDays)).Select(d => _routeRecurrencyResolver.OccurOn(d)).ToArray();

      Assert.AreEqual(expected, results);
    }

    [Test]
    [TestCase(1, 1, 12)]
    [TestCase(1, 28, 12)]
    [TestCase(1, 29, 12)]
    [TestCase(1, 30, 12)]
    [TestCase(1, 31, 12)]
    [TestCase(2, 27, 12)]
    [TestCase(2, 28, 12)]
    public void TestOccurOnMonthly(int startMonth, int startDay, int addMonth)
    {
      Route route = new Route
      {
        StartTime = new DateTime(DateTime.Now.Year, startMonth, startDay),
        DueDate = DateTime.Now.AddYears(2),
        Recurrency = new RouteRecurrency
        {
          Interval = 1,
          Mode = 2,
        }
      };

      _routeRecurrencyResolver = new RouteRecurrencyResolver(route);

      Assert.IsTrue(_routeRecurrencyResolver.OccurOn(route.StartTime.Date));

      do
      {
        Assert.IsTrue(_routeRecurrencyResolver.OccurOn(route.StartTime.Date.AddMonths(addMonth)));
        Assert.IsFalse(_routeRecurrencyResolver.OccurOn(route.StartTime.Date.AddMonths(addMonth).AddDays(-3)));
        Assert.IsFalse(_routeRecurrencyResolver.OccurOn(route.StartTime.Date.AddMonths(addMonth).AddDays(-2)));
        Assert.IsFalse(_routeRecurrencyResolver.OccurOn(route.StartTime.Date.AddMonths(addMonth).AddDays(-1)));
        Assert.IsFalse(_routeRecurrencyResolver.OccurOn(route.StartTime.Date.AddMonths(addMonth).AddDays(1)));
        Assert.IsFalse(_routeRecurrencyResolver.OccurOn(route.StartTime.Date.AddMonths(addMonth).AddDays(2)));
        Assert.IsFalse(_routeRecurrencyResolver.OccurOn(route.StartTime.Date.AddMonths(addMonth).AddDays(3)));
      } while (addMonth-- > 0);
    }

    [Test]
    [TestCase(new[] { true, false, true, false, true, false, false })]
    [TestCase(new[] { false, true, false, true, false, false, false })]
    [TestCase(new[] { false, false, false, false, false, true, true })]
    public void TestOccurOnWeekky(bool[] results)
    {
      Route route = new Route
      {
        StartTime = DateTime.Now.StartOfWeek(DayOfWeek.Monday),
        DueDate = DateTime.Now.AddYears(1),
        Recurrency = new RouteRecurrency
        {
          Mode = 1,
          Weekdays = RecurrencyHelper.GetWeekdays(results[0], results[1], results[2], results[3], results[4], results[5], results[6])
        }
      };

      _routeRecurrencyResolver = new RouteRecurrencyResolver(route);

      Assert.AreEqual(results[0], _routeRecurrencyResolver.OccurOn(route.StartTime.Date));

      int daysInWeek = 1;

      do
      {
        Assert.AreEqual(results[daysInWeek], _routeRecurrencyResolver.OccurOn(route.StartTime.Date.AddDays(daysInWeek)));
      } while (++daysInWeek <= 6);
    }

    [Test]
    [TestCase(5)]
    [TestCase(4)]
    [TestCase(3)]
    [TestCase(2)]
    [TestCase(1)]
    public void TestOccurNextDaily(int interval)
    {
      Route route = new Route
      {
        StartTime = DateTime.Now.AddDays(-1),
        DueDate = DateTime.Now.AddMonths(1),
        Recurrency = new RouteRecurrency
        {
          Interval = interval,
          Mode = 0,
        }
      };

      _routeRecurrencyResolver = new RouteRecurrencyResolver(route);

      var occurNext = _routeRecurrencyResolver.OccurNext();
      Assert.IsNotNull(occurNext);
      Assert.AreEqual(route.StartTime.AddDays(interval).Date, occurNext.Value.Date);
      Assert.AreEqual(route.StartTime.Hour, occurNext.Value.Hour);
      Assert.AreEqual(route.StartTime.Minute, occurNext.Value.Minute);
      Assert.AreEqual(route.StartTime.Second, occurNext.Value.Second);
    }

    [Test]
    [TestCase(1)]
    [TestCase(2)]
    [TestCase(3)]
    [TestCase(4)]
    [TestCase(5)]
    [TestCase(6)]
    [TestCase(7)]
    [TestCase(8)]
    [TestCase(9)]
    [TestCase(10)]
    [TestCase(11)]
    [TestCase(12)]
    public void TestOccurNextMonthly(int interval)
    {
      Route route = new Route
      {
        StartTime = DateTime.Now.AddDays(-1),
        DueDate = DateTime.Now.AddYears(5),
        Recurrency = new RouteRecurrency
        {
          Interval = interval,
          Mode = 2,
        }
      };

      _routeRecurrencyResolver = new RouteRecurrencyResolver(route);

      var occurNext = _routeRecurrencyResolver.OccurNext();
      Assert.IsNotNull(occurNext);
      Assert.AreEqual(route.StartTime.AddMonths(interval).Date, occurNext.Value.Date);
      Assert.AreEqual(route.StartTime.Hour, occurNext.Value.Hour);
      Assert.AreEqual(route.StartTime.Minute, occurNext.Value.Minute);
      Assert.AreEqual(route.StartTime.Second, occurNext.Value.Second);
    }

    [Test]
    [TestCase(new[] { true, false, true, false, true, false, false })]
    public void TestOccurNextWeekky(bool[] results)
    {
      Route route = new Route
      {
        StartTime = DateTime.Now.AddDays(7).StartOfWeek(DayOfWeek.Tuesday),
        DueDate = DateTime.Now.AddYears(1),
        Recurrency = new RouteRecurrency
        {
          Mode = 1,
          Weekdays = RecurrencyHelper.GetWeekdays(results[0], results[1], results[2], results[3], results[4], results[5], results[6])
        }
      };

      _routeRecurrencyResolver = new RouteRecurrencyResolver(route);

      var occurNext = _routeRecurrencyResolver.OccurNext();

      DateTime wednesday = route.StartTime.NextDay(DayOfWeek.Wednesday);

      Assert.IsNotNull(occurNext);
      Assert.AreEqual(wednesday.Date, occurNext.Value.Date);
      Assert.AreEqual(route.StartTime.Hour, occurNext.Value.Hour);
      Assert.AreEqual(route.StartTime.Minute, occurNext.Value.Minute);
      Assert.AreEqual(route.StartTime.Second, occurNext.Value.Second);
    }

    [Test]
    public void TestOccurNextMonthlyNegative()
    {
      Route route = new Route
      {
        StartTime = DateTime.Now.AddDays(-1),
        DueDate = DateTime.Now.AddMonths(2),
        Recurrency = new RouteRecurrency
        {
          Interval = 3,
          Mode = 2,
        }
      };

      _routeRecurrencyResolver = new RouteRecurrencyResolver(route);

      var occurNext = _routeRecurrencyResolver.OccurNext();
      Assert.IsNull(occurNext);
    }
  }
}