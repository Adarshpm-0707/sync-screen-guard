import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const isValidUrl = rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'));
const supabaseUrl = isValidUrl ? rawUrl : 'https://placeholder-url.supabase.co';

const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const isPlaceholderKey = !rawAnonKey || rawAnonKey.includes('your_') || rawAnonKey === 'placeholder-key';
const supabaseAnonKey = isPlaceholderKey ? 'placeholder-anon-key-value-must-be-long-base64-format' : rawAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
