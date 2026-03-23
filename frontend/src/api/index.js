import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 处理聊天请求
export const chatApi = {
  sendMessage: async (message, conversationHistory = []) => {
    const response = await api.post('/chat/message', { message, conversationHistory });
    return response.data;
  },
  // 流式输出
  sendMessageStream: async (message, conversationHistory = [], onChunk, onError, onComplete) => {
    try {
      const response = await fetch('http://localhost:3001/api/chat/message/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, conversationHistory })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          onComplete(result);
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        // 处理SSE格式的数据
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') {
              onComplete(result);
              return;
            }
            result += data;
            onChunk(data);
          }
        }
      }
    } catch (error) {
      console.error('Error in streaming:', error);
      onError(error);
    }
  }
};

// 处理文件操作
export const fileApi = {
  listFiles: async () => {
    const response = await api.get('/files');
    return response.data;
  },
  readFile: async (fileName) => {
    const response = await api.get(`/files/${fileName}`);
    return response.data;
  },
  createFile: async (fileName, content) => {
    const response = await api.post('/files', { fileName, content });
    return response.data;
  },
  updateFile: async (fileName, content) => {
    const response = await api.put(`/files/${fileName}`, { content });
    return response.data;
  },
  deleteFile: async (fileName) => {
    const response = await api.delete(`/files/${fileName}`);
    return response.data;
  }
};

export default api;