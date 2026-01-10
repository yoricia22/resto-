import { initDatabase, query, getDatabaseType } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runMigrationsSync = async () => {
  try {
    // Create migrations table if not exists
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Get all migration files
    const migrationsDir = __dirname;
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    // Get executed migrations
    const executedMigrations = await query('SELECT name FROM migrations');
    const executedNames = executedMigrations.map(m => m.name);
    
    // Run pending migrations
    let migrated = 0;
    for (const file of files) {
      if (!executedNames.includes(file)) {
        console.log(`⏳ Running: ${file}`);
        
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8');
        
        // Split SQL statements (handle multiple statements)
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0);
        
        for (const statement of statements) {
          await query(statement);
        }
        
        await query('INSERT INTO migrations (name) VALUES (?)', [file]);
        console.log(`✓ Completed: ${file}`);
        migrated++;
      }
    }
    
    if (migrated > 0) {
      console.log(`✅ Ran ${migrated} migration(s)`);
    } else {
      console.log('✓ All migrations up to date');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    return false;
  }
};

const runMigrations = async () => {
  try {
    console.log('🚀 Starting migration...');
    
    await initDatabase();
    console.log('✓ Migrations table ready');
    
    await runMigrationsSync();
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

// Only run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations();
}
