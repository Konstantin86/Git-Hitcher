using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Hitcher.Blob;
using Hitcher.Controllers.Base;
using Hitcher.DataAccess.Auth;
using ImageResizer;
using Microsoft.AspNet.Identity;

namespace Hitcher.Controllers
{
  [Authorize]
  [RoutePrefix("api/blob")]
  public class BlobController : ControllerBase
  {
    private readonly IBlobStorageRepository _blobRepository;
    private readonly IFlowJsRepo _flowJs;

    readonly string _folder = HttpContext.Current.Server.MapPath("~/Images");

    public BlobController(IBlobStorageRepository blobRepository)
    {
      _blobRepository = blobRepository;
      _flowJs = new FlowJsRepo();
    }

    [HttpGet]
    [Route("Upload")]
    public IHttpActionResult PictureUploadGet()
    {
      var request = HttpContext.Current.Request;

      var chunkExists = _flowJs.ChunkExists(_folder, request);
      if (chunkExists) return Ok();
      return NotFound();
    }

    [HttpPost]
    [Route("Upload")]
    public async Task<IHttpActionResult> PictureUploadPost()
    {
      var request = HttpContext.Current.Request;

      var validationRules = new FlowValidationRules();
      validationRules.AcceptedExtensions.AddRange(new List<string> { "jpeg", "jpg", "png", "bmp" });
      validationRules.MaxFileSize = 50000000;

      try
      {
        var status = _flowJs.PostChunk(request, _folder, validationRules);

        if (status.Status == PostChunkStatus.Done)
        {
          var filePath = Path.Combine(_folder, status.FileName);

          string extension = ImageResizer.Util.PathUtils.GetExtension(filePath);
          string basePath = ImageResizer.Util.PathUtils.RemoveExtension(filePath);

          string fileName = Guid.NewGuid() + "." + status.FileName.Split('.').Last();

          string userPhotoPath = basePath + "_user_photo" + extension;

          ImageBuilder.Current.Build(filePath, userPhotoPath, new ResizeSettings("maxwidth=" + ConfigurationManager.AppSettings["userPhotoMaxWidth"] + "&format=jpg"));

          using (var fileStream = File.OpenRead(userPhotoPath))
          {
            _blobRepository.UploadImageFromStream(fileStream, fileName);
          }

          File.Delete(filePath);
          File.Delete(userPhotoPath);

          var user = await AppUserManager.FindByNameAsync(User.Identity.Name);

          // Remove old user photo from storage (but not the default one):
          if (user.PhotoPath != ConfigurationManager.AppSettings["userDefaultImageName"])
          {
            _blobRepository.RemoveImage(user.PhotoPath);
          }

          user.PhotoPath = fileName;

          IdentityResult result = await AppUserManager.UpdateAsync(user);

          if (!result.Succeeded)
          {
            return GetErrorResult(result);
          }

          return Ok(fileName);
        }

        if (status.Status == PostChunkStatus.PartlyDone)
        {
          return Ok();
        }

        status.ErrorMessages.ForEach(x => ModelState.AddModelError("file", x));
        return BadRequest(ModelState);
      }
      catch (Exception)
      {
        ModelState.AddModelError("file", "exception");
        return BadRequest(ModelState);
      }
    }
  }
}