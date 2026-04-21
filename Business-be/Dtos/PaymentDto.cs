namespace Business_be.Dtos
{
    public class CheckoutRequest
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class PaymentCallbackRequest

    {
        public long Amount { get; set; }
        public string OrderId { get; set; } = string.Empty;
        public string Signature { get; set; } = string.Empty;
        
    }
    
}

