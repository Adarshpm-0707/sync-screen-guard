import dotenv from 'dotenv';
import app from './backend/app.js';
import { ensureStorageBucketExists } from './backend/supabase.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Ensure storage bucket is created on server startup
ensureStorageBucketExists();

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`⚠️ Port ${PORT} is already in use by an active server instance. Backend API is active.`);
  } else {
    console.error('Server error:', err);
  }
});

