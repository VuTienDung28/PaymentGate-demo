import axios from "axios"

const BASE_URL = "http://192.168.0.101:5270/api"

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

export default apiClient
