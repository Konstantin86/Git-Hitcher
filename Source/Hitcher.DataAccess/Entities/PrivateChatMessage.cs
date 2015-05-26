using System;
using Hitcher.DataAccess.Entities.Base;

namespace Hitcher.DataAccess.Entities
{
  public class PrivateChatMessage : EntityBase
  {
    public string FromUserId { get; set; }
    public string ToUserId { get; set; }
    public string UserName { get; set; }
    public string Message { get; set; }
    public string PhotoPath { get; set; }
    public DateTime Time { get; set; } 
  }
}