import dotenv from 'dotenv';
import app from './backend/app.js';
import { ensureStorageBucketExists } from './backend/supabase.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Ensure storage bucket is created on server startup
ensureStorageBucketExists();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Environment refreshed to update Supabase Service Role Key, DB Password, and support product theme colors
