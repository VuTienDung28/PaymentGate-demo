import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { mediaApi } from "../api/mediaApi"
import { orderApi } from "../api/orderApi"

const COLORS = {
  primary: "#E88B00",
  background: "#FFFFFF",
  surface: "#F5F5F5",
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
}

const TICKET_PRICE = 100000

export default function HomeScreen({ navigation }: any) {
  // Mảng rỗng chờ data từ API
  const [moviePosters, setMoviePosters] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // --- STATE CHO MODAL ĐẶT VÉ ---
  const [isModalVisible, setModalVisible] = useState(false)
  const [selectedMovieIndex, setSelectedMovieIndex] = useState(0)
  const [ticketQuantity, setTicketQuantity] = useState(1)
  const [isOrdering, setIsOrdering] = useState(false)

  // Hàm chuẩn hóa URL
  const formatUrl = (url: string) => {
    if (!url) return ""
    return url
      .replace("localhost", " 192.168.0.101")
      .replace("127.0.0.1", " 192.168.0.101")
  }

  // --- LẤY DANH SÁCH ẢNH TỪ DATABASE ---
  const fetchImages = async () => {
    try {
      const data = await mediaApi.getImages()
      // Lọc và format URL từ danh sách trả về
      const urls = data.map((item: any) =>
        formatUrl(item.fileUrl || item.FileUrl),
      )
      setMoviePosters(urls)
    } catch (error) {
      console.error("Lỗi tải danh sách ảnh:", error)
      // Tùy chọn: Thêm 1 ảnh mặc định nếu lỗi mạng để app không bị trống
    } finally {
      setIsLoading(false)
    }
  }

  // Tự động gọi fetchImages khi màn hình được render lần đầu
  useEffect(() => {
    fetchImages()
  }, [])

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn thoát?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => navigation.replace("Auth"),
      },
    ])
  }

  // --- UPLOAD ẢNH ---
  const handleUploadMovie = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
    })

    if (!result.canceled) {
      setIsUploading(true)
      const imageUri = result.assets[0].uri
      try {
        const filename = imageUri.split("/").pop() || "movie.jpg"
        const match = /\.(\w+)$/.exec(filename)
        const type = match ? `image/${match[1]}` : `image`

        const data = await mediaApi.uploadImage(imageUri, filename, type)
        let finalUrl = data.url || data.Url

        if (finalUrl) {
          finalUrl = formatUrl(finalUrl)
          // Thêm ảnh mới vào đầu danh sách đang hiển thị
          setMoviePosters((prev) => [finalUrl, ...prev])
          Alert.alert("Thành công", "Đã tải Poster phim lên hệ thống!")
        }
      } catch (error) {
        Alert.alert("Lỗi", "Không thể tải ảnh lên máy chủ.")
      } finally {
        setIsUploading(false)
      }
    }
  }

  // --- HÀM MỞ MODAL ĐẶT VÉ ---
  const openBookingModal = (index: number) => {
    setSelectedMovieIndex(index)
    setTicketQuantity(1) // Reset số lượng về 1
    setModalVisible(true)
  }

  // --- HÀM TẠO ĐƠN HÀNG ---
  const handleCheckout = async () => {
    setIsOrdering(true)
    try {
      const response = await orderApi.checkout(
        selectedMovieIndex + 1,
        ticketQuantity,
      )
      setModalVisible(false)

      // CHUYỂN SANG TRANG THANH TOÁN
      navigation.navigate("Payment", {
        orderId: response.data.orderId || response.data.OrderId,
        amount: ticketQuantity * TICKET_PRICE,
        signature: response.data.signature || response.data.Signature,
      })
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo đơn hàng.")
    } finally {
      setIsOrdering(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brandTitle}>Cinema</Text>
        <TouchableOpacity
          style={styles.avatarPlaceholder}
          onPress={handleLogout}
        >
          <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 12 }}>
            OUT
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.welcomeText}>Hi, Movie Lover! 🍿</Text>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleUploadMovie}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color='#FFF' />
          ) : (
            <Text style={styles.uploadButtonText}>+ Tải Poster Phim Mới</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Trending Today</Text>

        {/* HIỂN THỊ LOADING HOẶC DANH SÁCH ẢNH */}
        {isLoading ? (
          <ActivityIndicator
            size='large'
            color={COLORS.primary}
            style={{ marginTop: 50 }}
          />
        ) : (
          <View style={styles.moviesGrid}>
            {moviePosters.map((url, index) => (
              <TouchableOpacity
                key={index}
                style={styles.movieCard}
                onPress={() => openBookingModal(index)}
              >
                <Image source={{ uri: url }} style={styles.movieImage} />
                <View style={styles.movieOverlay}>
                  <Text style={styles.bookText}>Bấm để đặt vé</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* --- MODAL CHỌN SỐ LƯỢNG VÉ (BOTTOM SHEET) --- */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn số lượng vé</Text>

            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() =>
                  setTicketQuantity(Math.max(1, ticketQuantity - 1))
                }
              >
                <Text style={styles.qtyText}>-</Text>
              </TouchableOpacity>

              <Text style={styles.qtyValue}>{ticketQuantity}</Text>

              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => setTicketQuantity(ticketQuantity + 1)}
              >
                <Text style={styles.qtyText}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.totalPrice}>
              Tổng tiền:{" "}
              <Text style={{ color: COLORS.primary }}>
                {(ticketQuantity * TICKET_PRICE).toLocaleString("vi-VN")} đ
              </Text>
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={handleCheckout}
                disabled={isOrdering}
              >
                {isOrdering ? (
                  <ActivityIndicator color='#FFF' />
                ) : (
                  <Text style={styles.checkoutText}>TẠO ĐƠN HÀNG</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 15,
  },
  brandTitle: { fontSize: 24, fontWeight: "bold", color: COLORS.primary },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  content: { paddingHorizontal: 24, paddingBottom: 30 },
  welcomeText: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 15,
    marginBottom: 30,
    alignItems: "center",
  },
  uploadButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 15,
  },
  moviesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  movieCard: {
    width: "47%",
    aspectRatio: 3 / 4,
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  movieImage: { width: "100%", height: "100%", resizeMode: "cover" },
  movieOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    alignItems: "center",
  },
  bookText: { color: COLORS.primary, fontWeight: "bold", fontSize: 12 },

  // --- STYLES CHO MODAL ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end", // Đẩy xuống đáy
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  qtyButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: { fontSize: 24, fontWeight: "bold", color: COLORS.textPrimary },
  qtyValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginHorizontal: 30,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 30,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    marginRight: 10,
    alignItems: "center",
  },
  cancelText: { color: COLORS.textSecondary, fontWeight: "bold", fontSize: 16 },
  checkoutButton: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  checkoutText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
})
