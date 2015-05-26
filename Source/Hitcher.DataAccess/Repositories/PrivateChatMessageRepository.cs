using Hitcher.DataAccess.Entities;

namespace Hitcher.DataAccess.Repositories
{
  public class PrivateChatMessageRepository : RepositoryBase<PrivateChatMessage>
  {
    public PrivateChatMessageRepository(AppDbContext context) : base(context)
    {
    }

    protected override void OnUpdate(PrivateChatMessage newEntity, AppDbContext context)
    {
      throw new System.NotImplementedException();
    }
  }
}