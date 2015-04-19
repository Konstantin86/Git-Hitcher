using System;
using System.Collections.Generic;
using System.IO;
using System.Web;

namespace Hitcher.Blob
{
  public class FlowJsRepo : IFlowJsRepo
  {
    public FlowJsPostChunkResponse PostChunk(HttpRequest request, string folder)
    {
      return PostChunkBase(request, folder, null);
    }

    public FlowJsPostChunkResponse PostChunk(HttpRequest request, string folder, FlowValidationRules validationRules)
    {
      return PostChunkBase(request, folder, validationRules);
    }

    public bool ChunkExists(string folder, HttpRequest request)
    {
      var identifier = request.QueryString["flowIdentifier"];
      var chunkNumber = int.Parse(request.QueryString["flowChunkNumber"]);
      var chunkFullPathName = GetChunkFilename(chunkNumber, identifier, folder);
      return File.Exists(Path.Combine(folder, chunkFullPathName));
    }

    private FlowJsPostChunkResponse PostChunkBase(HttpRequest request, string folder, FlowValidationRules validationRules)
    {
      var chunk = new FlowChunk();

      if (!chunk.ParseForm(request.Form))
      {
        var errResponse = new FlowJsPostChunkResponse();
        errResponse.Status = PostChunkStatus.Error;
        errResponse.ErrorMessages.Add("damaged");
      }

      List<string> errorMessages = null;
      var file = request.Files[0];

      var response = new FlowJsPostChunkResponse { FileName = chunk.FileName, Size = chunk.TotalSize };

      var chunkIsValid = true;
      if (validationRules != null)
        chunkIsValid = chunk.ValidateBusinessRules(validationRules, out errorMessages);

      if (!chunkIsValid)
      {
        response.Status = PostChunkStatus.Error;
        response.ErrorMessages = errorMessages;
        return response;
      }

      string root = HttpContext.Current.Server.MapPath("~/Images");

      var chunkFullPathName = GetChunkFilename(chunk.Number, chunk.Identifier, root);

      if (!Directory.Exists(root)) Directory.CreateDirectory(root);
      file.SaveAs(chunkFullPathName);

      for (int i = 1, l = chunk.TotalChunks; i <= l; i++)
      {
        var chunkNameToTest = GetChunkFilename(i, chunk.Identifier, root);

        if (!File.Exists(chunkNameToTest))
        {
          response.Status = PostChunkStatus.PartlyDone;
          return response;
        }
      }

      // if we are here, all chunks are uploaded
      var fileAry = new List<string>();
      for (int i = 1, l = chunk.TotalChunks; i <= l; i++)
      {
        fileAry.Add("flow-" + chunk.Identifier + "." + i);
      }

      MultipleFilesToSingleFile(root, fileAry, chunk.FileName);

      for (int i = 0, l = fileAry.Count; i < l; i++)
      {
        try
        {
          File.Delete(Path.Combine(root, fileAry[i]));
        }
        catch (Exception)
        {
        }
      }

      response.Status = PostChunkStatus.Done;
      return response;
    }

    private static void MultipleFilesToSingleFile(string dirPath, IEnumerable<string> fileAry, string destFile)
    {
      using (var destStream = File.Create(Path.Combine(dirPath, destFile)))
      {
        foreach (string filePath in fileAry)
        {
          using (var sourceStream = File.OpenRead(Path.Combine(dirPath, filePath)))
            sourceStream.CopyTo(destStream); // You can pass the buffer size as second argument.
        }
      }
    }

    private string GetChunkFilename(int chunkNumber, string identifier, string folder)
    {
      return Path.Combine(folder, "flow-" + identifier + "." + chunkNumber);
    }
  }
}