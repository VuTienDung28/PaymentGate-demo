using System.ComponentModel.DataAnnotations;

namespace Business_be.Models
{
    public class MediaFile
    {
        [Key]
        public int Id { get; set; }

        public string FileName { get; set; } = string.Empty;

        public string FileUrl { get; set; } = string.Empty;

        public string MimeType { get; set; } = string.Empty; // VD: image/jpeg

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}