using Business_be.Data;
using Business_be.Models;
using Business_be.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace Business_be.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MediaController : ControllerBase
    {
        private readonly IMinIOService _storageService;
        private readonly AppDbContext _context;

        public MediaController(IMinIOService storageService, AppDbContext context)
        {
            _storageService = storageService;
            _context = context;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            try
            {
                // 1. Kiểm tra file đầu vào
                if (file == null || file.Length == 0)
                    return BadRequest("File trống");

                var newFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                var mimeType = "image/jpeg";

                using var memoryStream = new MemoryStream();

                // 2. Xử lý ảnh (Resize) bằng ImageSharp
                using (var image = await Image.LoadAsync(file.OpenReadStream()))
                {
                    image.Mutate(x => x.Resize(800, 0)); 
                    await image.SaveAsJpegAsync(memoryStream);
                }

                memoryStream.Position = 0; 

                // 3. Gọi Service để upload lên MinIO
                var url = await _storageService.UploadFileAsync(memoryStream, newFileName, mimeType);

                // 4. Lưu thông tin vào Database
                var mediaRecord = new MediaFile
                {
                    FileName = newFileName,
                    FileUrl = url,
                    MimeType = mimeType,
                    UploadedAt = DateTime.UtcNow
                };

                _context.MediaFiles.Add(mediaRecord);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    Id = mediaRecord.Id,
                    Url = url
                });
            }
            catch (Exception ex)
            {
                
                return StatusCode(500, new
                {
                    Message = "Đã xảy ra lỗi trong quá trình xử lý hoặc tải ảnh lên.",
                    Error = ex.Message
                });
            }
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var files = await _context.MediaFiles
                    .OrderByDescending(f => f.UploadedAt)
                    .ToListAsync();
                return Ok(files);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Không thể lấy danh sách ảnh.", Error = ex.Message });
            }
        }
    }
}