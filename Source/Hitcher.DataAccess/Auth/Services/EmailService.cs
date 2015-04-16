using System.Configuration;
using System.Net;
using System.Threading.Tasks;

using Microsoft.AspNet.Identity;

using SendGrid;

namespace Hitcher.DataAccess.Auth.Services
{
  public class EmailService : IIdentityMessageService
  {
    public async Task SendAsync(IdentityMessage message)
    {
      await ConfigSendGridAsync(message);
    }

    private async Task ConfigSendGridAsync(IdentityMessage message)
    {
      var myMessage = new SendGridMessage();

      myMessage.AddTo(message.Destination);
      myMessage.From = new System.Net.Mail.MailAddress("kostyan22@gmail.com", "Konstantin Lazurenko");
      myMessage.Subject = message.Subject;
      myMessage.Text = message.Body;
      myMessage.Html = message.Body;

      var credentials = new NetworkCredential(ConfigurationManager.AppSettings["emailService:Account"],
                                              ConfigurationManager.AppSettings["emailService:Password"]);

      var transportWeb = new Web(credentials);

      if (transportWeb != null)
      {
        await transportWeb.DeliverAsync(myMessage);
      }
      else
      {
        //Trace.TraceError("Failed to create Web transport.");
        await Task.FromResult(0);
      }
    }
  }
}