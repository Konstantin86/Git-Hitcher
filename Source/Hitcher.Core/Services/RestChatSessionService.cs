using System;
using System.Threading;
using System.Threading.Tasks;
using Hitcher.DataAccess;
using Hitcher.DataAccess.Entities;

namespace Hitcher.Core.Services
{
  public class RestChatSessionService : IChatSessionService
  {
    private readonly IUnitOfWork _unitOfWork;

    public RestChatSessionService(IUnitOfWork unitOfWork)
    {
      _unitOfWork = unitOfWork;
    }

    public async Task Save(string guid, string name, string message, string photoPath)
    {
      //TODO _unitOfWork.ChatMessageRepository.AddAsync();
      _unitOfWork.ChatMessageRepository.AddAsync(new ChatMessage
      {
        ClientId = guid,
        UserName = name,
        Message = message,
        PhotoPath = photoPath,
        Time = DateTime.Now
      });
      //await Task.Delay(10000); message appears after 10 seconds
      //Task.Delay(10000); message appears immidiately
    }
  }
}