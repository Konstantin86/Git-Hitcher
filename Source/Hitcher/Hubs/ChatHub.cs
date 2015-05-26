using System;
using System.Linq;
using System.Runtime.Remoting.Contexts;
using System.Threading.Tasks;
using Hitcher.Core.Services;
using Microsoft.AspNet.SignalR;

namespace Hitcher.Hubs
{
  public class ChatHub : Hub
  {
    private readonly IChatSessionService _chatSessionService;

    public ChatHub(IChatSessionService chatSessionService)
    {
      _chatSessionService = chatSessionService;
    }

    // http://www.asp.net/signalr/overview/guide-to-the-api/mapping-users-to-connections - Mapping signalR users to connections
    public async Task SendPrivateAsync(string userId, string name, string message, string photoPath)
    {
      string fromUserId = Context.Request.QueryString["userId"];
      Clients.Group(userId).sendPrivate(userId, fromUserId, name, message, photoPath);
      Clients.Caller.sendSelf(userId, name, message, photoPath);
    }

    // signalR doc: http://www.asp.net/signalr/overview/guide-to-the-api/hubs-api-guide-server#asyncmethods
    public async Task SendAsync(string clientId, string name, string message, string photoPath)
    {
      await _chatSessionService.Save(clientId, name, message, photoPath);
      Clients.All.sendPublic(clientId, name, message, photoPath);
    }

    // Since websocket doesn't work over HTTP we need to pass userId in querystring instead of bearer token in the http header
    public override Task OnConnected()
    {
      string id = Context.Request.QueryString["userId"];

      Groups.Add(Context.ConnectionId, id);

      return base.OnConnected();
    }
  }
}