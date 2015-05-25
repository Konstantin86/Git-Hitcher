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
    public async Task SendAsyncTest(string userId, string message)
    {
      Clients.Group(userId).sendTest("private: " + message);
      Clients.Caller.sendTest("caller: " + message);
    }

    // signalR doc: http://www.asp.net/signalr/overview/guide-to-the-api/hubs-api-guide-server#asyncmethods
    public async Task SendAsync(string guid, string name, string message, string photoPath)
    {
      // On the client
      // TODO: In chat directive initialization (on page load) asyncronously (via ajax request) take N last messages from session emulator (Redis or sql) which were sent not earlier than N minutes ago (in fact N equal to common session expiration time and recommended to be 20 mins)
      //RestChatSessionService _chatSessionService = new RestChatSessionService();
      await _chatSessionService.Save(guid, name, message, photoPath);

      var usname = Context.Request.QueryString["userId"];
      // TODO: Sort messages by time on the client side, set 'send' property according to guid (client should keep it's client guid in the local browser storage for this for specific time (N mins))


      // Todo 1: Asyncrounously cache message with session substitution storage (Redis or sql). For rest app we can't keep any session data or course
      // Todo 2: Dispatch a message to all users


      //todo For restful apps we need to model session with some scalable key-value storage like Redis documentDb (this way we can keep temp public messages with no need to store in the database)
      //todo await database or documentdb non-blocking call...

      String msg = String.Empty;
      if (message.StartsWith("#debug:"))
      {
        msg = message.Replace("#debug:", String.Empty);
      }
      else if (message.StartsWith("#error:"))
      {
        msg = message.Replace("#error:", String.Empty);
      }
      else if (message.StartsWith("#info:"))
      {
        msg = message.Replace("#info:", String.Empty);
      }
      else if (message.StartsWith("#warn:"))
      {
        msg = message.Replace("#warn:", String.Empty);
      }
      else
      {
        msg = message;
      }

      Clients.All.addNewMessageToPage(guid, name, message + usname, photoPath);
    }

    public void Send(string guid, string name, string message, string photoPath)
    {
      String msg = String.Empty;
      if (message.StartsWith("#debug:"))
      {
        msg = message.Replace("#debug:", String.Empty);
      }
      else if (message.StartsWith("#error:"))
      {
        msg = message.Replace("#error:", String.Empty);
      }
      else if (message.StartsWith("#info:"))
      {
        msg = message.Replace("#info:", String.Empty);
      }
      else if (message.StartsWith("#warn:"))
      {
        msg = message.Replace("#warn:", String.Empty);
      }
      else
      {
        msg = message;
      }

      //Call the addNewMessageToPage method to update clients.
      Clients.All.addNewMessageToPage(guid, name, msg, photoPath);
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