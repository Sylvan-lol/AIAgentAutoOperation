const express = require('express');
const router = express.Router();

// 处理聊天请求（普通模式）
router.post('/message', async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        
        if (!message) {
            return res.status(400).json({
                status: 'error',
                message: 'Message is required'
            });
        }
        
        // 在路由处理函数内部导入 AgentService，确保环境变量已加载
        const agentService = require('../services/AgentService');
        const response = await agentService.handleMessage(message, conversationHistory);
        
        res.status(200).json({
            status: 'success',
            response
        });
    } catch (error) {
        console.error('Error in chat route:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to process message'
        });
    }
});

// 处理聊天请求（流式输出）
router.post('/message/stream', async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        
        if (!message) {
            return res.status(400).json({
                status: 'error',
                message: 'Message is required'
            });
        }
        
        // 设置响应头，启用 SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        // 在路由处理函数内部导入 AgentService，确保环境变量已加载
        const agentService = require('../services/AgentService');
        
        // 流式处理函数
        const streamResponse = async () => {
            try {
                // 模拟流式输出
                const response = await agentService.handleMessage(message, conversationHistory);
                
                // 分块发送响应
                const chunks = response.split(' ');
                for (const chunk of chunks) {
                    res.write(`data: ${chunk} `);
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                
                // 发送结束信号
                res.write('data: [DONE]');
                res.end();
            } catch (error) {
                console.error('Error in streaming chat route:', error);
                res.write(`data: 抱歉，我遇到了一个错误。请稍后再试。`);
                res.write('data: [DONE]');
                res.end();
            }
        };
        
        streamResponse();
    } catch (error) {
        console.error('Error in streaming chat route:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to process message'
        });
    }
});

module.exports = router;