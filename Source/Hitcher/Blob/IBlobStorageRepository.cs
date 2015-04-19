using System.IO;

namespace Hitcher.Blob
{
  public interface IBlobStorageRepository
  {
    void UploadImageFromStream(Stream stream, string fileName);

    void RemoveImage(string fileName);
  }
}