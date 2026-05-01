const db = require('../db/database');

class Conversation {
  /**
   * 创建新对话
   * @param {number} userId
   * @param {string} title
   * @returns {object}
   */
  static create(userId, title = '新对话') {
    const stmt = db.prepare('INSERT INTO conversations (user_id, title) VALUES (?, ?)');
    const result = stmt.run(userId, title);
    return this.findById(result.lastInsertRowid);
  }

  /**
   * 根据 ID 查找对话
   * @param {number} id
   * @returns {object|null}
   */
  static findById(id) {
    const stmt = db.prepare('SELECT * FROM conversations WHERE id = ?');
    return stmt.get(id) || null;
  }

  /**
   * 获取用户的所有对话
   * @param {number} userId
   * @returns {Array}
   */
  static findByUserId(userId) {
    const stmt = db.prepare(`
      SELECT c.*, 
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at ASC LIMIT 1) as first_message
      FROM conversations c 
      WHERE c.user_id = ? 
      ORDER BY c.updated_at DESC
    `);
    return stmt.all(userId);
  }

  /**
   * 更新对话标题（基于第一条消息）
   * @param {number} id
   * @param {string} title
   */
  static updateTitle(id, title) {
    const stmt = db.prepare('UPDATE conversations SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(title, id);
  }

  /**
   * 删除对话
   * @param {number} id
   * @param {number} userId - 用于验证所有权
   * @returns {boolean}
   */
  static delete(id, userId) {
    const stmt = db.prepare('DELETE FROM conversations WHERE id = ? AND user_id = ?');
    const result = stmt.run(id, userId);
    return result.changes > 0;
  }

  /**
   * 添加消息到对话
   * @param {number} conversationId
   * @param {string} role - 'user' | 'assistant' | 'system'
   * @param {string} content
   * @returns {object}
   */
  static addMessage(conversationId, role, content) {
    const stmt = db.prepare('INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)');
    const result = stmt.run(conversationId, role, content);

    // 更新对话的 updated_at
    db.prepare('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(conversationId);

    return {
      id: result.lastInsertRowid,
      conversationId,
      role,
      content,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * 获取对话的所有消息
   * @param {number} conversationId
   * @returns {Array}
   */
  static getMessages(conversationId) {
    const stmt = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC');
    return stmt.all(conversationId);
  }

  /**
   * 获取对话的最新 N 条消息（用于上下文）
   * @param {number} conversationId
   * @param {number} limit
   * @returns {Array}
   */
  static getRecentMessages(conversationId, limit = 20) {
    const stmt = db.prepare(`
      SELECT * FROM messages 
      WHERE conversation_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    return stmt.all(conversationId, limit).reverse();
  }

  /**
   * 获取用户最近的对话
   * @param {number} userId
   * @param {number} limit
   * @returns {object|null}
   */
  static getRecentConversation(userId) {
    const stmt = db.prepare(`
      SELECT * FROM conversations 
      WHERE user_id = ? 
      ORDER BY updated_at DESC 
      LIMIT 1
    `);
    return stmt.get(userId) || null;
  }
}

module.exports = Conversation;