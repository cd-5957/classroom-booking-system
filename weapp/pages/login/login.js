// pages/login/login.js
const app = getApp()

Page({
  data: {
    username: '',
    password: '',
    isSubmitting: false,
    loginMessage: '',
    loginMessageType: ''
  },
  
  // 处理表单输入
  handleInput(e) {
    const { name, value } = e.detail
    this.setData({ [name]: value })
  },
  
  // 处理登录
  handleLogin(e) {
    const { username, password } = e.detail.value
    
    if (!username || !password) {
      this.setData({
        loginMessage: '请填写用户名和密码',
        loginMessageType: 'error'
      })
      return
    }
    
    // 简化处理，直接验证用户名和密码
    if (username === 'admin' && password === 'admin123') {
      // 登录成功
      app.login({ username })
      
      this.setData({
        loginMessage: '登录成功！',
        loginMessageType: 'success'
      })
      
      // 跳转回首页
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } else {
      // 登录失败
      this.setData({
        loginMessage: '用户名或密码错误',
        loginMessageType: 'error'
      })
    }
  },
  
  // 处理关闭
  handleClose() {
    wx.navigateBack()
  }
})