<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-xl font-semibold mb-4">管理员登录</h2>
    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
        <input 
          v-model="loginForm.username" 
          type="text" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="请输入用户名"
          required
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
        <input 
          v-model="loginForm.password" 
          type="password" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="请输入密码"
          required
        />
      </div>
      <button 
        type="submit" 
        :disabled="isSubmitting" 
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {{ isSubmitting ? '登录中...' : '登录' }}
      </button>
      <div v-if="message" class="mt-4 p-3 rounded-md" :class="messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
        {{ message }}
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['login-success'])

const loginForm = ref({
  username: '',
  password: ''
})

const message = ref('')
const messageType = ref('')
const isSubmitting = ref(false)

const handleLogin = () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    message.value = '请填写完整的登录信息'
    messageType.value = 'error'
    return
  }
  
  isSubmitting.value = true
  
  // 简化的管理员验证逻辑
  // 实际项目中应该通过后端API验证
  setTimeout(() => {
    if (loginForm.value.username === 'admin' && loginForm.value.password === 'admin123') {
      message.value = '登录成功！'
      messageType.value = 'success'
      
      // 保存登录状态
      localStorage.setItem('isAdmin', 'true')
      localStorage.setItem('adminName', loginForm.value.username)
      
      // 通知父组件登录成功
      emit('login-success', {
        isAdmin: true,
        username: loginForm.value.username
      })
      
      // 清空表单
      loginForm.value = {
        username: '',
        password: ''
      }
      
      setTimeout(() => {
        message.value = ''
      }, 1500)
    } else {
      message.value = '用户名或密码错误'
      messageType.value = 'error'
    }
    
    isSubmitting.value = false
  }, 500)
}
</script>