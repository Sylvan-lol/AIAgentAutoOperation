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
    conversationId: null,    // 当前对话的数据库 ID
    conversations: [],       // 对话列表
    loadingConversations: false
  }),
  actions: {
    async loadConversations() {
      this.loadingConversations = true;
      try {
        const response = await chatApi.getConversations();
        this.conversations = response.data || [];
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        this.loadingConversations = false;
      }
    },

    async deleteConversation(conversationId) {
      try {
        await chatApi.deleteConversation(conversationId);
        this.conversations = this.conversations.filter(c => c.id !== conversationId);
        if (this.conversationId === conversationId) {
          this.clearMessages();
        }
      } catch (error) {
        console.error('Error deleting conversation:', error);
        throw error;
      }
    },

    switchConversation(conversation) {
      this.conversationId = conversation.id;
      this.messages = [{
        role: 'assistant',
        content: '你好！我是 Open Claw，你的企业级 AI 助手。我可以帮助你管理文件和发送邮件。请问有什么可以帮助你的？'
      }];
      // 可以扩展：从数据库加载消息历史
    },

    async sendMessage(message) {
      // 添加用户消息到列表
      this.messages.push({ role: 'user', content: message });
      this.loading = true;

      try {
        const assistantMessageIndex = this.messages.length;
        // 添加一个空的助手消息，用于实时更新
        this.messages.push({ role: 'assistant', content: '' });

        await chatApi.sendMessageStream(
          message,
          this.conversationId,
          (chunk) => {
            // 更新助手消息
            this.messages[assistantMessageIndex].content += chunk;
          },
          (error) => {
            console.error('Error sending message:', error);
            const errorMessage = '抱歉，我遇到了一个错误。请稍后再试。';
            this.messages[assistantMessageIndex].content = errorMessage;
          },
          (result, newConversationId) => {
            // 更新 conversationId
            if (newConversationId) {
              this.conversationId = newConversationId;
            }
            // 刷新对话列表
            this.loadConversations();
          }
        );
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = '抱歉，我遇到了一个错误。请稍后再试。';
        this.messages.push({ role: 'assistant', content: errorMessage });
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
      this.conversationId = null;
      this.conversations = [];
    }
  },
  persist: true
});
