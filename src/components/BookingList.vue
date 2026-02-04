<template>
  <div class="bg-white rounded-lg shadow-md p-4 sm:p-6">
    <h2 class="text-xl font-semibold mb-2">预约日历</h2>
    <p class="text-sm text-gray-500 mb-4">点击日期查看当日已预约时间，并新增预约记录</p>
    
    <!-- 日历导航 -->
    <div class="flex justify-between items-center mb-4">
      <button 
        @click="prevMonth" 
        class="px-3 py-1 rounded transition-colors"
        :class="currentDate.isSame(dayjs(), 'month') ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'"
      >
        上一月
      </button>
      <h3 class="text-lg font-medium">{{ currentMonthYear }}</h3>
      <button 
        @click="nextMonth" 
        class="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer transition-colors"
      >
        下一月
      </button>
    </div>
    
    <!-- 日历网格 -->
    <div v-if="isLoading" class="py-8 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      <p class="mt-2 text-gray-600">加载中...</p>
    </div>
    <div v-else class="grid grid-cols-7 gap-0.5">
      <!-- 星期标题 -->
      <div v-for="day in weekDays" :key="day" class="text-center py-1 sm:py-2 font-medium text-gray-600 text-xs sm:text-sm">{{ day }}</div>
      
      <!-- 日期单元格 -->
      <div 
        v-for="day in calendarDays" 
        :key="day.date"
        @click="handleDayClick(day)"
        class="border rounded flex flex-col items-start p-1 transition-colors min-h-[60px] sm:min-h-[80px]"
        :class="{
          'bg-gray-100 text-gray-400 cursor-not-allowed': !day.isCurrentMonth || isPastDate(day.date),
          'hover:bg-blue-50 cursor-pointer': day.isCurrentMonth && !isPastDate(day.date),
          'bg-blue-100 cursor-pointer': day.isToday
        }"
      >
        <div class="w-full flex justify-between items-center mb-1">
          <span class="text-xs sm:text-sm">{{ day.day }}</span>
          <span v-if="day.bookings && day.bookings.length > 0" class="text-xs bg-red-100 text-red-600 px-1 rounded-full">
            {{ day.bookings.length }}
          </span>
        </div>
        <div v-if="day.bookings && day.bookings.length > 0" class="w-full space-y-0.5">
          <div v-for="(booking, index) in day.bookings.slice(0, 2)" :key="index" class="text-[10px] sm:text-xs truncate text-gray-600">
            {{ formatTime(booking.startTime) }}-{{ formatTime(booking.endTime) }}
          </div>
          <div v-if="day.bookings.length > 2" class="text-[10px] sm:text-xs text-gray-400">
            +{{ day.bookings.length - 2 }} 更多
          </div>
        </div>
      </div>
    </div>
    
    <!-- 当日预约明细弹框 -->
    <div v-if="showDayDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-md w-full">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">{{ selectedDayDetail }}</h3>
          <button @click="showDayDetailModal = false" class="text-gray-500 hover:text-gray-700">×</button>
        </div>
        
        <!-- 当日预约列表 -->
        <div class="mb-4">
          <h4 class="text-sm font-medium text-gray-600 mb-2">当日预约明细</h4>
          <div v-if="selectedDayBookings.length === 0" class="py-4 text-center text-gray-500">
            暂无预约记录
          </div>
          <div v-else class="space-y-2">
            <div v-for="booking in selectedDayBookings" :key="booking._id" class="p-2 border rounded">
              <div class="flex justify-between">
                <span class="font-medium">{{ isAdmin ? booking.name : '已预约' }}</span>
                <button 
                  v-if="isAdmin" 
                  @click="deleteBooking(booking._id)" 
                  class="text-xs text-red-600 hover:text-red-900"
                >
                  删除
                </button>
              </div>
              <div class="text-sm text-gray-600">
                {{ formatTime(booking.startTime) }} - {{ formatTime(booking.endTime) }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- 预约按钮 -->
        <button 
          @click="openBookingModal"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
        >
          预约
        </button>
      </div>
    </div>
    
    <!-- 预约弹框 -->
    <div v-if="showBookingModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-md w-full">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">预约 {{ selectedDate.format('YYYY-MM-DD') }}</h3>
          <button @click="showBookingModal = false" class="text-gray-500 hover:text-gray-700">×</button>
        </div>
        
        <form @submit.prevent="submitBooking" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">预约人</label>
            <input 
              v-model="bookingForm.name" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入预约人"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
            <input 
              v-model="bookingForm.startTime" 
              type="time" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
            <input 
              v-model="bookingForm.endTime" 
              type="time" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div v-if="bookingForm.startTime && bookingForm.endTime" class="p-2 bg-gray-50 rounded">
            <span class="text-sm text-gray-600">预约时长：{{ calculateDuration() }} 小时</span>
          </div>
          <button 
            type="submit" 
            :disabled="isSubmitting" 
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? '提交中...' : '提交预约' }}
          </button>
        </form>
        <div v-if="bookingMessage" class="mt-4 p-3 rounded-md" :class="bookingMessageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
          {{ bookingMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineProps } from 'vue'
import dayjs from 'dayjs'

// 微信云开发配置
const cloudEnv = 'cloud1-2gs6ioay8f351f18'
const cloudFunctionName = 'bookings'

// 调用云函数的通用方法
const callCloudFunction = async (action, data = {}) => {
  try {
    const response = await fetch('https://api.weixin.qq.com/tcb/invokecloudfunction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        env: cloudEnv,
        name: cloudFunctionName,
        data: JSON.stringify({ action, data })
      })
    })
    
    const result = await response.json()
    
    if (result.errcode !== 0) {
      throw new Error(result.errmsg || '调用云函数失败')
    }
    
    return result.function_result
  } catch (error) {
    console.error('调用云函数出错:', error)
    throw error
  }
}

const props = defineProps({
  isAdmin: {
    type: Boolean,
    default: false
  },
  adminName: {
    type: String,
    default: ''
  }
})

const bookings = ref([])
const isLoading = ref(false)
const currentDate = ref(dayjs())
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 弹框状态
const showDayDetailModal = ref(false)
const showBookingModal = ref(false)
const selectedDate = ref(dayjs())
const selectedDayBookings = ref([])
const isSubmitting = ref(false)
const bookingMessage = ref('')
const bookingMessageType = ref('')

// 预约表单
const bookingForm = ref({
  name: '',
  startTime: '',
  endTime: ''
})

// 计算当前月份和年份
const currentMonthYear = computed(() => {
  return currentDate.value.format('YYYY年MM月')
})

// 生成日历日期
const calendarDays = computed(() => {
  const days = []
  const year = currentDate.value.year()
  const month = currentDate.value.month()
  
  // 获取当月第一天
  const firstDay = dayjs(new Date(year, month, 1))
  // 获取当月第一天是星期几
  const startDay = firstDay.day()
  // 获取当月最后一天
  const lastDay = dayjs(new Date(year, month + 1, 0))
  // 获取当月天数
  const daysInMonth = lastDay.date()
  
  // 添加上个月的日期
  for (let i = startDay - 1; i >= 0; i--) {
    const date = dayjs(new Date(year, month, -i))
    days.push({
      date: date.format('YYYY-MM-DD'),
      day: date.date(),
      isCurrentMonth: false,
      isToday: date.isSame(dayjs(), 'day'),
      bookings: getBookingsOnDate(date)
    })
  }
  
  // 添加当月的日期
  for (let i = 1; i <= daysInMonth; i++) {
    const date = dayjs(new Date(year, month, i))
    days.push({
      date: date.format('YYYY-MM-DD'),
      day: i,
      isCurrentMonth: true,
      isToday: date.isSame(dayjs(), 'day'),
      bookings: getBookingsOnDate(date)
    })
  }
  
  // 添加下个月的日期，补满6行
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = dayjs(new Date(year, month + 1, i))
    days.push({
      date: date.format('YYYY-MM-DD'),
      day: i,
      isCurrentMonth: false,
      isToday: date.isSame(dayjs(), 'day'),
      bookings: getBookingsOnDate(date)
    })
  }
  
  return days
})

// 获取某一天的预约记录
const getBookingsOnDate = (date) => {
  return bookings.value
    .filter(booking => {
      const bookingDate = dayjs(booking.startTime)
      return bookingDate.isSame(date, 'day')
    })
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
}

// 获取选中日期的预约明细
const selectedDayDetail = computed(() => {
  return selectedDate.value.format('YYYY年MM月DD日')
})

// 上一月
const prevMonth = () => {
  // 只允许查看当前月份及之后的月份
  const currentMonth = dayjs().startOf('month')
  const targetMonth = currentDate.value.subtract(1, 'month').startOf('month')
  
  if (!targetMonth.isBefore(currentMonth)) {
    currentDate.value = currentDate.value.subtract(1, 'month')
  }
}

// 下一月
const nextMonth = () => {
  currentDate.value = currentDate.value.add(1, 'month')
}

// 检查是否是当前月份或之后的月份
const isCurrentOrFutureMonth = computed(() => {
  const currentMonth = dayjs().startOf('month')
  const targetMonth = currentDate.value.startOf('month')
  return !targetMonth.isBefore(currentMonth)
})

// 格式化日期时间
const formatDateTime = (dateTime) => {
  return dayjs(dateTime).format('YYYY-MM-DD HH:mm')
}

// 格式化时间
const formatTime = (dateTime) => {
  return dayjs(dateTime).format('HH:mm')
}

// 处理日期点击
const handleDayClick = (day) => {
  if (!day.isCurrentMonth || isPastDate(day.date)) return
  
  selectedDate.value = dayjs(day.date)
  
  // 获取当天的预约记录并按时间排序
  selectedDayBookings.value = bookings.value
    .filter(booking => {
      const bookingDate = dayjs(booking.startTime)
      return bookingDate.isSame(selectedDate.value, 'day')
    })
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  
  showDayDetailModal.value = true
}

// 打开预约弹框
const openBookingModal = () => {
  // 重置表单
  bookingForm.value = {
    name: '',
    startTime: '',
    endTime: ''
  }
  bookingMessage.value = ''
  showDayDetailModal.value = false
  showBookingModal.value = true
}

// 计算预约时长（小时）
const calculateDuration = () => {
  if (!bookingForm.value.startTime || !bookingForm.value.endTime) {
    return 0
  }
  
  // 使用当前选中的日期和输入的时间
  const startDate = selectedDate.value.format('YYYY-MM-DD')
  const start = dayjs(`${startDate} ${bookingForm.value.startTime}`)
  const end = dayjs(`${startDate} ${bookingForm.value.endTime}`)
  const duration = end.diff(start, 'hour', true)
  
  return duration.toFixed(1)
}

// 判断是否是过去的日期
const isPastDate = (dateStr) => {
  const date = dayjs(dateStr)
  const today = dayjs().startOf('day')
  return date.isBefore(today)
}

// 提交预约
const submitBooking = async () => {
  if (!bookingForm.value.name || !bookingForm.value.startTime || !bookingForm.value.endTime) {
    bookingMessage.value = '请填写完整的预约信息'
    bookingMessageType.value = 'error'
    return
  }
  
  // 使用当前选中的日期和输入的时间
  const selectedDateStr = selectedDate.value.format('YYYY-MM-DD')
  const startTime = dayjs(`${selectedDateStr} ${bookingForm.value.startTime}`)
  const endTime = dayjs(`${selectedDateStr} ${bookingForm.value.endTime}`)
  
  // 验证结束时间是否晚于开始时间
  if (endTime.isBefore(startTime)) {
    bookingMessage.value = '结束时间必须晚于开始时间'
    bookingMessageType.value = 'error'
    return
  }
  
  isSubmitting.value = true
  try {
    const result = await callCloudFunction('createBooking', {
      name: bookingForm.value.name,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    })
    
    if (result.success) {
      bookingMessage.value = '预约成功！'
      bookingMessageType.value = 'success'
      
      // 关闭弹框并刷新数据
      setTimeout(() => {
        showBookingModal.value = false
        fetchBookings()
      }, 1500)
    } else {
      bookingMessage.value = result.message || '预约失败，请稍后重试'
      bookingMessageType.value = 'error'
    }
  } catch (error) {
    bookingMessage.value = '预约失败，请稍后重试'
    bookingMessageType.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

// 获取预约记录
const fetchBookings = async () => {
  isLoading.value = true
  try {
    const result = await callCloudFunction('getBookings')
    if (result.success) {
      bookings.value = result.data
    } else {
      console.error('获取预约记录失败:', result.message)
    }
  } catch (error) {
    console.error('获取预约记录失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 删除预约记录
const deleteBooking = async (id) => {
  if (confirm('确定要删除这条预约记录吗？')) {
    try {
      const result = await callCloudFunction('deleteBooking', id)
      if (result.success) {
        fetchBookings()
        // 重新获取当前日期的预约记录并按时间排序
        selectedDayBookings.value = bookings.value
          .filter(booking => {
            const bookingDate = dayjs(booking.startTime)
            return bookingDate.isSame(selectedDate.value, 'day')
          })
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      } else {
        console.error('删除预约记录失败:', result.message)
      }
    } catch (error) {
      console.error('删除预约记录失败:', error)
    }
  }
}

// 暴露方法给父组件
defineExpose({
  fetchBookings
})

onMounted(() => {
  fetchBookings()
})
</script>