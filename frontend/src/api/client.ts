import axios from "axios"

// Đừng quên thay IP này thành IPv4 của máy tính bạn
const BASE_URL = "http://192.168.0.107:5270/api"

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Bạn có thể thêm Interceptors ở đây sau này để tự động chèn JWT Token
// apiClient.interceptors.request.use(...)

export default apiClient
