import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

/**
 * 1. Configured Helmet Security Headers Middleware
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://checkout.razorpay.com',
        'https://api.razorpay.com',
        'https://*.supabase.co',
        'https://fonts.googleapis.com'
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com'
      ],
      fontSrc: [
        "'self'",
        'data:',
        'https://fonts.gstatic.com'
      ],
      imgSrc: [
        "'self'",
        'data:',
        'blob:',
        'https:',
        'http:'
      ],
      connectSrc: [
        "'self'",
        'https://*.supabase.co',
        'wss://*.supabase.co',
        'https://api.razorpay.com',
        'https://apiv2.shiprocket.in',
        'http://localhost:*',
        'http://127.0.0.1:*'
      ],
      frameSrc: [
        "'self'",
        'https://api.razorpay.com',
        'https://checkout.razorpay.com'
      ],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: { action: 'sameorigin' }
});

/**
 * 2. Additional Custom Security Headers Middleware
 */
export function customSecurityHeaders(req, res, next) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // XSS protection for older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Restrict camera/mic/geolocation hardware access unless explicitly allowed
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(self "https://checkout.razorpay.com")');
  next();
}

/**
 * 3. Rate Limiters to defend against DDoS, bot floods, and brute-force attacks
 */

// General API Rate Limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.'
  }
});

// Stricter Rate Limiter for Order Creation (prevents bot order spam)
export const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 40, // 40 orders per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Order rate limit exceeded. Please wait a moment before trying again.'
  }
});

// Strict Rate Limiter for Authentication & Admin Endpoints (prevents credential stuffing)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

// Webhook Rate Limiter for Shiprocket notifications
export const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 400,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Webhook rate limit exceeded.'
  }
});

/**
 * 4. Dynamic CORS Whitelist Middleware
 */
export function getCorsOptions() {
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '';
  const parsedOrigins = allowedOriginsEnv
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  const defaultOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5000',
    'http://localhost:3000',
    'https://syncforall.com',
    'https://www.syncforall.com'
  ];

  const whitelist = Array.from(new Set([...defaultOrigins, ...parsedOrigins]));

  return {
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, webhooks)
      if (!origin) return callback(null, true);

      // Check if origin matches whitelist or localhost
      const isAllowed =
        whitelist.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        /^https:\/\/.*\.web\.app$/.test(origin) ||
        /^https:\/\/.*\.firebaseapp\.com$/.test(origin) ||
        /^https:\/\/.*\.supabase\.co$/.test(origin);

      if (isAllowed) {
        callback(null, true);
      } else {
        // In dev mode, allow; in production log a security notice
        if (process.env.NODE_ENV !== 'production') {
          callback(null, true);
        } else {
          callback(new Error('CORS policy: Access denied for this origin.'));
        }
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
    maxAge: 86400 // 24 hours preflight cache
  };
}

/**
 * 5. Input Sanitizer Middleware (XSS & Injection Protection)
 */
function sanitizeValue(value) {
  if (typeof value === 'string') {
    // Remove null byte characters & replace dangerous script blocks
    return value
      .replace(/\0/g, '')
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  if (typeof value === 'object' && value !== null) {
    for (const key of Object.keys(value)) {
      value[key] = sanitizeValue(value[key]);
    }
  }
  return value;
}

export function inputSanitizer(req, res, next) {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }
  next();
}
