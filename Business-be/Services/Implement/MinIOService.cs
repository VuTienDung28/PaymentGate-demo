using Amazon.S3;
using Amazon.S3.Transfer;
using Amazon.Runtime;

namespace Business_be.Services
{
    public class MinIOService : IMinIOService
    {
        private readonly IConfiguration _config;

        public MinIOService(IConfiguration config) => _config = config;

        public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
        {
            var config = new AmazonS3Config
            {
                ServiceURL = $"http://{_config["MinIO:Endpoint"]}",
                ForcePathStyle = true 
            };

            var credentials = new BasicAWSCredentials(_config["MinIO:AccessKey"], _config["MinIO:SecretKey"]);
            using var client = new AmazonS3Client(credentials, config);
            using var transferUtility = new TransferUtility(client);

            await transferUtility.UploadAsync(new TransferUtilityUploadRequest
            {
                InputStream = fileStream,
                Key = fileName,
                BucketName = _config["MinIO:BucketName"],
                ContentType = contentType,
                CannedACL = S3CannedACL.PublicRead
            });

            return $"http://{_config["MinIO:Endpoint"]}/{_config["MinIO:BucketName"]}/{fileName}";
        }
    }
}