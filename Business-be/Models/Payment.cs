using System.ComponentModel.DataAnnotations;

namespace Business_be.Models
{
    public class Payment
    {
        [Key]
        public int Id { get; set; }

        // Khóa ngoại liên kết với bảng Order
        public int OrderId { get; set; }
        public virtual Order Order { get; set; } // Navigation property

        public string TransactionNo { get; set; } = string.Empty; 

        public decimal AmountPaid { get; set; }

        public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

        public string Status { get; set; } = "Success";
    }
}