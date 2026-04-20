namespace Business_be.Dtos
{
    public class CheckoutRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class PaymentCallbackRequest

    {
        public long amount { get; set; }
        public string orderId { get; set; } = string.Empty;
        public string signature { get; set; } = string.Empty;
        // Ở thực tế sẽ có thêm mã giao dịch ngân hàng, số tiền, chữ ký xác thực...
    }
    
}

