<template>
  <div class="bg-white rounded-lg shadow-md p-6 mb-8">
    <h2 class="text-xl font-semibold mb-4">预约表单</h2>
    <form @submit.prevent="submitBooking" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">编号</label>
        <input 
          v-model="bookingData.id" 
          type="text" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="请输入编号"
          required
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
        <input 
          v-model="bookingData.startTime" 
          type="datetime-local" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
        <input 
          v-model="bookingData.endTime" 
          type="datetime-local" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <button 
        type="submit" 
        :disabled="isSubmitting" 
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {{ isSubmitting ? '提交中...' : '提交预约' }}
      </button>
    </form>
    <div v-if="message" class="mt-4 p-3 rounded-md" :class="messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const emit = defineEmits(['booking-success'])

const bookingData = ref({
  id: '',
  startTime: '',
  endTime: ''
})

const message = ref('')
const messageType = ref('')
const isSubmitting = ref(false)

const submitBooking = async () => {
  // 表单验证
  if (!bookingData.value.id || !bookingData.value.startTime || !bookingData.value.endTime) {
    message.value = '请填写完整的预约信息'
    messageType.value = 'error'
    return
  }
  
  // 时间验证
  if (new Date(bookingData.value.startTime) >= new Date(bookingData.value.endTime)) {
    message.value = '结束时间必须晚于开始时间'
    messageType.value = 'error'
    return
  }
  
  isSubmitting.value = true
  try {
    const response = await axios.post('/api/bookings', bookingData.value)
    message.value = '预约成功！'
    messageType.value = 'success'
    // 重置表单
    bookingData.value = {
      id: '',
      startTime: '',
      endTime: ''
    }
    // 触发父组件更新列表
    emit('booking-success')
  } catch (error) {
    message.value = error.response?.data?.message || '预约失败，请稍后重试'
    messageType.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}
</script>