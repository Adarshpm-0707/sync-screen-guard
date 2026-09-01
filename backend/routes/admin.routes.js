import { Router } from 'express';
import { adminOnly } from '../middlewares/adminOnly.middleware.js';
import {
  getDashboardStats,
  getOrders,
  getOrderDetail,
  updateOrderStatus,
  deleteOrder,
  getCustomers,
  getCustomerDetail,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getShipments,
  createShipment,
  syncShipments,
  getSettings,
  updateSettings,
} from '../controllers/admin.controller.js';

const router = Router();

// Apply auth middleware to protect all routes
router.use(adminOnly);

// Stats & Dashboard
router.get('/dashboard', getDashboardStats);

// Orders Management
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderDetail);
router.patch('/orders/:id', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);


// Customers Management
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerDetail);

// Product Catalog
router.get('/products', getProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.patch('/products/:id/stock', updateProductStock);

// Logistics & Shiprocket
router.get('/shipments', getShipments);
router.post('/shipments', createShipment);
router.post('/shipments/sync', syncShipments);


// Store Payment settings
router.get('/settings', getSettings);
router.patch('/settings', updateSettings);

export default router;

