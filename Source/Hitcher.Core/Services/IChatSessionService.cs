namespace Hitcher.Core.Services
{
  public interface IChatSessionService
  {
    void Save(string guid, string name, string message, string photoPath);
  }
}