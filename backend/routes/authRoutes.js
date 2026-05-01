const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

/**
 * POST /api/auth/register
 * 用户注册
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: '用户名和密码不能为空'
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        status: 'error',
        message: '用户名至少需要3个字符'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: '密码至少需要6个字符'
      });
    }

    // 检查用户名是否已存在（数据库层）
    const existingUser = User.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: '用户名已存在'
      });
    }

    // 创建用户（数据库持久化）
    const newUser = await User.create(username, password);

    // 生成 JWT Token
    const jwtSecret = process.env.JWT_SECRET || 'open-claw-dev-secret-key';
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      status: 'success',
      message: '注册成功',
      data: {
        token,
        user: {
          id: newUser.id,
          username: newUser.username
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      status: 'error',
      message: '注册失败，请稍后再试'
    });
  }
});

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: '用户名和密码不能为空'
      });
    }

    // 从数据库查找用户
    const user = User.findByUsername(username);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: '用户名或密码错误'
      });
    }

    // 验证密码
    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: '用户名或密码错误'
      });
    }

    // 生成 JWT Token
    const jwtSecret = process.env.JWT_SECRET || 'open-claw-dev-secret-key';
    const token = jwt.sign(
      { id: user.id, username: user.username },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      status: 'success',
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: '登录失败，请稍后再试'
    });
  }
});

module.exports = router;
