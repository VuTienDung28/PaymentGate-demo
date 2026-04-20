using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using PaymentGateway.Models;
using PaymentGateway.Utils;

namespace PaymentGateway.Services
{
    public class PaymentProcessor
    {
        // Hàm tạo yêu cầu thanh toán kèm chữ ký
        public PaymentRequest CreatePaymentRequest(string orderId, long amount, string secretKey)
        {
            // Bước 1: Gom dữ liệu thô theo quy tắc của cổng (VD: OrderId + Amount)
            string rawData = $"orderId={orderId}&amount={amount}";

            // Bước 2: Ký tên
            string signature = PaymentSecurity.GenerateHmacSha256(rawData, secretKey);
            Console.WriteLine($"[GENERATE] RawData: {rawData}");
            return new PaymentRequest
            {
                OrderId = orderId,
                Amount = amount,
                OrderInfo = $"Thanh toán đơn hàng {orderId}",
                Signature = signature
            };
        }
    }
}
