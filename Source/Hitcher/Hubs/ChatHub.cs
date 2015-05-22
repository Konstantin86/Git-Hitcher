using System;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;

namespace Hitcher.Hubs
{
  public class ChatHub : Hub
  {
    // signalR doc: http://www.asp.net/signalr/overview/guide-to-the-api/hubs-api-guide-server#asyncmethods
    public async Task SendAsync(string guid, string name, string message, string photoPath)
    {
      //todo await database or documentdb non-blocking call...
      Clients.All.addNewMessageToPage(guid, name, message, photoPath);
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
  }
}