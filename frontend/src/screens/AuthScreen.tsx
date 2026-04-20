import React, { useState } from "react"
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator, // Thêm Alert để hiển thị thông báo
} from "react-native"
import { authApi } from "../api/authApi"

// Khai báo bảng màu dùng chung
const COLORS = {
  primary: "#E88B00", // Màu cam chủ đạo
  background: "#FFFFFF",
  surface: "#F5F5F5", // Màu nền ô input
  textPrimary: "#1F2937",
  textSecondary: "#6B7280",
}

export default function AuthScreen({ navigation }: any) {
  // State quản lý việc hiển thị màn hình Login hay Register
  const [isLoginMode, setIsLoginMode] = useState(true)

  // State lưu trữ dữ liệu nhập vào
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [isLoading, setIsLoading] = useState(false)

  const handleAuthAction = async () => {
    if (isLoginMode) {
      if (!email || !password) {
        Alert.alert("Lỗi", "Vui lòng nhập Email và Mật khẩu!")
        return
      }

      setIsLoading(true)
      try {
        console.log("Bắt đầu ping thẳng tới Backend...")
        const testRes = await fetch(
          "http://192.168.0.101:5270/api/Auth/login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password }),
          },
        )
        const testData = await testRes.json()
        console.log("Kết quả Test:", testData)
      } catch (e) {
        console.log("Lỗi Test:", e)
      }
      try {
        // Gọi API lên ASP.NET Core
        const response = await authApi.login(email, password)

        console.log("Dữ liệu BE trả về:", response)

        // Thành công -> Chuyển sang Home
        navigation.navigate("Home")
      } catch (error: any) {
        console.log(
          "Chi tiết lỗi 400 từ Backend:",
          JSON.stringify(error.response?.data, null, 2),
        )
        console.error("Lỗi đăng nhập:", error)

        const errorMsg =
          error.response?.data?.message || "Sai tài khoản hoặc mật khẩu!"
        Alert.alert("Đăng nhập thất bại", errorMsg)
      } finally {
        setIsLoading(false)
      }
    } else {
      // 1. Kiểm tra các trường không được bỏ trống
      if (!fullName || !email || !password || !confirmPassword) {
        Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin!")
        return
      }

      // 2. Kiểm tra mật khẩu khớp nhau
      if (password !== confirmPassword) {
        Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp!")
        return
      }

      setIsLoading(true)

      try {
        // 3. Gọi API Đăng ký
        console.log("Bắt đầu gọi API Register...")
        const response = await authApi.register(fullName, email, password)
        console.log("Đăng ký thành công:", response)

        Alert.alert(
          "Thành công",
          "Đăng ký thành công! Hãy đăng nhập để tiếp tục.",
        )

        // Chuyển UI về tab Login và xóa trắng mật khẩu cũ
        setIsLoginMode(true)
        setPassword("")
        setConfirmPassword("")
      } catch (error: any) {
        // --- XỬ LÝ LỖI TỪ IDENTITY C# ---
        console.log(
          "Chi tiết lỗi Đăng ký:",
          JSON.stringify(error.response?.data, null, 2),
        )

        let errorMsg = "Đăng ký thất bại!"
        const errorData = error.response?.data

        // ASP.NET Identity thường trả về một mảng chứa các lỗi (ví dụ: pass yếu)
        if (Array.isArray(errorData)) {
          // Lấy câu chửi đầu tiên của Identity hiển thị cho người dùng
          errorMsg = errorData[0]?.description || errorMsg
        } else if (errorData?.message) {
          errorMsg = errorData.message
        }

        Alert.alert("Lỗi đăng ký", errorMsg)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header - Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.brandTitle}>Cinema</Text>
            <Text style={styles.topBarRightText}>
              {!isLoginMode ? "SIGN UP" : ""}
            </Text>
          </View>
          {/* Tiêu đề chính */}
          <View style={styles.headerContainer}>
            {isLoginMode ? (
              <>
                <Text style={styles.title}>Welcome{"\n"}Back</Text>
                <Text style={styles.subtitle}>
                  Sign in to continue your journey.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.title}>
                  Create your{"\n"}
                  <Text style={{ color: COLORS.primary }}>experience.</Text>
                </Text>
                <Text style={styles.subtitle}>
                  Join our community of{"\n"}visionaries and designers.
                </Text>
              </>
            )}
          </View>
          {/* Form Nhập liệu */}
          <View style={styles.formContainer}>
            {!isLoginMode && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder='Cameron Williamson'
                  placeholderTextColor='#A1A1AA'
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder='name@example.com'
                placeholderTextColor='#A1A1AA'
                keyboardType='email-address'
                autoCapitalize='none'
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.passwordLabelRow}>
                <Text style={styles.label}>Password</Text>
                {isLoginMode && (
                  <TouchableOpacity>
                    <Text style={styles.forgotPassword}>FORGOT PASSWORD?</Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                style={styles.input}
                placeholder='••••••••'
                placeholderTextColor='#A1A1AA'
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {!isLoginMode && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder='••••••••'
                  placeholderTextColor='#A1A1AA'
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            )}

            {/* Nút Action Chính - Đã gắn hàm handleAuthAction */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleAuthAction}
              disabled={isLoading} // Khóa nút không cho bấm nhiều lần liên tiếp
            >
              {isLoading ? (
                <ActivityIndicator color='#FFF' />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isLoginMode ? "Login" : "Sign Up"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }} /> {/* Đẩy phần tab xuống đáy */}
        </ScrollView>

        {/* Bottom Tab Toggle */}
        <View style={styles.bottomTabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, isLoginMode && styles.tabButtonActive]}
            onPress={() => setIsLoginMode(true)}
          >
            <Text style={[styles.tabText, isLoginMode && styles.tabTextActive]}>
              LOGIN
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, !isLoginMode && styles.tabButtonActive]}
            onPress={() => setIsLoginMode(false)}
          >
            <Text
              style={[styles.tabText, !isLoginMode && styles.tabTextActive]}
            >
              REGISTER
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 30,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: "300",
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  topBarRightText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
    width: 60, // Giữ layout cân bằng
    textAlign: "right",
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.textPrimary,
    lineHeight: 44,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  passwordLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  forgotPassword: {
    fontSize: 10,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomTabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 20,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    backgroundColor: "#FAFAFA",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginHorizontal: 10,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#9CA3AF",
  },
  tabTextActive: {
    color: "#FFF",
  },
})
