using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PaymentGateway.Models
{
    public class PaymentRequest
    {
        public string OrderId { get; set; } = string.Empty;
        public long Amount { get; set; }
        public string OrderInfo { get; set; } = string.Empty;
        public string Signature { get; set; } = string.Empty; // Chữ ký sẽ được tính toán sau
    }

    public class PaymentResponse
    {
        public string OrderId { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public string ResponseCode { get; set; } = string.Empty; // 00 là thành công
        public string Signature { get; set; } = string.Empty;
        public long Amount { get; set; }
    }
}
