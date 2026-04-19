using Microsoft.AspNetCore.Mvc;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using Business_be.Services;

[Route("api/[controller]")]
[ApiController]
public class MediaController : ControllerBase
{
    private readonly MinioService _minioService;
    public MediaController(MinioService minioService) => _minioService = minioService;

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null) return BadRequest("File trống");

        var newFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        using var memoryStream = new MemoryStream();

        // ImageSharp xử lý: Đọc -> Resize -> Ghi vào MemoryStream
        using (var image = await Image.LoadAsync(file.OpenReadStream()))
        {
            image.Mutate(x => x.Resize(800, 0)); // Resize chiều ngang về 800px, cao tự động
            await image.SaveAsJpegAsync(memoryStream);
        }

        memoryStream.Position = 0; // Reset con trỏ stream về đầu trước khi upload
        var url = await _minioService.UploadFileAsync(memoryStream, newFileName, "image/jpeg");

        return Ok(new { Url = url });
    }
}