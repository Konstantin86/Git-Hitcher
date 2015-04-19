using System.IO;
using System.Linq;
using Microsoft.WindowsAzure;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;

namespace Hitcher.Blob
{
  public class AzureBlobStorageRepository : IBlobStorageRepository
  {
    private CloudStorageAccount _storageAccount;
    private CloudBlobClient _blobClient;
    private CloudBlobContainer _container;

    public AzureBlobStorageRepository()
    {
      _storageAccount = CloudStorageAccount.Parse(CloudConfigurationManager.GetSetting("StorageConnectionString"));
      _blobClient = _storageAccount.CreateCloudBlobClient();
      _container = _blobClient.GetContainerReference("media");
    }

    public void UploadImageFromStream(Stream stream, string fileName)
    {
      CloudBlockBlob blockBlob = _container.GetBlockBlobReference(fileName);

      // TODO ugly code - should be changed with real content media type obtained from http request of multi-part data: smt like this - file.Headers.ContentType.MediaType
      string format = fileName.Split('.').Last();

      if (format == "jpg")
      {
        format = "jpeg";
      }

      blockBlob.Properties.ContentType = "image/" + format;

      blockBlob.UploadFromStream(stream);
    }

    public void RemoveImage(string fileName)
    {
      CloudBlockBlob blockBlob = _container.GetBlockBlobReference(fileName);
      blockBlob.DeleteIfExists(DeleteSnapshotsOption.IncludeSnapshots);
    }
  }
}