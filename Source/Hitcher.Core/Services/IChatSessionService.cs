using System.Threading.Tasks;

namespace Hitcher.Core.Services
{
  public interface IChatSessionService
  {
    Task Save(string guid, string name, string message, string photoPath);
  }
}