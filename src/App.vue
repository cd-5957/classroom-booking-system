<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-blue-600 text-white py-4">
      <div class="container mx-auto px-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold">逸动未来教室预约系统</h1>
        <div v-if="isLoggedIn" class="flex items-center gap-2">
          <span class="text-sm">管理员：{{ adminName }}</span>
          <button @click="handleLogout" class="text-sm bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded">退出登录</button>
        </div>
        <button v-else @click="showLoginModal = true" class="text-sm bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded">管理员登录</button>
      </div>
    </header>
    <main class="container mx-auto px-4 py-8">
      <BookingList :isAdmin="isLoggedIn" :adminName="adminName" />
    </main>
    
    <!-- 联系信息 -->
    <footer class="bg-gray-200 py-4 mt-8">
      <div class="container mx-auto px-4 text-center text-sm text-gray-600">
        <p>有问题请联系微信：ydwl_1617</p>
      </div>
    </footer>
    
    <!-- 管理员登录弹框 -->
    <div v-if="showLoginModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">管理员登录</h3>
          <button @click="showLoginModal = false" class="text-gray-500 hover:text-gray-700">×</button>
        </div>
        <Login @login-success="handleLoginSuccess" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BookingList from './components/BookingList.vue'
import Login from './components/Login.vue'

const isLoggedIn = ref(false)
const adminName = ref('')
const showLoginModal = ref(false)

const handleLoginSuccess = (data) => {
  isLoggedIn.value = data.isAdmin
  adminName.value = data.username
  showLoginModal.value = false
}

const handleLogout = () => {
  isLoggedIn.value = false
  adminName.value = ''
  localStorage.removeItem('isAdmin')
  localStorage.removeItem('adminName')
}

onMounted(() => {
  // 检查是否已登录
  const isAdminUser = localStorage.getItem('isAdmin')
  const savedAdminName = localStorage.getItem('adminName')
  
  if (isAdminUser === 'true') {
    isLoggedIn.value = true
    adminName.value = savedAdminName || 'admin'
  }
})
</script>

<style scoped>
/* 组件样式 */
</style>