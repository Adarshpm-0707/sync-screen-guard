import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import {
  securityHeaders,
  customSecurityHeaders,
  apiLimiter,
  orderLimiter,
  authLimiter,
  webhookLimiter,
  getCorsOptions,
  inputSanitizer
} from './middlewares/security.middleware.js';
import { errorHandler } from './middlewares/errorHandler.js';
import orderRoutes from './routes/order.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { getSettings, handleShiprocketWebhookCall } from './controllers/admin.controller.js';

const app = express();

// Disable X-Powered-By header to prevent technology fingerprinting
app.disable('x-powered-by');

// Trust proxy headers if running behind reverse proxies (Nginx, Cloudflare, Heroku, etc.)
app.set('trust proxy', 1);

// 1. Core HTTP Security Headers & Hardening via Helmet
app.use(securityHeaders);
app.use(customSecurityHeaders);

// 2. Strict / Whitelisted Cross-Origin Resource Sharing (CORS)
app.use(cors(getCorsOptions()));

// 3. Body Parsing with Safe Payload Size Limits
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// 4. Input Sanitization (Cross-Site Scripting & Injection scrubbing)
app.use(inputSanitizer);

// 5. HTTP Request Logging (Sanitized dev / combined)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    security: 'hardened',
    timestamp: new Date().toISOString()
  });
});

// Apply General Rate Limiter to all API routes
app.use('/api', apiLimiter);

// Public payment settings — used by frontend Checkout to get COD fee & Razorpay key
app.get('/api/settings', getSettings);

// Shiprocket connection test endpoint
app.get('/api/shiprocket/test', async (req, res) => {
  try {
    const { getShiprocketToken } = await import('./services/shiprocket.service.js');
    const token = await getShiprocketToken();
    if (token) {
      res.json({ success: true, message: 'Shiprocket connected!', token_prefix: token.slice(0, 30) + '...' });
    } else {
      res.status(400).json({ success: false, message: 'Shiprocket auth failed. Check server console for details.' });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Public Shiprocket Webhooks (Protected with Webhook Rate Limiter)
app.post('/api/shiprocket/webhook', webhookLimiter, handleShiprocketWebhookCall);
app.post('/api/webhooks/shiprocket', webhookLimiter, handleShiprocketWebhookCall);

// Routes with Dedicated Rate Limiting
app.use('/api/orders', orderLimiter, orderRoutes);
app.use('/api/admin', authLimiter, adminRoutes);

// Catch-all 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found.' });
});

// Error Handler Middleware
app.use(errorHandler);

export default app;
