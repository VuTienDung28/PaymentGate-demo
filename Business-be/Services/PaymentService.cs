using PaymentGateway.Services;
using PaymentGateway.Models;
using System.Net.Http.Json;

namespace Business_be.Services
{
    public class PaymentService
    {
        private readonly string _secretKey;
        private readonly PaymentProcessor _processor;
        private readonly HttpClient _httpClient;

        public PaymentService(IConfiguration config, HttpClient httpClient)
        {
            _secretKey = config["PaymentConfig:SecretKey"];
            _processor = new PaymentProcessor();
            _httpClient = httpClient;
        }

        public async Task<string> CreateOrderAndGetQrAsync(string orderId, long amount)
        {
            // 1. Tạo request có chữ ký (để gửi cho Gateway)
            var paymentRequest = _processor.CreatePaymentRequest(orderId, amount, _secretKey);

            // 2. Gọi sang Mock Gateway để lấy QR URL
            var response = await _httpClient.PostAsJsonAsync("http://localhost:5001/api/MockGateway/create-bill", paymentRequest);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<dynamic>();
                return result.GetProperty("qrUrl").GetString();
            }

            var errorDetail = await response.Content.ReadAsStringAsync();
            throw new Exception($"Gateway báo lỗi: {response.StatusCode} - Chi tiết: {errorDetail}");
        }

        public bool ValidateCallback(string rawData, string signature)
        {
            return PaymentGateway.Utils.PaymentSecurity.VerifySignature(rawData, signature, _secretKey);
        }
    }
}