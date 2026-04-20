using PaymentGateway.Services; // Gọi từ Library
using PaymentGateway.Models;

namespace Business_be.Services
{
    public class PaymentService  // giao tiếp với library payment gateway (ví dụ Stripe, PayPal) để tạo giao dịch thanh toán
    {
        private readonly string _secretKey;
        private readonly PaymentProcessor _processor;

        public PaymentService(IConfiguration config)
        {
            _secretKey = config["PaymentConfig:SecretKey"];
            _processor = new PaymentProcessor();
        }

        public PaymentRequest CreateOrderPayment(string orderId, long amount)
        {
            // Gọi logic từ "Bên thứ 3" (Library) để đóng gói và ký tên
            return _processor.CreatePaymentRequest(orderId, amount, _secretKey);
        }

        public bool ValidateCallback(string rawData, string signature)
        {

            // Kiểm tra tính chính xác của chữ ký khi nhận callback
            return PaymentGateway.Utils.PaymentSecurity.VerifySignature(rawData, signature, _secretKey);
        }
    }
}