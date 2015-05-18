using System;
using Microsoft.AspNet.SignalR;

namespace Hitcher.Hubs
{
  public class ChatHub : Hub
  {
    public void Send(String name, String message)
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
      Clients.All.addNewMessageToPage(name, msg);
    }
  }
}