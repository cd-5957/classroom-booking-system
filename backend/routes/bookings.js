const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const isAdmin = require('../middleware/auth');

// 获取所有预约记录
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: '获取预约记录失败' });
  }
});

// 创建新的预约记录
router.post('/', async (req, res) => {
  const { name, startTime, endTime } = req.body;
  
  // 创建新的预约记录
  try {
    console.log('收到预约请求:', { name, startTime, endTime });
    
    const conflictingBooking = await Booking.findOne({
      $and: [{ startTime: { $lt: endTime } }, { endTime: { $gt: startTime } }]
    });
    
    if (conflictingBooking) {
      console.log('时间冲突:', conflictingBooking);
      return res.status(400).json({ message: '该时间段已被占用' });
    }
    
    const newBooking = new Booking({ name, startTime, endTime });
    console.log('创建预约对象:', newBooking);
    await newBooking.save();
    console.log('预约保存成功:', newBooking);
    res.status(201).json(newBooking);
  } catch (error) {
    console.error('创建预约失败:', error);
    res.status(500).json({ message: '创建预约记录失败' });
  }
});

// 删除预约记录（仅管理员）
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: '预约记录已删除' });
  } catch (error) {
    res.status(500).json({ message: '删除预约记录失败' });
  }
});

module.exports = router;