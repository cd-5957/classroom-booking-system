// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化云开发环境
cloud.init({
  env: 'cloud1-2gs6ioay8f351f18'
})

// 获取数据库引用
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('云函数接收到的参数:', event)
  
  try {
    if (event.action === 'createBooking') {
      const { name, startTime, endTime } = event.data
      if (!name || !startTime || !endTime) {
        return { success: false, message: '缺少必要参数' }
      }
      
      try {
        // 尝试添加数据，云开发会自动创建集合
        const result = await db.collection('bookings').add({
          data: {
            name,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            createdAt: new Date()
          }
        })
        return { success: true, data: result }
      } catch (addError) {
        console.error('添加数据失败:', addError)
        return { success: false, message: '创建预约失败，请稍后重试' }
      }
    } else if (event.action === 'getBookings') {
      try {
        // 尝试获取数据，即使集合不存在也会返回空数组
        const result = await db.collection('bookings').get()
        return { success: true, data: result.data || [] }
      } catch (getError) {
        console.error('获取数据失败:', getError)
        return { success: true, data: [] }
      }
    } else if (event.action === 'deleteBooking') {
      const bookingId = event.data
      console.log('删除预约ID:', bookingId)
      if (!bookingId) {
        return { success: false, message: '缺少预约ID' }
      }
      
      try {
        // 删除预约记录
        const result = await db.collection('bookings').doc(bookingId).remove()
        console.log('删除结果:', result)
        return { success: true, data: result }
      } catch (deleteError) {
        console.error('删除数据失败:', deleteError)
        return { success: false, message: '删除预约失败，请稍后重试' }
      }
    } else {
      console.log('未知操作，action:', event.action)
      return { success: false, message: '未知操作' }
    }
  } catch (error) {
    console.error('云函数错误:', error)
    return { success: false, message: error.message }
  }
}