import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from './middlewares/errorHandler.js';
import orderRoutes from './routes/order.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { getSettings, handleShiprocketWebhookCall } from './controllers/admin.controller.js';

const app = express();

// Standard middleware — increase JSON limit to 5mb to handle large payloads (e.g. product images, email HTML)
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(morgan('dev'));

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Sync Screen Guard Server is running' });
});

// Public payment settings — used by frontend Checkout to get COD fee & Razorpay key
// This is intentionally unauthenticated as the frontend needs it on the checkout page
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

// Public Shiprocket Webhooks — automatically receives courier & delivery updates
app.post('/api/shiprocket/webhook', handleShiprocketWebhookCall);
app.post('/api/webhooks/shiprocket', handleShiprocketWebhookCall);

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Error Handler Middleware
app.use(errorHandler);

export default app;

