using Hitcher.DataAccess.Entities;

namespace Hitcher.DataAccess.Repositories
{
  public class ChatMessageRepository : RepositoryBase<ChatMessage>
  {
    public ChatMessageRepository(AppDbContext context) : base(context)
    {
    }

    protected override void OnUpdate(ChatMessage newEntity, AppDbContext context)
    {
      throw new System.NotImplementedException();
    }
  }
}