using Microsoft.AspNetCore.Mvc;
using PaymentGateway.Utils;
using PaymentGateway.Models;

namespace PaymentGatewayService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MockGatewayController : ControllerBase
    {
        private readonly string _secretKey;
        private readonly IHttpClientFactory _httpClientFactory;

        public MockGatewayController(IConfiguration config, IHttpClientFactory httpClientFactory)
        {
            _secretKey = config["PaymentConfig:SecretKey"];
            _httpClientFactory = httpClientFactory;
        }

        // B??c 4-5-6: Nh?n yêu c?u t?o bill t? Business BE
        [HttpPost("create-bill")]
        public IActionResult CreateBill([FromBody] PaymentRequest request)
        {
            // Ki?m tra ch? ký t? BE g?i sang ?? ??m b?o ?úng là BE c?a mình g?i
            string rawData = $"orderId={request.OrderId}&amount={request.Amount}";
            bool isValid = PaymentSecurity.VerifySignature(rawData, request.Signature, _secretKey);

            if (!isValid) return BadRequest("Signature invalid from Business BE");

            // Gi? l?p t?o URL QR 
            var qrUrl = $"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=GATEWAY_BILL_{request.OrderId}";

            return Ok(new
            {
                BillId = $"BILL_{Guid.NewGuid().ToString().Substring(0, 8)}",
                QrUrl = qrUrl
            });
        }

        // B??c 9-10: Gi? l?p ng??i dùng quét mã thành công
        [HttpPost("user-pay")]
        public async Task<IActionResult> UserPay([FromBody] dynamic data)
        {
            string orderId = data.GetProperty("orderId").GetString();
            long amount = data.GetProperty("amount").GetInt64();

            // Gateway t? tính HMAC ?? báo cho BE
            string rawData = $"orderId={orderId}&amount={amount}";
            string signature = PaymentSecurity.GenerateHmacSha256(rawData, _secretKey);

            // B?n Webhook (Callback) v? Business BE
            var client = _httpClientFactory.CreateClient();
            var callbackData = new { orderId, amount, signature };

            // Chú ý: Thay URL này b?ng URL th?t c?a BE b?n
            var response = await client.PostAsJsonAsync("http://localhost:5270/api/Payment/callback", callbackData);

            if (response.IsSuccessStatusCode)
                return Ok(new { Message = "Gateway ?ã xác nh?n và b?n Webhook thành công" });

            return StatusCode(500, "L?i khi g?i Webhook v? BE");
        }
    }
}