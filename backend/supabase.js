import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const rawUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const isValidUrl = rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'));
const supabaseUrl = isValidUrl ? rawUrl : 'https://placeholder-url.supabase.co';

const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const isPlaceholderKey = !rawServiceKey || rawServiceKey.includes('your_') || rawServiceKey === 'placeholder-service-role-key';
const supabaseServiceKey = isPlaceholderKey ? 'placeholder-service-role-key-value-must-be-long-base64-format' : rawServiceKey;

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function ensureStorageBucketExists() {
  try {
    const { data, error } = await supabaseAdmin.storage.createBucket('product-images', {
      public: true
    });
    if (error) {
      if (
        error.message?.includes('already exists') ||
        error.status === 409 ||
        error.message?.includes('duplicate')
      ) {
        // Bucket already exists — this is fine
      } else if (
        error.message?.includes('row-level security') ||
        error.message?.includes('policy') ||
        error.message?.includes('permission')
      ) {
        // This happens when SUPABASE_SERVICE_ROLE_KEY is not set correctly.
        // Run: npm run db:setup <your-service-role-key>  to fix this once.
        // The bucket will be created automatically during setup.
      } else {
        console.warn(`⚠️  Storage bucket setup skipped: ${error.message}`);
      }
    } else {
      console.log("✅ Storage bucket 'product-images' ready.");
    }
  } catch (err) {
    // Non-critical — app works without storage bucket for now
  }
}
