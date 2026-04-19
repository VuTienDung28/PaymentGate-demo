import apiClient from "./client"

export const authApi = {
  // Hàm gọi API Đăng nhập
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post("/Auth/login", {
        email: email,
        password: password,
      })
      return response.data // Thường sẽ trả về { token: "..." }
    } catch (error) {
      throw error
    }
  },

  // Hàm gọi API Đăng ký
  register: async (fullName: string, email: string, password: string) => {
    try {
      const response = await apiClient.post("/Auth/register", {
        fullName: fullName,
        email: email,
        password: password,
      })
      return response.data
    } catch (error) {
      throw error
    }
  },
}
