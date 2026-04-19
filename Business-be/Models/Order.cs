using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace Business_be.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        public string OrderCode { get; set; } = string.Empty; 

        // Khóa ngoại liên kết với bảng AspNetUsers của Identity
        public string UserId { get; set; } = string.Empty;
        public virtual IdentityUser User { get; set; } // Navigation property

        public int Quantity { get; set; }
        public decimal TotalAmount { get; set; }

        public string Status { get; set; } = "Pending"; // Trạng thái: Pending, Paid, Cancelled

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property liên kết 1-1 với bảng Payment
        public virtual Payment Payment { get; set; }
    }
}