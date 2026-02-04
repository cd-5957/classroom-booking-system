// app.js
App({
  globalData: {
    isAdmin: false,
    adminName: '',
    cloudEnv: 'cloud1-2gs6ioay8f351f18' // 云环境ID
  },
  onLaunch() {
    // 初始化云开发环境
    wx.cloud.init({
      env: this.globalData.cloudEnv,
      traceUser: true
    })
    
    // 检查本地存储中的登录状态
    const isAdmin = wx.getStorageSync('isAdmin')
    const adminName = wx.getStorageSync('adminName')
    
    if (isAdmin) {
      this.globalData.isAdmin = true
      this.globalData.adminName = adminName
    }
  },
  // 登录方法
  login(adminInfo) {
    this.globalData.isAdmin = true
    this.globalData.adminName = adminInfo.username
    wx.setStorageSync('isAdmin', true)
    wx.setStorageSync('adminName', adminInfo.username)
  },
  // 登出方法
  logout() {
    this.globalData.isAdmin = false
    this.globalData.adminName = ''
    wx.removeStorageSync('isAdmin')
    wx.removeStorageSync('adminName')
  }
})