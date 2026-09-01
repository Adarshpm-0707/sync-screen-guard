import { supabase } from '../../supabaseClient';

export async function getAdminToken() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return session.access_token;
    }
  } catch (e) {
    // Ignore Supabase error
  }

  const storedToken = localStorage.getItem('admin_token');
  if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
    return storedToken;
  }

  const localSession = localStorage.getItem('local_admin_session');
  if (localSession) {
    try {
      const parsed = JSON.parse(localSession);
      if (parsed.token) return parsed.token;
    } catch (e) {}
  }

  return 'local_admin_token';
}

export async function getAdminAuthHeaders(customHeaders = {}) {
  const token = await getAdminToken();
  return {
    'Authorization': `Bearer ${token}`,
    ...customHeaders,
  };
}
