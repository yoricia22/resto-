import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './config/database.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (test page & database.json)
app.use(express.static(__dirname));

// Routes
app.use('/api', authRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Resto Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      register: 'POST /api/register',
      login: 'POST /api/login',
      profile: 'GET /api/profile',
      test: 'GET /test-api.html'
    }
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initDatabase();
    console.log('✓ Database initialized');
    
    // Auto-run migrations
    console.log('🔄 Checking migrations...');
    const { runMigrationsSync } = await import('./migrations/migrate.js');
    await runMigrationsSync();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Database type: ${process.env.USE_FILE_DB === 'true' ? 'File-based' : 'MySQL'}`);
      console.log(`📝 API Ready: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
