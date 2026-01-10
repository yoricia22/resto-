import { query, queryOne } from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  static async create({ name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    
    return {
      id: result.insertId,
      name,
      email
    };
  }

  static async findByEmail(email) {
    return await queryOne('SELECT * FROM users WHERE email = ?', [email]);
  }

  static async findById(id) {
    return await queryOne('SELECT * FROM users WHERE id = ?', [id]);
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getAll() {
    return await query('SELECT id, name, email, created_at FROM users');
  }
}

export default User;
