const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bookingRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/bookings', bookingRoutes);

// 数据库连接 - 使用MongoDB Atlas云端数据库
// 注意：请替换为您自己的MongoDB Atlas连接字符串
mongoose.connect('mongodb://localhost:27017/classroom-booking', {
  // 移除过时的选项
}).then(() => {
  console.log('数据库连接成功');
}).catch((error) => {
  console.error('数据库连接失败:', error);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});