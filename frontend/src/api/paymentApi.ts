import axios from "axios"
import apiClient from "./client"

export const paymentApi = {
  // 1. Tạo đơn hàng (Checkout)
  checkout: async (productId: number, quantity: number) => {
    try {
      const response = await apiClient.post("/Payment/checkout", {
        productId,
        quantity,
      }) // post đến backend
      return response.data // Trả về { OrderCode, Message }
    } catch (error) {
      throw error
    }
  },

  simulateUserPayment: async (orderId: string, amount: number) => {
    const response = await axios.post(
      "http://192.168.0.101:5001/api/MockGateway/user-pay",
      {
        orderId: orderId,
        amount: amount,
      },
    )
    return response.data
  },
}
