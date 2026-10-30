import dotenv from 'dotenv';
import path from 'path';

// Load server/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import app from './app';
import { seed } from './seed';

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    // Auto-seed demo accounts on startup to ensure reviewer credentials are ready
    await seed();
  } catch (err) {
    console.warn('Auto-seed check notice:', err);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer();
