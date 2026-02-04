import axios from 'axios';

// 测试创建预约
async function testCreateBooking() {
  try {
    console.log('测试创建预约...');
    const response = await axios.post('http://localhost:5000/api/bookings', {
      name: '测试用户',
      startTime: '2026-02-02T14:00:00.000Z',
      endTime: '2026-02-02T14:30:00.000Z'
    });
    console.log('预约创建成功:', response.data);
  } catch (error) {
    console.error('预约创建失败:', error.response?.data || error.message);
  }
}

// 测试获取预约列表
async function testGetBookings() {
  try {
    console.log('测试获取预约列表...');
    const response = await axios.get('http://localhost:5000/api/bookings');
    console.log('预约列表:', response.data);
  } catch (error) {
    console.error('获取预约列表失败:', error.message);
  }
}

// 运行测试
async function runTests() {
  await testGetBookings();
  await testCreateBooking();
  await testGetBookings();
}

runTests();