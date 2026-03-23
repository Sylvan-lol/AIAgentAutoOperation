import { defineStore } from 'pinia';
import { chatApi } from '../api';

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [
      {
        role: 'assistant',
        content: '你好！我是 Open Claw，你的企业级 AI 助手。我可以帮助你管理文件和发送邮件。请问有什么可以帮助你的？'
      }
    ],
    loading: false,
    // 对话历史，用于实现对话记忆
    conversationHistory: []
  }),
  actions: {
    async sendMessage(message) {
      // 添加用户消息到列表
      this.messages.push({ role: 'user', content: message });
      // 添加到对话历史
      this.conversationHistory.push({ role: 'user', content: message });
      this.loading = true;
      
      try {
        // 使用流式输出
        const assistantMessageIndex = this.messages.length;
        // 添加一个空的助手消息，用于实时更新
        this.messages.push({ role: 'assistant', content: '' });
        
        // 将对话历史发送给后端，实现对话记忆
        await chatApi.sendMessageStream(
          message, 
          this.conversationHistory,
          (chunk) => {
            // 更新助手消息
            this.messages[assistantMessageIndex].content += chunk;
          },
          (error) => {
            console.error('Error sending message:', error);
            const errorMessage = '抱歉，我遇到了一个错误。请稍后再试。';
            this.messages[assistantMessageIndex].content = errorMessage;
            this.conversationHistory.push({ role: 'assistant', content: errorMessage });
          },
          (result) => {
            // 添加 AI 回复到对话历史
            this.conversationHistory.push({ role: 'assistant', content: result });
          }
        );
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = '抱歉，我遇到了一个错误。请稍后再试。';
        this.messages.push({ role: 'assistant', content: errorMessage });
        this.conversationHistory.push({ role: 'assistant', content: errorMessage });
      } finally {
        this.loading = false;
      }
    },
    clearMessages() {
      this.messages = [
        {
          role: 'assistant',
          content: '你好！我是 Open Claw，你的企业级 AI 助手。我可以帮助你管理文件和发送邮件。请问有什么可以帮助你的？'
        }
      ];
      // 清空对话历史
      this.conversationHistory = [];
    }
  },
  // 添加持久化配置
  persist: true
});