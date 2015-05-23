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
      var allRoutes = _unitOfWork.RouteRepository.GetAll();

      // TODO...
    }
  }
}