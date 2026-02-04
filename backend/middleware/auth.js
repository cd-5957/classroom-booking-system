// 管理员验证中间件
const isAdmin = (req, res, next) => {
  // 从请求头中获取管理员标识
  const adminHeader = req.headers['x-admin-auth'];
  
  if (!adminHeader || adminHeader !== 'true') {
    return res.status(403).json({ message: '无权限执行此操作' });
  }
  
  next();
};

module.exports = isAdmin;