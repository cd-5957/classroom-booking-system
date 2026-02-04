// pages/index/index.js
const app = getApp()

Page({
  data: {
    // 页面状态
    pageTitle: '逸动未来教室预约系统',
    isLoading: false,
    
    // 日历相关
    currentDate: new Date(),
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    calendarDays: [],
    currentMonthYear: '',
    canPrevMonth: false,
    
    // 预约相关
    bookings: [],
    userBookings: [], // 存储用户提交的预约记录
    showDayDetailModal: false,
    showBookingModal: false,
    selectedDate: '',
    selectedDayBookings: [],
    selectedDayDetail: '',
    
    // 预约表单
    bookingForm: {
      name: '',
      startTime: '',
      endTime: ''
    },
    duration: '0.0', // 预约时长
    isSubmitting: false,
    bookingMessage: '',
    bookingMessageType: '',
    
    // 管理员状态
    isAdmin: false,
    showAdminLoginModal: false,
    adminPassword: '',
    
    // 批量预约相关
    showBatchBookingModal: false,
    batchBookingForm: {
      name: '',
      startTime: '',
      endTime: ''
    },
    batchSelectedDates: [],
    batchDuration: '0.0',
    
    // 强制渲染标记
    _forceRender: Math.random()
  },
  
  onLoad() {
    // 初始化页面
    this.fetchBookings()
  },
  
  // 初始化日历
  initCalendar() {
    let currentDate = this.data.currentDate
    // 确保currentDate是一个Date对象
    if (!(currentDate instanceof Date)) {
      currentDate = new Date()
    }
    
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // 计算当前月份和年份
    const currentMonthYear = `${year}年${month + 1}月`
    
    // 生成日历日期
    const calendarDays = this.generateCalendarDays(year, month)
    
    // 检查是否可以查看上一月
    const today = new Date()
    const canPrevMonth = !(year < today.getFullYear() || (year === today.getFullYear() && month < today.getMonth()))
    
    console.log('日历数据:', {
      currentMonthYear,
      calendarDays: calendarDays.length,
      canPrevMonth
    })
    
    this.setData({
      currentMonthYear,
      calendarDays,
      canPrevMonth
    })
  },
  
  // 生成日历日期
  generateCalendarDays(year, month) {
    const days = []
    const bookings = this.data.bookings
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
      const dateStr = this.formatDate(date)
      const isPastDate = date < today
      const dayBookings = this.getBookingsOnDate(date, bookings)
      
      days.push({
        date: dateStr,
        day: date.getDate(),
        isCurrentMonth: false,
        isPastDate: isPastDate,
        bookings: dayBookings,
        bookingCount: dayBookings.length
      })
    }
    
    // 添加当月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      const dateStr = this.formatDate(date)
      const isPastDate = date < today
      const dayBookings = this.getBookingsOnDate(date, bookings)
      
      days.push({
        date: dateStr,
        day: i,
        isCurrentMonth: true,
        isPastDate: isPastDate,
        bookings: dayBookings,
        bookingCount: dayBookings.length
      })
    }
    
    // 添加下个月的日期，补满6行
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i)
      const dateStr = this.formatDate(date)
      const isPastDate = date < today
      const dayBookings = this.getBookingsOnDate(date, bookings)
      
      days.push({
        date: dateStr,
        day: i,
        isCurrentMonth: false,
        isPastDate: isPastDate,
        bookings: dayBookings,
        bookingCount: dayBookings.length
      })
    }
    
    return days
  },
  
  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    // 手动补零，确保兼容性
    const formattedMonth = month < 10 ? '0' + month : month
    const formattedDay = day < 10 ? '0' + day : day
    
    return `${year}-${formattedMonth}-${formattedDay}`
  },
  
  // 获取某一天的预约记录
  getBookingsOnDate(date, bookings) {
    return bookings
      .filter(booking => {
        const bookingDate = new Date(booking.startTime)
        return this.isSameDay(bookingDate, date)
      })
      .map(booking => {
        // 格式化时间为HH:MM格式
        const startDate = new Date(booking.startTime)
        const endDate = new Date(booking.endTime)
        const startTimeStr = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`
        const endTimeStr = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
        
        return {
          ...booking,
          startTimeStr,
          endTimeStr
        }
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  },
  
  // 判断是否是同一天
  isSameDay(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  },
  
  // 格式化时间
  formatTime(dateStr) {
    if (!dateStr) return '--:--'
    
    try {
      console.log('格式化时间:', dateStr)
      // 直接创建Date对象，ISO格式的字符串应该能被正确解析
      const date = new Date(dateStr)
      
      // 检查是否是有效的Date对象
      if (isNaN(date.getTime())) {
        console.error('无效的时间字符串:', dateStr)
        return '--:--'
      }
      
      // 简单的时间格式化方法
      const hours = date.getHours()
      const minutes = date.getMinutes()
      
      // 输出调试信息
      console.log('解析后的时间:', date)
      console.log('小时:', hours)
      console.log('分钟:', minutes)
      
      const formattedHours = hours < 10 ? '0' + hours : hours
      const formattedMinutes = minutes < 10 ? '0' + minutes : minutes
      const result = `${formattedHours}:${formattedMinutes}`
      console.log('格式化结果:', result)
      return result
    } catch (error) {
      console.error('时间格式化错误:', error, '时间字符串:', dateStr)
      return '--:--'
    }
  },
  
  // 获取预约记录
  fetchBookings() {
    this.setData({ isLoading: true })
    
    // 调用云函数获取预约记录
    wx.cloud.callFunction({
      name: 'bookings',
      data: {
        action: 'getBookings'
      },
      success: (res) => {
        console.log('云函数返回数据:', res.result)
        if (res.result.success) {
          this.setData({ bookings: res.result.data })
          console.log('设置后的bookings数据:', this.data.bookings)
        } else {
          console.error('获取预约记录失败:', res.result.message)
          this.setData({ bookings: [] })
        }
        this.initCalendar()
      },
      fail: (error) => {
        console.error('云函数调用失败:', error)
        this.setData({ bookings: [] })
        this.initCalendar()
      },
      complete: () => {
        this.setData({ isLoading: false })
      }
    })
    
    // 模拟预约数据，实际项目中应该从后端API获取
    /*
    const mockBookings = [
      {
        _id: '1',
        name: '张三',
        startTime: new Date('2026-02-02T09:00:00').toISOString(),
        endTime: new Date('2026-02-02T10:30:00').toISOString()
      },
      {
        _id: '2',
        name: '李四',
        startTime: new Date('2026-02-02T14:00:00').toISOString(),
        endTime: new Date('2026-02-02T15:30:00').toISOString()
      },
      {
        _id: '3',
        name: '王五',
        startTime: new Date('2026-02-03T10:00:00').toISOString(),
        endTime: new Date('2026-02-03T11:30:00').toISOString()
      }
    ]
    
    // 延迟模拟网络请求
    setTimeout(() => {
      // 合并模拟数据和用户预约记录
      const allBookings = [...mockBookings, ...this.data.userBookings]
      this.setData({ bookings: allBookings })
      this.initCalendar()
      this.setData({ isLoading: false })
    }, 500)
    */
  },
  
  // 处理日期点击
  handleDayClick(e) {
    const day = e.currentTarget.dataset.day
    
    // 如果是过去的日期，不允许点击
    if (day.isPastDate) {
      wx.showToast({
        title: '过去的日期不可预约',
        icon: 'none'
      })
      return
    }
    
    const selectedDate = day.date
    // 从最新的bookings数据中获取预约记录，而不是使用day.bookings
    const selectedDateObj = new Date(selectedDate)
    let selectedDayBookings = this.getBookingsOnDate(selectedDateObj, this.data.bookings)
    const selectedDayDetail = `${selectedDate} 预约明细`
    
    // 输出调试信息
    console.log('选中的日期:', selectedDate)
    console.log('预约记录:', selectedDayBookings)
    console.log('最新的bookings数据:', this.data.bookings)
    
    // 检查预约记录的数据结构
    if (selectedDayBookings && selectedDayBookings.length > 0) {
      console.log('第一个预约记录:', selectedDayBookings[0])
      console.log('第一个预约记录的startTime:', selectedDayBookings[0].startTime)
      console.log('第一个预约记录的endTime:', selectedDayBookings[0].endTime)
      
      // 预处理预约记录，格式化时间
      selectedDayBookings = selectedDayBookings.map(booking => {
        // 将UTC时间转换为本地时间（UTC+8）
        const startDate = new Date(booking.startTime)
        const endDate = new Date(booking.endTime)
        
        // 直接使用UTC时间的小时数，因为booking.startTime是ISO格式的UTC时间
        // 不需要再加8小时，因为toISOString()已经将本地时间转换为UTC时间了
        
        // 格式化时间为HH:MM格式
        const startTimeStr = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`
        const endTimeStr = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`
        
        console.log('格式化时间:', startTimeStr, '-', endTimeStr)
        console.log('预约人姓名:', booking.name)
        console.log('用户是否为管理员:', this.data.isAdmin)
        
        // 普通用户不显示预约人姓名，显示"已预约"
        if (!this.data.isAdmin) {
          return {
            ...booking,
            startTimeStr,
            endTimeStr,
            name: '已预约'
          }
        }
        
        return {
          ...booking,
          startTimeStr,
          endTimeStr,
          // 确保预约记录有name字段
          name: booking.name || booking.id || '未知用户'
        }
      })
      
      console.log('预处理后的预约记录:', selectedDayBookings)
    }
    
    this.setData({
      selectedDate,
      selectedDayBookings,
      selectedDayDetail,
      showDayDetailModal: true
    })
  },
  
  // 上一月
  prevMonth() {
    let currentDate = this.data.currentDate
    // 确保currentDate是一个Date对象
    if (!(currentDate instanceof Date)) {
      currentDate = new Date()
    }
    
    const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    this.setData({ currentDate: prevMonthDate })
    this.initCalendar()
  },
  
  // 下一月
  nextMonth() {
    let currentDate = this.data.currentDate
    // 确保currentDate是一个Date对象
    if (!(currentDate instanceof Date)) {
      currentDate = new Date()
    }
    
    const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    this.setData({ currentDate: nextMonthDate })
    this.initCalendar()
  },
  
  // 关闭当日预约明细弹框
  closeDayDetailModal() {
    this.setData({ showDayDetailModal: false })
  },
  
  // 删除预约记录
  deleteBooking(e) {
    const bookingId = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条预约记录吗？',
      success: (res) => {
        if (res.confirm) {
          // 调用云函数删除预约记录
          wx.cloud.callFunction({
            name: 'bookings',
            data: {
              action: 'deleteBooking',
              data: bookingId
            },
            success: (res) => {
              console.log('删除预约响应:', res.result)
              if (res.result.success) {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                // 重新获取预约记录
                this.fetchBookings()
                // 关闭弹框
                this.setData({ showDayDetailModal: false })
              } else {
                wx.showToast({
                  title: '删除失败',
                  icon: 'none'
                })
              }
            },
            fail: (error) => {
              console.error('删除预约记录失败:', error)
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          })
        }
      }
    })
  },
  
  // 打开预约弹框
  openBookingModal() {
    this.setData({
      bookingForm: {
        name: '',
        startTime: '',
        endTime: ''
      },
      bookingMessage: '',
      bookingMessageType: '',
      showBookingModal: true
    })
  },
  
  // 关闭预约弹框
  closeBookingModal() {
    this.setData({ showBookingModal: false })
  },
  
  // 打开管理员登录弹框
  openAdminLoginModal() {
    this.setData({ showAdminLoginModal: true })
  },
  
  // 关闭管理员登录弹框
  closeAdminLoginModal() {
    this.setData({ 
      showAdminLoginModal: false,
      adminPassword: ''
    })
  },
  
  // 处理管理员密码输入
  handleAdminPasswordInput(e) {
    this.setData({ adminPassword: e.detail.value })
  },
  
  // 提交管理员登录
  submitAdminLogin() {
    const { adminPassword } = this.data
    
    // 简单的密码验证，实际项目中应该使用更安全的验证方式
    if (adminPassword === 'admin123') {
      this.setData({ 
        isAdmin: true,
        showAdminLoginModal: false,
        adminPassword: ''
      })
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
    } else {
      wx.showToast({
        title: '密码错误',
        icon: 'none'
      })
    }
  },
  
  // 退出管理员登录
  logoutAdmin() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出管理员登录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ isAdmin: false })
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  },
  
  // 处理表单输入
  handleInput(e) {
    const name = e.currentTarget.dataset.name || e.currentTarget.name
    const value = e.detail.value
    if (!name) return
    
    const bookingForm = this.data.bookingForm
    bookingForm[name] = value
    this.setData({ bookingForm })
  },
  
  // 处理时间选择
  handleTimeChange(e) {
    const { name } = e.currentTarget.dataset
    const value = e.detail.value
    console.log('时间选择:', name, value)
    
    // 更新bookingForm
    this.setData({
      bookingForm: {
        ...this.data.bookingForm,
        [name]: value
      }
    })
    
    // 计算并更新时长
    const { startTime, endTime } = this.data.bookingForm
    if (startTime && endTime) {
      try {
        // 直接使用时间字符串创建Date对象
        const start = new Date(`2000-01-01 ${startTime}`)
        const end = new Date(`2000-01-01 ${endTime}`)
        
        // 检查是否是有效的Date对象
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          const duration = (end - start) / (1000 * 60 * 60)
          const durationStr = duration.toFixed(1)
          console.log('预约时长:', durationStr)
          this.setData({ duration: durationStr })
        } else {
          console.error('无效的时间:', start, end)
          this.setData({ duration: '0.0' })
        }
      } catch (error) {
        console.error('计算时长错误:', error)
        this.setData({ duration: '0.0' })
      }
    } else {
      this.setData({ duration: '0.0' })
    }
  },
  
  // 计算预约时长
  calculateDuration() {
    const { startTime, endTime } = this.data.bookingForm
    console.log('计算时长:', startTime, endTime)
    if (!startTime || !endTime) {
      console.log('开始或结束时间为空')
      return '0.0'
    }
    
    try {
      // 直接使用时间字符串创建Date对象
      const start = new Date(`2000-01-01 ${startTime}`)
      const end = new Date(`2000-01-01 ${endTime}`)
      
      // 检查是否是有效的Date对象
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.error('无效的时间:', start, end)
        return '0.0'
      }
      
      // 输出调试信息
      console.log('开始时间:', start)
      console.log('结束时间:', end)
      console.log('开始时间.getTime():', start.getTime())
      console.log('结束时间.getTime():', end.getTime())
      
      const duration = (end - start) / (1000 * 60 * 60)
      console.log('时长:', duration)
      console.log('时长.toFixed(1):', duration.toFixed(1))
      
      return duration.toFixed(1)
    } catch (error) {
      console.error('计算时长错误:', error)
      return '0.0'
    }
  },
  
  // 提交预约
  submitBooking(e) {
    const { name, startTime, endTime } = this.data.bookingForm
    
    if (!name || !startTime || !endTime) {
      this.setData({
        bookingMessage: '请填写完整的预约信息',
        bookingMessageType: 'error'
      })
      return
    }
    
    // 使用当前选中的日期和输入的时间
    const selectedDate = this.data.selectedDate
    const startDateTime = new Date(`${selectedDate} ${startTime}`)
    const endDateTime = new Date(`${selectedDate} ${endTime}`)
    
    // 验证结束时间是否晚于开始时间
    if (endDateTime < startDateTime) {
      this.setData({
        bookingMessage: '结束时间必须晚于开始时间',
        bookingMessageType: 'error'
      })
      return
    }
    
    this.setData({ isSubmitting: true })
    
    // 调用云函数提交预约
    wx.cloud.callFunction({
      name: 'bookings',
      data: {
        action: 'createBooking',
        data: {
          name,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString()
        }
      },
      success: (res) => {
        console.log('云函数返回数据:', res.result)
        if (res.result.success) {
          // 预约成功，直接返回首页
          this.setData({
            bookingMessage: '预约成功！',
            bookingMessageType: 'success',
            showBookingModal: false
          })
          
          // 刷新数据后返回首页
          this.fetchBookings()
          wx.showToast({
            title: '预约成功！',
            icon: 'success',
            duration: 1500
          })
          
          // 延迟返回首页，让用户看到成功提示
          setTimeout(() => {
            wx.navigateBack({ delta: 1 })
          }, 1500)
        } else {
          // 预约失败，显示云函数返回的错误消息
          this.setData({
            bookingMessage: res.result.message || '预约失败，请稍后重试',
            bookingMessageType: 'error'
          })
        }
      },
      fail: (error) => {
        console.error('云函数调用失败:', error)
        this.setData({
          bookingMessage: '预约失败，请稍后重试',
          bookingMessageType: 'error'
        })
      },
      complete: () => {
        this.setData({ isSubmitting: false })
      }
    })
    
    // 模拟预约提交
    /*
    setTimeout(() => {
      // 创建新的预约记录
      const newBooking = {
        _id: 'new_' + Date.now(),
        name: name,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      }
      
      // 添加到用户预约记录中
      const userBookings = [...this.data.userBookings, newBooking]
      this.setData({ userBookings })
      
      this.setData({
        bookingMessage: '预约成功！',
        bookingMessageType: 'success'
      })
      
      // 关闭弹框并刷新数据
      setTimeout(() => {
        this.setData({ showBookingModal: false })
        this.fetchBookings()
      }, 1500)
      
      this.setData({ isSubmitting: false })
    }, 1000)
    */
  },
  
  // 打开批量预约弹框
  openBatchBookingModal() {
    // 重置批量预约表单
    this.setData({
      showBatchBookingModal: true,
      batchBookingForm: {
        name: '',
        startTime: '',
        endTime: ''
      },
      batchSelectedDates: [],
      batchDuration: '0.0'
    })
  },
  
  // 关闭批量预约弹框
  closeBatchBookingModal() {
    this.setData({
      showBatchBookingModal: false
    })
  },
  
  // 处理批量预约表单输入
  handleBatchInput(e) {
    const { name } = e.currentTarget.dataset
    const value = e.detail.value
    
    this.setData({
      batchBookingForm: {
        ...this.data.batchBookingForm,
        [name]: value
      }
    })
  },
  
  // 处理批量预约时间选择
  handleBatchTimeChange(e) {
    const { name } = e.currentTarget.dataset
    const value = e.detail.value
    
    this.setData({
      batchBookingForm: {
        ...this.data.batchBookingForm,
        [name]: value
      }
    })
    
    // 计算并更新时长
    const { startTime, endTime } = this.data.batchBookingForm
    if (startTime && endTime) {
      try {
        const start = new Date(`2000-01-01 ${startTime}`)
        const end = new Date(`2000-01-01 ${endTime}`)
        
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          const duration = (end - start) / (1000 * 60 * 60)
          const durationStr = duration.toFixed(1)
          this.setData({ batchDuration: durationStr })
        } else {
          this.setData({ batchDuration: '0.0' })
        }
      } catch (error) {
        console.error('计算时长错误:', error)
        this.setData({ batchDuration: '0.0' })
      }
    } else {
      this.setData({ batchDuration: '0.0' })
    }
  },
  
  // 检查日期是否被选中并返回对应的类名
  isSelected(date) {
    if (!this.data.batchSelectedDates) {
      return '';
    }
    for (let i = 0; i < this.data.batchSelectedDates.length; i++) {
      if (this.data.batchSelectedDates[i] === date) {
        console.log('日期', date, '被选中，返回selected类');
        return 'selected';
      }
    }
    console.log('日期', date, '未被选中，返回空类');
    return '';
  },

  // 检查日期是否被选中（布尔值）
  isDateSelected(date) {
    if (!this.data.batchSelectedDates) {
      return false;
    }
    for (let i = 0; i < this.data.batchSelectedDates.length; i++) {
      if (this.data.batchSelectedDates[i] === date) {
        return true;
      }
    }
    return false;
  },

  // 切换日期选择状态
  toggleBatchDate(e) {
    console.log('toggleBatchDate被调用');
    console.log('事件对象:', e);
    const date = e.currentTarget.dataset.date;
    console.log('点击的日期:', date);
    console.log('点击的日期类型:', typeof date);
    
    // 确保 date 存在
    if (!date) {
      console.error('日期为空');
      return;
    }
    
    // 格式化日期，确保格式一致
    const formattedDate = date;
    console.log('格式化后的日期:', formattedDate);
    
    const currentSelected = this.data.batchSelectedDates;
    console.log('当前选中的日期:', currentSelected);
    console.log('当前选中的日期类型:', typeof currentSelected);
    
    // 使用更可靠的方法检查日期是否被选中
    let isCurrentlySelected = false;
    for (let i = 0; i < currentSelected.length; i++) {
      console.log('比较日期:', currentSelected[i], 'vs', formattedDate);
      console.log('比较结果:', currentSelected[i] === formattedDate);
      if (currentSelected[i] === formattedDate) {
        isCurrentlySelected = true;
        break;
      }
    }
    console.log('当前日期是否被选中:', isCurrentlySelected);
    
    let newSelected;
    if (isCurrentlySelected) {
      // 取消选择
      newSelected = [];
      for (let i = 0; i < currentSelected.length; i++) {
        if (currentSelected[i] !== formattedDate) {
          newSelected.push(currentSelected[i]);
        }
      }
      console.log('取消选择后的日期:', newSelected);
    } else {
      // 添加选择
      newSelected = [...currentSelected, formattedDate];
      console.log('添加选择后的日期:', newSelected);
    }
    
    // 更新数据
    console.log('准备更新batchSelectedDates:', newSelected);
    
    // 先获取当前的calendarDays
    const currentCalendarDays = this.data.calendarDays;
    console.log('当前calendarDays长度:', currentCalendarDays.length);
    
    // 更新calendarDays，确保保留所有原有属性
    const updatedCalendarDays = currentCalendarDays.map(day => {
      const isSelected = newSelected.includes(day.date);
      console.log('日历项', day.date, '是否被选中:', isSelected);
      console.log('日历项原有属性:', {
        isCurrentMonth: day.isCurrentMonth,
        isPastDate: day.isPastDate,
        bookingCount: day.bookingCount
      });
      
      // 保留所有原有属性，只添加或更新selected属性
      return {
        date: day.date,
        day: day.day,
        isCurrentMonth: day.isCurrentMonth,
        isPastDate: day.isPastDate,
        bookings: day.bookings,
        bookingCount: day.bookingCount,
        selected: isSelected
      };
    });
    
    console.log('更新后的calendarDays长度:', updatedCalendarDays.length);
    
    this.setData({
      batchSelectedDates: newSelected,
      calendarDays: updatedCalendarDays
    }, () => {
      console.log('batchSelectedDates更新后:', this.data.batchSelectedDates);
      console.log('更新后选中日期数量:', this.data.batchSelectedDates ? this.data.batchSelectedDates.length : 0);
      
      // 验证calendarDays中的selected属性
      console.log('验证calendarDays中的selected属性:');
      for (let i = 0; i < this.data.calendarDays.length; i++) {
        if (this.data.calendarDays[i].selected) {
          console.log('日历项', this.data.calendarDays[i].date, '被标记为选中');
        }
      }
    });
  },
  
  // 提交批量预约
  submitBatchBooking() {
    const { batchBookingForm, batchSelectedDates } = this.data
    const { name, startTime, endTime } = batchBookingForm
    
    // 验证表单
    if (!name) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      })
      return
    }
    
    if (!startTime || !endTime) {
      wx.showToast({
        title: '请选择开始和结束时间',
        icon: 'none'
      })
      return
    }
    
    if (batchSelectedDates.length === 0) {
      wx.showToast({
        title: '请选择至少一个日期',
        icon: 'none'
      })
      return
    }
    
    // 验证时间顺序
    if (startTime >= endTime) {
      wx.showToast({
        title: '开始时间必须早于结束时间',
        icon: 'none'
      })
      return
    }
    
    this.setData({ isSubmitting: true })
    
    // 批量提交预约
    const promises = batchSelectedDates.map(date => {
      return new Promise((resolve, reject) => {
        // 生成完整的开始和结束时间
        const startDateTime = new Date(`${date} ${startTime}`);
        const endDateTime = new Date(`${date} ${endTime}`);
        
        console.log('批量预约请求数据:', {
          date,
          startTime,
          endTime,
          formattedStartTime: startDateTime.toISOString(),
          formattedEndTime: endDateTime.toISOString()
        });
        
        // 调用云函数提交预约
        wx.cloud.callFunction({
          name: 'bookings',
          data: {
            action: 'createBooking',
            data: {
              name,
              startTime: startDateTime.toISOString(),
              endTime: endDateTime.toISOString()
            }
          },
          success: (res) => {
            console.log('批量预约响应:', res);
            if (res.result.success) {
              resolve(res.result.data)
            } else {
              reject(new Error(`预约失败: ${res.result.message || '未知错误'}`))
            }
          },
          fail: (error) => {
            console.error('批量预约请求失败:', error);
            reject(error)
          }
        })
      })
    })
    
    Promise.all(promises)
      .then((results) => {
        console.log('批量预约成功:', results)
        
        // 更新预约数据
        this.fetchBookings()
        
        // 关闭弹框
        this.setData({
          showBatchBookingModal: false,
          isSubmitting: false
        })
        
        // 显示成功提示
        wx.showToast({
          title: `成功预约 ${batchSelectedDates.length} 个日期`,
          icon: 'success'
        })
      })
      .catch((error) => {
        console.error('批量预约失败:', error)
        this.setData({ isSubmitting: false })
        
        wx.showToast({
          title: '预约失败，请重试',
          icon: 'none'
        })
      })
  }
})