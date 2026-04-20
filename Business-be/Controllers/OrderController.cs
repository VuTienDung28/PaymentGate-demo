using Business_be.Services;
using Microsoft.AspNetCore.Mvc;
using PaymentGateway.Models;
using Business_be.Dtos;


namespace Business_be.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly PaymentService _paymentService;

        public OrderController(PaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpPost("checkout")]
        public IActionResult Checkout([FromBody] CheckoutRequest request)
        {
            var orderId = $"ORD_{DateTime.Now.Ticks}";
            long totalAmount = request.Quantity * 100000; 

            // Gọi service để lấy gói tin có chữ ký HMAC thật
            var paymentData = _paymentService.CreateOrderPayment(orderId, totalAmount);

            return Ok(new
            {
                Message = "Khởi tạo thanh toán thành công",
                Data = paymentData // Trả về cho Mobile gồm cả Signature
            });
        }

        [HttpPost("payment/callback")]
        public IActionResult PaymentCallback([FromBody] PaymentCallbackRequest request)
        {
            // 1. Giả lập dữ liệu thô để kiểm tra (phải khớp với cách Library băm)
            
            string rawData = $"orderId={request.orderId}&amount={request.amount}";

            // 2. Sử dụng PaymentService để verify chữ ký nhận được
            
            bool isValid = _paymentService.ValidateCallback(rawData, request.signature);
            Console.WriteLine($"[VERIFY] RawData: {rawData}");
            if (!isValid)
            {
                Console.WriteLine($"[BE] ❌ Cảnh báo: Chữ ký không hợp lệ cho đơn {request.orderId}!");
                return BadRequest(new { Message = "Chữ ký không hợp lệ. Giao dịch bị nghi ngờ giả mạo!" });
            }

            // 3. Chỉ khi chữ ký đúng, mới xử lý nghiệp vụ
            Console.WriteLine($"[BE] ✅ Xác thực thành công đơn {request.orderId}");
            return Ok(new { Message = "Xác nhận thanh toán thành công qua HMAC" });
        }
    }

}
   