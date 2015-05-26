using System;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using Hitcher.Controllers.Base;
using Hitcher.DataAccess;
using Hitcher.Models.Request;

namespace Hitcher.Controllers
{
  [RoutePrefix("api/chat")]
  public class ChatController : ControllerBase
  {
    private readonly IUnitOfWork _unitOfWork;

    public ChatController(IUnitOfWork unitOfWork)
    {
      _unitOfWork = unitOfWork;
    }

    [Route("")]
    [HttpGet]
    public async Task<IHttpActionResult> GetAll([FromUri] QueryRequestBase request)
    {
      var dt = DateTime.Now.AddMinutes(-20);
      var messages = _unitOfWork.ChatMessageRepository.GetAll(m => m.Time >= dt).OrderBy(m => m.Time);
      return Ok(messages);
    }

    [Route("privateHistory")]
    [HttpGet]
    public async Task<IHttpActionResult> GetPrivateHistory(string fromId, string toId)
    {
      var messages = _unitOfWork.PrivateChatMessageRepository.GetAll(
        m => (m.FromUserId == fromId && m.ToUserId == toId) || (m.FromUserId == toId && m.ToUserId == fromId));

      return Ok(messages);
    }
  }
}