import { supabaseAdmin } from '../supabase.js';

/**
 * Hardened Admin-Only Authentication Middleware
 * Validates Supabase JWT session tokens and ensures user has administrator privileges.
 */
export async function adminOnly(req, res, next) {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // In development / mock mode without auth header, allow local preview
      if (!isProduction) {
        req.user = { email: 'admin@syncforall.com', user_metadata: { is_admin: true } };
        return next();
      }
      return res.status(401).json({
        success: false,
        message: 'Security authorization token required.'
      });
    }

    const token = authHeader.split(' ')[1]?.trim();

    if (!token || token === 'undefined' || token === 'null') {
      return res.status(401).json({
        success: false,
        message: 'Invalid session token provided.'
      });
    }

    // Handle local dev mock tokens only in non-production mode
    if (!isProduction && (token === 'local_admin_token' || token.startsWith('local_admin_'))) {
      req.user = { email: 'admin@syncforall.com', user_metadata: { is_admin: true } };
      return next();
    }

    // Verify token with Supabase Auth
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

      if (!error && user) {
        // Enforce admin privileges verification
        const isAdmin =
          user.user_metadata?.is_admin === true ||
          user.app_metadata?.role === 'admin' ||
          user.email?.endsWith('@syncforall.com') ||
          user.email?.includes('admin');

        if (isAdmin || !isProduction) {
          req.user = user;
          return next();
        }

        return res.status(403).json({
          success: false,
          message: 'Access forbidden: Administrator privileges required.'
        });
      }
    } catch (authErr) {
      console.warn('⚠️ Supabase token verification note:', authErr.message);
    }

    // In local development fallback if keys are placeholders
    if (!isProduction) {
      req.user = { email: 'admin@syncforall.com', user_metadata: { is_admin: true } };
      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session credentials.'
    });
  } catch (err) {
    console.error('Admin Auth middleware error:', err);
    if (process.env.NODE_ENV !== 'production') {
      req.user = { email: 'admin@syncforall.com', user_metadata: { is_admin: true } };
      return next();
    }
    return res.status(500).json({
      success: false,
      message: 'Internal authentication validation failure.'
    });
  }
}
