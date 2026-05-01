const User = require('../models/User');
const Conversation = require('../models/Conversation');

class MemoryService {
  /**
   * 保存用户记住的信息（合并到偏好中）
   * @param {number} userId
   * @param {object} info - 要记住的信息，如 {邮箱: 'xxx@qq.com', 常用路径: 'C:\\Users\\xxx\\Desktop'}
   */
  remember(userId, info) {
    User.updatePreferences(userId, info);
    return { success: true, message: '已记住' };
  }

  /**
   * 获取用户的所有记忆
   * @param {number} userId
   * @returns {object}
   */
  recall(userId) {
    return User.getPreferences(userId);
  }

  /**
   * 获取需要注入到 AI 系统提示中的记忆文本
   * @param {number} userId
   * @returns {string}
   */
  getMemoryContext(userId) {
    const prefs = User.getPreferences(userId);
    const keys = Object.keys(prefs);
    if (keys.length === 0) return '';
    
    const lines = keys.map(key => `- ${key}: ${prefs[key]}`);
    return `【关于用户的信息】\n${lines.join('\n')}\n`;
  }

  /**
   * 总结最近的对话并保存（压缩上下文）
   * @param {number} conversationId
   * @param {number} userId
   */
  summarizeAndSave(conversationId, userId) {
    const messages = Conversation.getMessages(conversationId);
    if (messages.length <= 4) return; // 不够长就不压缩
    
    // 提取关键信息：用户提到的邮箱、路径、名字等
    const allContent = messages.map(m => m.content).join('\n');
    
    // 简单的关键词提取（不需要 AI 调用，节省 token）
    const emailMatch = allContent.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    const pathMatches = allContent.match(/[A-Z]:\\[^\\\n]+/g);
    
    const info = {};
    if (emailMatch) {
      info['用户邮箱'] = emailMatch[emailMatch.length - 1]; // 取最新提到的邮箱
    }
    if (pathMatches) {
      info['常用路径'] = pathMatches[pathMatches.length - 1];
    }
    
    if (Object.keys(info).length > 0) {
      User.updatePreferences(userId, info);
      console.log('[MemoryService] Auto-saved memory:', info);
    }
  }
}

module.exports = new MemoryService();