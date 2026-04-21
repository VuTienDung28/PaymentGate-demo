import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native"
import { paymentApi } from "../api/paymentApi"

const COLORS = {
  primary: "#E88B00",
  success: "#10B981",
  background: "#FFFFFF",
  text: "#1F2937",
}

export default function PaymentScreen({ route, navigation }: any) {
  const { orderId, amount, signature } = route.params
  const [isSimulating, setIsSimulating] = useState(false)

  // Tạo URL mã QR giả lập (VietQR format)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PAYMENT_FOR_${orderId}_AMOUNT_${amount}`
  const handleSimulatePayment = async () => {
    setIsSimulating(true)
    try {
      await paymentApi.simulateUserPayment(orderId, amount) // báo thành công cho gateway

      Alert.alert(
        "Thành công",
        "Backend đã xác thực chữ ký HMAC và xác nhận thanh toán",
        [{ text: "Về trang chủ", onPress: () => navigation.navigate("Home") }],
      )
    } catch (error: any) {
      // Log lỗi chi tiết để debug
      console.error("Webhook Error:", error.response?.data || error.message)

      Alert.alert(
        "Lỗi xác thực",
        "Chữ ký không hợp lệ hoặc lỗi kết nối. Backend đã từ chối giao dịch này.",
      )
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Thanh toán</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Mã đơn hàng:</Text>
        <Text style={styles.orderCode}>{orderId}</Text>

        <Text style={styles.label}>Số tiền cần trả:</Text>
        <Text style={styles.amount}>{amount.toLocaleString("vi-VN")} đ</Text>

        <View style={styles.qrContainer}>
          <Image source={{ uri: qrUrl }} style={styles.qrImage} />
          <Text style={styles.qrHint}>Quét mã để thanh toán</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.note}>Dành cho Demo:</Text>
        <TouchableOpacity
          style={styles.webhookBtn}
          onPress={handleSimulatePayment}
          disabled={isSimulating}
        >
          {isSimulating ? (
            <ActivityIndicator color='#FFF' />
          ) : (
            <Text style={styles.webhookText}>Chờ thanh toán .....</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFF",
  },
  backBtn: { color: COLORS.primary, fontWeight: "bold" },
  title: { fontSize: 18, fontWeight: "bold", marginLeft: 20 },
  card: {
    margin: 20,
    padding: 24,
    backgroundColor: "#FFF",
    borderRadius: 20,
    alignItems: "center",
    elevation: 3,
  },
  label: { color: "#6B7280", fontSize: 14, marginTop: 10 },
  orderCode: { fontSize: 18, fontWeight: "bold", color: COLORS.text },
  amount: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.primary,
    marginVertical: 10,
  },
  qrContainer: { marginTop: 20, alignItems: "center" },
  qrImage: { width: 220, height: 220 },
  qrHint: { marginTop: 15, color: "#9CA3AF", fontStyle: "italic" },
  footer: { padding: 20 },
  note: {
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 10,
    fontSize: 12,
  },
  webhookBtn: {
    backgroundColor: COLORS.success,
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
  },
  webhookText: { color: "#FFF", fontWeight: "bold", textAlign: "center" },
})
