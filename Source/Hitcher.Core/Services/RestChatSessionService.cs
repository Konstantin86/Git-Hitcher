using System.Threading;
using System.Threading.Tasks;
using Hitcher.DataAccess;

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
      //await Task.Delay(10000); message appears after 10 seconds
      //Task.Delay(10000); message appears immidiately
    }
  }
}