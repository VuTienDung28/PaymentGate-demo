using Microsoft.AspNetCore.Mvc;

namespace Business_be.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {

        // 1. API Tạo đơn hàng (Mobile App gọi khi bấm "Mua")
        [HttpPost("checkout")]
        public IActionResult Checkout([FromBody] CheckoutRequest request)
        {
            // Tạo mã đơn hàng ngẫu nhiên mô phỏng thực tế
            var orderCode = $"ORD_{DateTime.Now.Ticks}";

            // In log ra Terminal
            Console.WriteLine($"[BE] Tạo đơn {orderCode}, số lượng: {request.Quantity}, ký HMAC: giả_lập_chữ_ký_123...");

            return Ok(new
            {
                OrderCode = orderCode,
                Message = "Tạo đơn thành công, chờ thanh toán."
            });
        }

        // 2. API Webhook (Nhận thông báo "Đã nhận tiền" từ Cổng thanh toán)
        [HttpPost("payment/callback")]
        public IActionResult PaymentCallback([FromBody] PaymentCallbackRequest request)
        {
            Console.WriteLine($"[BE] Nhận callback cho đơn {request.OrderCode}");

            // (Đổi Status = "PAID" và trừ đi StockQuantity trong bảng Product)

            Console.WriteLine($"[BE] ✅ Đơn {request.OrderCode} cập nhật: PAID");

            return Ok(new { Message = "Xác nhận thanh toán thành công" });
        }
    }

    // Các class dùng để hứng dữ liệu (DTO)
    public class CheckoutRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class PaymentCallbackRequest
    {
        public string OrderCode { get; set; } = string.Empty;
        // Ở thực tế sẽ có thêm mã giao dịch ngân hàng, số tiền, chữ ký xác thực...
    }
}