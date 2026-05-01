const jwt = require('jsonwebtoken');

/**
 * JWT 用户认证中间件
 * 验证请求头中的 Bearer Token，若有效则将用户信息注入 req.user
 */
module.exports = (req, res, next) => {
  // 排除认证相关路由
  if (req.path === '/api/auth/login' || req.path === '/api/auth/register') {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: '未提供认证令牌，请先登录'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const jwtSecret = process.env.JWT_SECRET || 'open-claw-dev-secret-key';
    const decoded = jwt.verify(token, jwtSecret);
    req.user = {
      id: decoded.id,
      username: decoded.username
    };
    next();
  } catch (error) {
    return res.status(403).json({
      status: 'error',
      message: '认证令牌无效或已过期，请重新登录'
    });
  }
};