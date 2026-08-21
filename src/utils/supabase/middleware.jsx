import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : undefined);
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_ANON_KEY : undefined);

export const createClient = (request, response) => {
  const supabase = createServerClient(
    supabaseUrl || 'https://placeholder-url.supabase.co',
    supabaseKey || 'placeholder-key',
    {
      cookies: {
        getAll() {
          return request?.cookies ? Object.keys(request.cookies).map(name => ({ name, value: request.cookies[name] })) : [];
        },
        setAll(cookiesToSet) {
          if (response) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookie(name, value, options);
            });
          }
        },
      },
    }
  );

  return supabase;
};
