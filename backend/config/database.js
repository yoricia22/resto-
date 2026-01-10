import mysql from 'mysql2/promise.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const DB_TYPE = process.env.DB_TYPE || 'mysql';
const USE_FILE_DB = process.env.USE_FILE_DB === 'true';

let db = null;
let fileDb = null;

// Simple file-based database fallback
const initFileDatabase = () => {
  const dbPath = path.join(process.cwd(), 'database.json');
  
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [], migrations: [] }));
  }
  
  fileDb = {
    read: () => JSON.parse(fs.readFileSync(dbPath, 'utf-8')),
    write: (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
  };
  
  console.log('✓ File Database Connected');
  return fileDb;
};

export const initDatabase = async () => {
  // Try MySQL first, fallback to file-based database
  if (!USE_FILE_DB) {
    try {
      db = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'resto_db'
      });
      console.log('✓ MySQL Connected');
      return db;
    } catch (error) {
      console.warn('⚠ MySQL Connection Failed:', error.message);
      console.log('📁 Falling back to file-based database...');
      return initFileDatabase();
    }
  } else {
    return initFileDatabase();
  }
};

export const getDatabase = () => {
  if (!db && !fileDb) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db || fileDb;
};

export const query = async (sql, params = []) => {
  const database = getDatabase();
  
  // File database
  if (fileDb) {
    const data = fileDb.read();
    const sqlUpper = sql.trim().toUpperCase();
    
    if (sqlUpper.startsWith('INSERT INTO USERS')) {
      const id = data.users.length + 1;
      const user = {
        id,
        name: params[0],
        email: params[1],
        password: params[2],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      data.users.push(user);
      fileDb.write(data);
      return { insertId: id };
    }
    
    if (sqlUpper.startsWith('SELECT') && sqlUpper.includes('FROM USERS')) {
      if (sqlUpper.includes('WHERE EMAIL')) {
        return data.users.filter(u => u.email === params[0]);
      }
      if (sqlUpper.includes('WHERE ID')) {
        return data.users.filter(u => u.id === parseInt(params[0]));
      }
      return data.users;
    }
    
    if (sqlUpper.includes('MIGRATIONS')) {
      if (sqlUpper.startsWith('CREATE TABLE')) {
        return [];
      }
      if (sqlUpper.startsWith('INSERT INTO MIGRATIONS')) {
        data.migrations.push({ name: params[0], executed_at: new Date().toISOString() });
        fileDb.write(data);
        return [];
      }
      if (sqlUpper.startsWith('SELECT') && sqlUpper.includes('FROM MIGRATIONS')) {
        return data.migrations;
      }
    }
    
    if (sqlUpper.startsWith('CREATE TABLE')) {
      return [];
    }
    
    return [];
  }
  
  // MySQL database
  const [rows] = await database.execute(sql, params);
  return rows;
};

export const queryOne = async (sql, params = []) => {
  const database = getDatabase();
  
  // File database
  if (fileDb) {
    const results = await query(sql, params);
    return results[0] || null;
  }
  
  // MySQL database
  const [rows] = await database.execute(sql, params);
  return rows[0] || null;
};

export const getDatabaseType = () => fileDb ? 'file' : 'mysql';
export const isFileDatabase = () => !!fileDb;
