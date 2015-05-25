using Microsoft.AspNet.SignalR;

namespace Hitcher.Hubs.UserIdProvider
{
  public class HitcherUserIdProvider : IUserIdProvider
  {
    public string GetUserId(IRequest request)
    {
      return request.QueryString["userId"];
    }
  }
}