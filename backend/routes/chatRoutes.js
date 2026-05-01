const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');

/**
 * GET /api/chat/conversations
 * 获取当前用户的所有对话
 */
router.get('/conversations', (req, res) => {
  try {
    const conversations = Conversation.findByUserId(req.user.id);
    res.status(200).json({
      status: 'success',
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      status: 'error',
      message: '获取对话列表失败'
    });
  }
});

/**
 * DELETE /api/chat/conversations/:id
 * 删除指定对话
 */
router.delete('/conversations/:id', (req, res) => {
  try {
    const deleted = Conversation.delete(parseInt(req.params.id), req.user.id);
    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: '对话不存在或无权删除'
      });
    }
    res.status(200).json({
      status: 'success',
      message: '对话已删除'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({
      status: 'error',
      message: '删除对话失败'
    });
  }
});

/**
 * POST /api/chat/message
 * 处理聊天请求（普通模式）
 * 自动创建/复用对话并持久化消息
 */
router.post('/message', async (req, res) => {
    try {
        const { message, conversationId } = req.body;
        
        if (!message) {
            return res.status(400).json({
                status: 'error',
                message: '消息不能为空'
            });
        }
        
        // 获取或创建对话
        let conversation;
        if (conversationId) {
            conversation = Conversation.findById(conversationId);
            if (!conversation || conversation.user_id !== req.user.id) {
                return res.status(404).json({
                    status: 'error',
                    message: '对话不存在或无权访问'
                });
            }
        } else {
            // 查找最近的未关闭对话，没有则创建新对话
            conversation = Conversation.getRecentConversation(req.user.id);
            if (!conversation) {
                conversation = Conversation.create(req.user.id);
            }
        }
        
        // 保存用户消息到数据库
        Conversation.addMessage(conversation.id, 'user', message);
        
        // 获取最近的对话历史（最多20条）
        const recentMessages = Conversation.getRecentMessages(conversation.id, 20);
        const conversationHistory = recentMessages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
        
        // 调用 AgentService，传入用户信息
        const agentService = require('../services/AgentService');
        const response = await agentService.handleMessage(message, conversationHistory, req.user);
        
        // 保存 AI 回复到数据库
        Conversation.addMessage(conversation.id, 'assistant', response);
        
        // 如果对话还没有标题，用第一条用户消息作为标题
        if (recentMessages.length <= 1) {
            const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
            Conversation.updateTitle(conversation.id, title);
        }
        
        res.status(200).json({
            status: 'success',
            response,
            conversationId: conversation.id
        });
    } catch (error) {
        console.error('=== CHAT ROUTE ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        // 写入日志文件方便查看
        const fs = require('fs');
        fs.appendFileSync(__dirname + '/../error.log', 
            new Date().toISOString() + ' CHAT_ERROR: ' + error.stack + '\n\n');
        res.status(500).json({
            status: 'error',
            message: '处理消息失败'
        });
    }
});

/**
 * POST /api/chat/message/stream
 * 处理聊天请求（流式输出）
 */
router.post('/message/stream', async (req, res) => {
    try {
        const { message, conversationId } = req.body;
        
        if (!message) {
            return res.status(400).json({
                status: 'error',
                message: '消息不能为空'
            });
        }
        
        // 设置响应头，启用 SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        // 获取或创建对话
        let conversation;
        if (conversationId) {
            conversation = Conversation.findById(conversationId);
            if (!conversation || conversation.user_id !== req.user.id) {
                res.write(`data: 对话不存在或无权访问\n`);
                res.write('data: [DONE]\n');
                res.end();
                return;
            }
        } else {
            conversation = Conversation.getRecentConversation(req.user.id);
            if (!conversation) {
                conversation = Conversation.create(req.user.id);
            }
        }
        
        // 保存用户消息
        Conversation.addMessage(conversation.id, 'user', message);
        
        // 获取最近的对话历史
        const recentMessages = Conversation.getRecentMessages(conversation.id, 20);
        const conversationHistory = recentMessages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));
        
        // 流式处理
        const streamResponse = async () => {
            try {
                const agentService = require('../services/AgentService');
                const response = await agentService.handleMessage(message, conversationHistory, req.user);
                
                // 保存 AI 回复
                Conversation.addMessage(conversation.id, 'assistant', response);
                
                // 如果对话还没有标题，用第一条用户消息作为标题
                if (recentMessages.length <= 1) {
                    const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
                    Conversation.updateTitle(conversation.id, title);
                }
                
                // 分块发送响应
                const chunks = response.split(' ');
                for (const chunk of chunks) {
                    res.write(`data: ${chunk} \n`);
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                // 发送结束信号（包含 conversationId）
                res.write(`data: [CONVERSATION_ID]${conversation.id}\n`);
                res.write('data: [DONE]\n');
                res.end();
            } catch (error) {
                console.error('Error in streaming chat route:', error);
                res.write(`data: 抱歉，我遇到了一个错误。请稍后再试。\n`);
                res.write('data: [DONE]\n');
                res.end();
            }
        };
        
        streamResponse();
    } catch (error) {
        console.error('Error in streaming chat route:', error);
        res.status(500).json({
            status: 'error',
            message: '处理消息失败'
        });
    }
});

module.exports = router;
