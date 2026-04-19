import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import AuthScreen from "./frontend/src/screens/AuthScreen"
import HomeScreen from "./frontend/src/screens/HomeScreen"
import PaymentScreen from "./frontend/src/screens/PaymentScreen"

// Tạo bộ điều hướng Stack
const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName='Auth'
        screenOptions={{ headerShown: false }} // Ẩn thanh tiêu đề mặc định để dùng giao diện Cinema của bạn
      >
        {/* Màn hình Đăng nhập/Đăng ký */}
        <Stack.Screen name='Auth' component={AuthScreen} />

        {/* Màn hình Trang chủ */}
        <Stack.Screen name='Home' component={HomeScreen} />

        <Stack.Screen name='Payment' component={PaymentScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
