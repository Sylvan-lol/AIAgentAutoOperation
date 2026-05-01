import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器：自动附加 JWT token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// 响应拦截器：401 时自动跳转登录
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// 认证 API
export const authApi = {
  register: async (username, password) => {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
  },
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  }
};

// 处理聊天请求
export const chatApi = {
  sendMessage: async (message, conversationId = null) => {
    const response = await api.post('/chat/message', { message, conversationId });
    return response.data;
  },
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },
  deleteConversation: async (conversationId) => {
    const response = await api.delete(`/chat/conversations/${conversationId}`);
    return response.data;
  },
  sendMessageStream: async (message, conversationId = null, onChunk, onError, onComplete) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/chat/message/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ message, conversationId })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
      let streamEnded = false;
      let newConversationId = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (!streamEnded) {
            streamEnded = true;
            onComplete(result, newConversationId);
          }
          break;
        }
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') {
              if (!streamEnded) {
                streamEnded = true;
                onComplete(result, newConversationId);
              }
              return;
            }
            // 检查是否包含 conversationId
            if (data.startsWith('[CONVERSATION_ID]')) {
              newConversationId = parseInt(data.substring('[CONVERSATION_ID]'.length));
              continue;
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
  // 获取安全根目录列表
  getRoots: async () => {
    const response = await api.get('/files/roots');
    return response.data;
  },
  // 列出指定路径下的文件和目录（绝对路径）
  listDirectory: async (absPath) => {
    const response = await api.get('/files/list', { params: { path: absPath } });
    return response.data;
  },
  // 读取文本文件内容
  readFile: async (filePath) => {
    const response = await api.get('/files/content', { params: { path: filePath } });
    return response.data;
  },
  // 获取文件预览数据（base64 + mime 类型）
  previewFile: async (filePath) => {
    const response = await api.get('/files/preview', { params: { path: filePath } });
    return response.data;
  },
  // 写入文件（创建或覆盖）
  writeFile: async (filePath, content) => {
    const response = await api.post('/files/write', { path: filePath, content });
    return response.data;
  },
  // 创建目录
  createDirectory: async (dirPath) => {
    const response = await api.post('/files/directory', { path: dirPath });
    return response.data;
  },
  // 删除文件或目录
  deleteItem: async (itemPath) => {
    const response = await api.delete('/files', { params: { path: itemPath } });
    return response.data;
  },
  // 重命名
  renameItem: async (oldPath, newPath) => {
    const response = await api.put('/files/rename', { oldPath, newPath });
    return response.data;
  },
  // 兼容旧接口
  listFiles: async (relativePath = '.') => {
    const response = await api.get('/files', { params: { path: relativePath } });
    return response.data;
  },
  createFile: async (filePath, content = '') => {
    const response = await api.post('/files/write', { path: filePath, content });
    return response.data;
  },
  updateFile: async (filePath, content) => {
    const response = await api.post('/files/write', { path: filePath, content });
    return response.data;
  },
  deleteFile: async (fileName) => {
    const response = await api.delete('/files', { params: { path: fileName } });
    return response.data;
  }
};

export default api;