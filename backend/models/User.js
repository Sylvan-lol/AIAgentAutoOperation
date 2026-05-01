const db = require('../db/database');
const bcrypt = require('bcryptjs');

class User {
  /**
   * 创建用户
   * @param {string} username
   * @param {string} password - 明文密码，会在内部加密
   * @returns {object} 创建的用户对象（不含密码）
   */
  static async create(username, password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const stmt = db.prepare('INSERT INTO users (username, password, preferences) VALUES (?, ?, ?)');
    const result = stmt.run(username, hashedPassword, '{}');

    return this.findById(result.lastInsertRowid);
  }

  /**
   * 获取用户偏好/记忆
   * @param {number} userId
   * @returns {object} - 解析后的 JSON 对象
   */
  static getPreferences(userId) {
    const stmt = db.prepare('SELECT preferences FROM users WHERE id = ?');
    const row = stmt.get(userId);
    if (!row) return {};
    try {
      return JSON.parse(row.preferences);
    } catch {
      return {};
    }
  }

  /**
   * 更新用户偏好/记忆（合并方式）
   * @param {number} userId
   * @param {object} prefs - 要合并的偏好对象
   */
  static updatePreferences(userId, prefs) {
    const current = this.getPreferences(userId);
    const merged = { ...current, ...prefs };
    const stmt = db.prepare('UPDATE users SET preferences = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(JSON.stringify(merged), userId);
  }

  /**
   * 根据用户名查找用户
   * @param {string} username
   * @returns {object|null}
   */
  static findByUsername(username) {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username) || null;
  }

  /**
   * 根据 ID 查找用户
   * @param {number} id
   * @returns {object|null}
   */
  static findById(id) {
    const stmt = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?');
    return stmt.get(id) || null;
  }

  /**
   * 验证密码
   * @param {string} inputPassword - 明文密码
   * @param {string} hashedPassword - 数据库中的哈希密码
   * @returns {boolean}
   */
  static async verifyPassword(inputPassword, hashedPassword) {
    return await bcrypt.compare(inputPassword, hashedPassword);
  }

  /**
   * 获取所有用户（仅返回安全字段）
   * @returns {Array}
   */
  static findAll() {
    const stmt = db.prepare('SELECT id, username, created_at FROM users ORDER BY created_at DESC');
    return stmt.all();
  }

  /**
   * 删除用户
   * @param {number} id
   * @returns {boolean}
   */
  static delete(id) {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * 更新用户名
   * @param {number} id
   * @param {string} newUsername
   * @returns {object|null}
   */
  static updateUsername(id, newUsername) {
    const stmt = db.prepare('UPDATE users SET username = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(newUsername, id);
    return this.findById(id);
  }
}

module.exports = User;