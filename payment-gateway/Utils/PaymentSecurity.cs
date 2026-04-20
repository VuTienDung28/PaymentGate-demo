using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Security.Cryptography;


namespace PaymentGateway.Utils
{
    public static class PaymentSecurity
    {
        public static string GenerateHmacSha256(string rawData, string secretKey)
        {
            var keyBytes = Encoding.UTF8.GetBytes(secretKey);
            var dataBytes = Encoding.UTF8.GetBytes(rawData);

            using (var hmac = new HMACSHA256(keyBytes))
            {
                var hashBytes = hmac.ComputeHash(dataBytes);
                // Trả về chuỗi Hexadecimal (chuỗi lục phân) để dễ gửi qua URL/JSON
                return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
            }
        }

        public static bool VerifySignature(string rawData, string signature, string secretKey)
        {
            // Tính toán lại chữ ký từ dữ liệu thô và so sánh với chữ ký nhận được
            string computedSignature = GenerateHmacSha256(rawData, secretKey);
            return computedSignature.Equals(signature, StringComparison.OrdinalIgnoreCase);
        }
    }
}
