const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const chatRoutes = require('./routes/chatRoutes');
const fileRoutes = require('./routes/fileRoutes');

// 使用绝对路径加载 .env 文件
const envPath = path.resolve(__dirname, '.env');
console.log('Loading .env file from:', envPath);
dotenv.config({ path: envPath });
console.log('PORT:', process.env.PORT);
console.log('LLM_API_KEY:', process.env.LLM_API_KEY ? 'Set' : 'Not set');
console.log('LLM_BASE_URL:', process.env.LLM_BASE_URL);

const app = express();

// 企业级中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由分发
app.use('/api/chat', chatRoutes);
app.use('/api/files', fileRoutes);

// 全局错误处理
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[Open Claw] Server is running on port ${PORT}`);
});