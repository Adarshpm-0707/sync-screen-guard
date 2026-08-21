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
      if (error.message?.includes('already exists') || error.status === 409) {
        console.log("Supabase storage bucket 'product-images' already exists.");
      } else {
        console.warn("Could not create Supabase storage bucket 'product-images':", error.message);
      }
    } else {
      console.log("Successfully verified/created Supabase storage bucket 'product-images'.");
    }
  } catch (err) {
    console.error("Error creating storage bucket:", err.message);
  }
}
