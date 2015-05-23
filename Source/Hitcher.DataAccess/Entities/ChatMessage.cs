using System;
using Hitcher.DataAccess.Entities.Base;

namespace Hitcher.DataAccess.Entities
{
  public class ChatMessage : EntityBase
  {
    public string ClientId { get; set; }
    public string UserName { get; set; }
    public string Message { get; set; }
    public string PhotoPath { get; set; }
    public DateTime Time { get; set; }
  }
}