import apiClient from "./client"

export const mediaApi = {
  uploadImage: async (uri: string, filename: string, type: string) => {
    const formData = new FormData()

    formData.append("file", {
      uri: uri,
      name: filename,
      type: type,
    } as any)

    const response = await apiClient.post("/Media/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },
  getImages: async () => {
    const response = await apiClient.get("/Media")
    return response.data
  },
}
