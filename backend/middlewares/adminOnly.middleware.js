import { supabaseAdmin } from '../supabase.js';

export async function adminOnly(req, res, next) {
  try {
    const rawUrl = process.env.SUPABASE_URL;
    const isMockMode = !rawUrl || rawUrl.includes('your_supabase_url') || rawUrl.includes('placeholder-url');

    if (isMockMode) {
      // In local mock simulation mode, bypass validation and insert mock user context
      req.user = { email: 'admin@syncarmor.in', user_metadata: { is_admin: true } };
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required.' });
    }

    const token = authHeader.split(' ')[1];

    // Validate token against Supabase auth server
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid session or credentials.' });
    }

    // Role check: verify the user has the `is_admin` flag set in metadata
    const isAdmin = user.app_metadata?.is_admin || user.user_metadata?.is_admin;
    if (!isAdmin) {
      return res.status(403).json({ message: 'Access Denied: Admin authorization required.' });
    }

    // Add user context to request object
    req.user = user;
    next();
  } catch (err) {
    console.error('Admin Auth middleware error:', err);
    res.status(500).json({ message: 'Internal security authentication failure.' });
  }
}
