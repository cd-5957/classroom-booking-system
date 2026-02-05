<template>
  <div class="space-y-6">
    <!-- 操作按钮 -->
    <div class="flex flex-wrap gap-4 mb-6">
      <button 
        @click="showBookingModal = true"
        class="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        我要预约
      </button>
      <button 
        @click="showBatchBookingModal = true"
        class="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        批量预约
      </button>
    </div>

    <!-- 日历部分 -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">{{ currentMonthYear }}</h2>
        <div class="flex gap-2">
          <button 
            @click="prevMonth"
            :disabled="!canPrevMonth"
            class="bg-gray-200 hover:bg-gray-300 py-1 px-3 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上月
          </button>
          <button 
            @click="nextMonth"
            class="bg-gray-200 hover:bg-gray-300 py-1 px-3 rounded-md"
          >
            下月
          </button>
        </div>
      </div>

      <!-- 星期标题 -->
      <div class="grid grid-cols-7 gap-2 mb-2">
        <div 
          v-for="(day, index) in weekDays" 
          :key="index"
          class="text-center font-medium py-2"
        >
          {{ day }}
        </div>
      </div>

      <!-- 日历日期 -->
      <div class="grid grid-cols-7 gap-2">
        <div 
          v-for="(item, index) in calendarDays" 
          :key="index"
          :class="[
            'date-picker-item text-center py-3 rounded-md cursor-pointer',
            item.isCurrentMonth ? 'current-month' : 'other-month',
            item.isPastDate ? 'past-date' : '',
            item.selected ? 'selected' : '',
            item.bookingCount > 0 ? 'has-booking' : ''
          ]"
          @click="toggleDaySelection(item.date)"
        >
          <div class="date-picker-day">{{ item.day }}</div>
          <div v-if="item.bookingCount > 0" class="text-xs text-blue-600 mt-1">{{ item.bookingCount }} 个预约</div>
        </div>
      </div>
    </div>

    <!-- 预约记录列表 -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">预约记录</h2>
      <div v-if="bookings.length === 0" class="text-center py-8 text-gray-500">
        暂无预约记录
      </div>
      <div v-else class="space-y-4">
        <div 
          v-for="booking in sortedBookings" 
          :key="booking._id || booking.id"
          class="border border-gray-200 rounded-md p-4 hover:bg-gray-50"
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-medium">{{ booking.name }}</h3>
              <div class="text-sm text-gray-600 mt-1">
                <div>{{ formatDateTime(booking.startTime) }} - {{ formatDateTime(booking.endTime) }}</div>
                <div class="mt-1">{{ calculateDuration(booking.startTime, booking.endTime) }} 小时</div>
              </div>
            </div>
            <button 
              v-if="isAdmin"
              @click="deleteBooking(booking._id || booking.id)"
              class="text-red-600 hover:text-red-800 text-sm"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 预约弹窗 -->
    <div v-if="showBookingModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">提交预约</h3>
          <button @click="closeBookingModal" class="text-gray-500 hover:text-gray-700">×</button>
        </div>
        <form @submit.prevent="submitBooking" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">姓名</label>
            <input 
              v-model="bookingForm.name" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入姓名"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
            <input 
              v-model="bookingForm.startTime" 
              type="datetime-local" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
            <input 
              v-model="bookingForm.endTime" 
              type="datetime-local" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div class="flex justify-between items-center">
            <div class="text-sm text-gray-600">
              时长: {{ duration }} 小时
            </div>
            <button 
              type="button" 
              @click="calculateDefaultDuration"
              class="text-sm text-blue-600 hover:text-blue-800"
            >
              自动计算
            </button>
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

    <!-- 批量预约弹窗 -->
    <div v-if="showBatchBookingModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">批量预约</h3>
          <button @click="closeBatchBookingModal" class="text-gray-500 hover:text-gray-700">×</button>
        </div>
        <form @submit.prevent="submitBatchBooking" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">姓名</label>
            <input 
              v-model="batchBookingForm.name" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入姓名"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
            <input 
              v-model="batchBookingForm.startTime" 
              type="time" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
            <input 
              v-model="batchBookingForm.endTime" 
              type="time" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">选择日期 ({{ selectedDates.length }} 天)</label>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="(date, index) in selectedDates" 
                :key="index"
                class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                {{ date }} <button @click.stop="removeDateSelection(date)" class="ml-1 text-red-600 hover:text-red-800">&times;</button>
              </span>
            </div>
            <div v-if="selectedDates.length === 0" class="text-sm text-gray-500 mt-1">
              请在日历中选择日期
            </div>
          </div>
          <div class="flex justify-between items-center">
            <div class="text-sm text-gray-600">
              时长: {{ batchDuration }} 小时/天
            </div>
            <button 
              type="button" 
              @click="calculateBatchDefaultDuration"
              class="text-sm text-blue-600 hover:text-blue-800"
            >
              自动计算
            </button>
          </div>
          <button 
            type="submit" 
            :disabled="isSubmitting || selectedDates.length === 0" 
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? '提交中...' : `提交 ${selectedDates.length} 天预约` }}
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
import { ref, computed, onMounted, watch } from 'vue'

// 云函数HTTP触发器URL
const CLOUD_FUNCTION_URL = 'https://service-9l0f5w1b-1308503242.sh.apigw.tencentcs.com/release/bookings'

// 调用云函数的通用方法
const callCloudFunction = async (action, data = {}) => {
  try {
    const response = await fetch(CLOUD_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action, data })
    })
    const result = await response.json()
    return result
  } catch (error) {
    console.error('调用云函数出错:', error)
    throw error
  }
}

// Props
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

// 页面状态
const currentDate = ref(new Date())
const weekDays = ref(['日', '一', '二', '三', '四', '五', '六'])
const calendarDays = ref([])
const currentMonthYear = ref('')
const canPrevMonth = ref(false)
const bookings = ref([])
const selectedDates = ref([])

// 预约弹窗
const showBookingModal = ref(false)
const showBatchBookingModal = ref(false)
const selectedDate = ref('')

// 预约表单
const bookingForm = ref({
  name: '',
  startTime: '',
  endTime: ''
})
const batchBookingForm = ref({
  name: '',
  startTime: '',
  endTime: ''
})
const duration = ref('0.0')
const batchDuration = ref('0.0')
const isSubmitting = ref(false)
const bookingMessage = ref('')
const bookingMessageType = ref('')

// 计算属性：按时间排序的预约记录
const sortedBookings = computed(() => {
  return [...bookings.value].sort((a, b) => {
    return new Date(a.startTime) - new Date(b.startTime)
  })
})

// 初始化页面
onMounted(() => {
  initCalendar()
  fetchBookings()
})

// 监听日期变化，重新计算日历
watch(currentDate, () => {
  initCalendar()
})

// 监听表单时间变化，自动计算时长
watch(
  [() => bookingForm.value.startTime, () => bookingForm.value.endTime],
  () => {
    calculateDurationFromForm()
  }
)

watch(
  [() => batchBookingForm.value.startTime, () => batchBookingForm.value.endTime],
  () => {
    calculateBatchDurationFromForm()
  }
)

// 初始化日历
const initCalendar = () => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  // 计算当前月份和年份
  currentMonthYear.value = `${year}年${month + 1}月`
  
  // 生成日历日期
  calendarDays.value = generateCalendarDays(year, month)
  
  // 检查是否可以查看上一月
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const firstDayOfMonth = new Date(year, month, 1)
  canPrevMonth.value = firstDayOfMonth >= today
}

// 生成日历日期
const generateCalendarDays = (year, month) => {
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // 获取当月第一天
  const firstDay = new Date(year, month, 1)
  // 获取当月第一天是星期几
  const startDay = firstDay.getDay()
  // 获取当月最后一天
  const lastDay = new Date(year, month + 1, 0)
  // 获取当月天数
  const daysInMonth = lastDay.getDate()
  
  // 添加上个月的日期
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    const dateStr = formatDate(date)
    const isPastDate = date < today
    const dayBookings = getBookingsOnDate(date, bookings.value)
    
    days.push({
      date: dateStr,
      day: date.getDate(),
      isCurrentMonth: false,
      isPastDate: isPastDate,
      bookings: dayBookings,
      bookingCount: dayBookings.length,
      selected: selectedDates.value.includes(dateStr)
    })
  }
  
  // 添加当月的日期
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i)
    const dateStr = formatDate(date)
    const isPastDate = date < today
    const dayBookings = getBookingsOnDate(date, bookings.value)
    
    days.push({
      date: dateStr,
      day: i,
      isCurrentMonth: true,
      isPastDate: isPastDate,
      bookings: dayBookings,
      bookingCount: dayBookings.length,
      selected: selectedDates.value.includes(dateStr)
    })
  }
  
  // 添加下个月的日期，补满6行
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i)
    const dateStr = formatDate(date)
    const isPastDate = date < today
    const dayBookings = getBookingsOnDate(date, bookings.value)
    
    days.push({
      date: dateStr,
      day: i,
      isCurrentMonth: false,
      isPastDate: isPastDate,
      bookings: dayBookings,
      bookingCount: dayBookings.length,
      selected: selectedDates.value.includes(dateStr)
    })
  }
  
  return days
}

// 格式化日期
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  const formattedMonth = month < 10 ? '0' + month : month
  const formattedDay = day < 10 ? '0' + day : day
  
  return `${year}-${formattedMonth}-${formattedDay}`
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  const date = new Date(dateTime)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  
  const formattedMonth = month < 10 ? '0' + month : month
  const formattedDay = day < 10 ? '0' + day : day
  const formattedHours = hours < 10 ? '0' + hours : hours
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes
  
  return `${year}-${formattedMonth}-${formattedDay} ${formattedHours}:${formattedMinutes}`
}

// 获取某一天的预约记录
const getBookingsOnDate = (date, bookings) => {
  return bookings
    .filter(booking => {
      const bookingDate = new Date(booking.startTime)
      return isSameDay(bookingDate, date)
    })
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
}

// 判断是否是同一天
const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

// 切换月份
const prevMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

// 切换日期选择
const toggleDaySelection = (date) => {
  const index = selectedDates.value.indexOf(date)
  if (index > -1) {
    selectedDates.value.splice(index, 1)
  } else {
    selectedDates.value.push(date)
  }
  // 重新生成日历，更新选中状态
  initCalendar()
}

// 移除日期选择
const removeDateSelection = (date) => {
  const index = selectedDates.value.indexOf(date)
  if (index > -1) {
    selectedDates.value.splice(index, 1)
  }
  // 重新生成日历，更新选中状态
  initCalendar()
}

// 打开预约弹窗
const openBookingModal = (date) => {
  selectedDate.value = date
  showBookingModal.value = true
  // 设置默认时间
  const now = new Date()
  const defaultStart = new Date(date)
  defaultStart.setHours(9, 0, 0, 0)
  const defaultEnd = new Date(date)
  defaultEnd.setHours(10, 0, 0, 0)
  
  bookingForm.value = {
    name: '',
    startTime: defaultStart.toISOString().slice(0, 16),
    endTime: defaultEnd.toISOString().slice(0, 16)
  }
  calculateDefaultDuration()
}

// 关闭预约弹窗
const closeBookingModal = () => {
  showBookingModal.value = false
  resetBookingForm()
}

// 关闭批量预约弹窗
const closeBatchBookingModal = () => {
  showBatchBookingModal.value = false
  resetBatchBookingForm()
}

// 重置预约表单
const resetBookingForm = () => {
  bookingForm.value = {
    name: '',
    startTime: '',
    endTime: ''
  }
  duration.value = '0.0'
  bookingMessage.value = ''
  bookingMessageType.value = ''
  isSubmitting.value = false
}

// 重置批量预约表单
const resetBatchBookingForm = () => {
  batchBookingForm.value = {
    name: '',
    startTime: '',
    endTime: ''
  }
  batchDuration.value = '0.0'
  bookingMessage.value = ''
  bookingMessageType.value = ''
  isSubmitting.value = false
}

// 计算默认时长
const calculateDefaultDuration = () => {
  if (bookingForm.value.startTime && bookingForm.value.endTime) {
    const start = new Date(bookingForm.value.startTime)
    const end = new Date(bookingForm.value.endTime)
    const diff = (end - start) / (1000 * 60 * 60)
    duration.value = diff.toFixed(1)
  }
}

// 计算批量预约默认时长
const calculateBatchDefaultDuration = () => {
  if (batchBookingForm.value.startTime && batchBookingForm.value.endTime) {
    const [startHours, startMinutes] = batchBookingForm.value.startTime.split(':').map(Number)
    const [endHours, endMinutes] = batchBookingForm.value.endTime.split(':').map(Number)
    const diff = (endHours - startHours) + (endMinutes - startMinutes) / 60
    batchDuration.value = diff.toFixed(1)
  }
}

// 从表单计算时长
const calculateDurationFromForm = () => {
  calculateDefaultDuration()
}

// 从批量预约表单计算时长
const calculateBatchDurationFromForm = () => {
  calculateBatchDefaultDuration()
}

// 计算时长
const calculateDuration = (startTime, endTime) => {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const diff = (end - start) / (1000 * 60 * 60)
  return diff.toFixed(1)
}

// 获取预约记录
const fetchBookings = async () => {
  try {
    const result = await callCloudFunction('getBookings')
    if (result.success) {
      bookings.value = result.data || []
    }
  } catch (error) {
    console.error('获取预约记录失败:', error)
  }
}

// 提交预约
const submitBooking = async () => {
  // 表单验证
  if (!bookingForm.value.name || !bookingForm.value.startTime || !bookingForm.value.endTime) {
    bookingMessage.value = '请填写完整的预约信息'
    bookingMessageType.value = 'error'
    return
  }
  
  // 时间验证
  const start = new Date(bookingForm.value.startTime)
  const end = new Date(bookingForm.value.endTime)
  if (start >= end) {
    bookingMessage.value = '结束时间必须晚于开始时间'
    bookingMessageType.value = 'error'
    return
  }
  
  // 检查是否与现有预约冲突
  if (checkTimeConflict(start, end)) {
    bookingMessage.value = '该时间段已被预约，请选择其他时间'
    bookingMessageType.value = 'error'
    return
  }
  
  isSubmitting.value = true
  try {
    const result = await callCloudFunction('createBooking', {
      name: bookingForm.value.name,
      startTime: bookingForm.value.startTime,
      endTime: bookingForm.value.endTime
    })
    
    if (result.success) {
      bookingMessage.value = '预约成功！'
      bookingMessageType.value = 'success'
      // 重新获取预约记录
      await fetchBookings()
      // 关闭弹窗
      setTimeout(() => {
        closeBookingModal()
      }, 1500)
    } else {
      bookingMessage.value = result.message || '预约失败，请稍后重试'
      bookingMessageType.value = 'error'
    }
  } catch (error) {
    console.error('提交预约失败:', error)
    bookingMessage.value = '网络错误，请稍后重试'
    bookingMessageType.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

// 提交批量预约
const submitBatchBooking = async () => {
  // 表单验证
  if (!batchBookingForm.value.name || !batchBookingForm.value.startTime || !batchBookingForm.value.endTime) {
    bookingMessage.value = '请填写完整的预约信息'
    bookingMessageType.value = 'error'
    return
  }
  
  // 检查是否选择了日期
  if (selectedDates.value.length === 0) {
    bookingMessage.value = '请至少选择一天'
    bookingMessageType.value = 'error'
    return
  }
  
  // 时间验证
  const [startHours, startMinutes] = batchBookingForm.value.startTime.split(':').map(Number)
  const [endHours, endMinutes] = batchBookingForm.value.endTime.split(':').map(Number)
  if (startHours > endHours || (startHours === endHours && startMinutes >= endMinutes)) {
    bookingMessage.value = '结束时间必须晚于开始时间'
    bookingMessageType.value = 'error'
    return
  }
  
  isSubmitting.value = true
  try {
    let successCount = 0
    let errorCount = 0
    
    // 遍历选择的日期，逐个提交预约
    for (const date of selectedDates.value) {
      const [year, month, day] = date.split('-').map(Number)
      const startTime = new Date(year, month - 1, day, startHours, startMinutes)
      const endTime = new Date(year, month - 1, day, endHours, endMinutes)
      
      // 检查是否与现有预约冲突
      if (checkTimeConflict(startTime, endTime)) {
        errorCount++
        continue
      }
      
      const result = await callCloudFunction('createBooking', {
        name: batchBookingForm.value.name,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString()
      })
      
      if (result.success) {
        successCount++
      } else {
        errorCount++
      }
    }
    
    if (successCount > 0) {
      bookingMessage.value = `成功预约 ${successCount} 天，${errorCount} 天失败（可能时间冲突）`
      bookingMessageType.value = 'success'
      // 重新获取预约记录
      await fetchBookings()
      // 清空日期选择
      selectedDates.value = []
      // 关闭弹窗
      setTimeout(() => {
        closeBatchBookingModal()
        initCalendar()
      }, 1500)
    } else {
      bookingMessage.value = '预约失败，可能所有时间段都已被预约'
      bookingMessageType.value = 'error'
    }
  } catch (error) {
    console.error('提交批量预约失败:', error)
    bookingMessage.value = '网络错误，请稍后重试'
    bookingMessageType.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

// 删除预约
const deleteBooking = async (bookingId) => {
  if (!confirm('确定要删除这条预约记录吗？')) {
    return
  }
  
  try {
    const result = await callCloudFunction('deleteBooking', bookingId)
    if (result.success) {
      // 重新获取预约记录
      await fetchBookings()
    } else {
      alert('删除失败，请稍后重试')
    }
  } catch (error) {
    console.error('删除预约失败:', error)
    alert('网络错误，请稍后重试')
  }
}

// 检查时间冲突
const checkTimeConflict = (startTime, endTime) => {
  return bookings.value.some(booking => {
    const bookingStart = new Date(booking.startTime)
    const bookingEnd = new Date(booking.endTime)
    
    // 检查是否有时间重叠
    return (
      (startTime >= bookingStart && startTime < bookingEnd) ||
      (endTime > bookingStart && endTime <= bookingEnd) ||
      (startTime <= bookingStart && endTime >= bookingEnd)
    )
  })
}
</script>

<style scoped>
/* 日历样式 */
.date-picker-item {
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease;
}

.current-month {
  color: #333;
}

.other-month {
  color: #ccc;
}

.past-date {
  opacity: 0.5;
  cursor: not-allowed;
}

.selected {
  background-color: #e6f7ff;
  border: 2px solid #1890ff;
}

.has-booking {
  position: relative;
}

.has-booking::after {
  content: '';
  position: absolute;
  bottom: 2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #1890ff;
}

.date-picker-day {
  font-size: 16px;
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .date-picker-item {
    min-height: 60px;
  }
  
  .date-picker-day {
    font-size: 14px;
  }
}
</style>