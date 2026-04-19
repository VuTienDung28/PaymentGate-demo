import apiClient from "./client"

export const orderApi = {
  // 1. Tạo đơn hàng (Checkout)
  checkout: async (productId: number, quantity: number) => {
    try {
      const response = await apiClient.post("/Order/checkout", {
        productId,
        quantity,
      })
      return response.data // Trả về { OrderCode, Message }
    } catch (error) {
      throw error
    }
  },

  // 2. Giả lập Webhook (Gọi từ "Ngân hàng" về Backend)
  simulateWebhook: async (orderCode: string) => {
    try {
      const response = await apiClient.post("/Order/payment/callback", {
        orderCode: orderCode,
      })
      return response.data
    } catch (error) {
      throw error
    }
  },
}
