import { Router } from 'express';
import { adminOnly } from '../middlewares/adminOnly.middleware.js';
import {
  getDashboardStats,
  getOrders,
  getOrderDetail,
  updateOrderStatus,
  deleteOrder,
  deleteMultipleOrders,
  clearAllOrders,
  getCustomers,
  getCustomerDetail,
  deleteCustomer,
  deleteMultipleCustomers,
  clearAllCustomers,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getShipments,
  createShipment,
  syncShipments,
  clearAllShipments,
  getSettings,
  updateSettings,
} from '../controllers/admin.controller.js';

const router = Router();

// Apply auth middleware to protect all routes
router.use(adminOnly);

// Stats & Dashboard
router.get('/dashboard', getDashboardStats);

// Orders Management
router.delete('/orders/clear-all', clearAllOrders);
router.post('/orders/clear-all', clearAllOrders);
router.post('/orders/bulk-delete', deleteMultipleOrders);
router.delete('/orders/bulk-delete', deleteMultipleOrders);
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderDetail);
router.patch('/orders/:id', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);

// Customers Management
router.delete('/customers/clear-all', clearAllCustomers);
router.post('/customers/clear-all', clearAllCustomers);
router.post('/customers/bulk-delete', deleteMultipleCustomers);
router.delete('/customers/bulk-delete', deleteMultipleCustomers);
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerDetail);
router.delete('/customers/:id', deleteCustomer);

// Logistics & Shiprocket
router.delete('/shipments/clear-all', clearAllShipments);
router.post('/shipments/clear-all', clearAllShipments);
router.get('/shipments', getShipments);
router.post('/shipments', createShipment);
router.post('/shipments/sync', syncShipments);

// Unified Store Data Reset
router.delete('/data/clear-all', clearAllOrders);
router.post('/data/clear-all', clearAllOrders);

// Product Catalog
router.get('/products', getProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.patch('/products/:id/stock', updateProductStock);

// Store Payment settings
router.get('/settings', getSettings);
router.patch('/settings', updateSettings);

export default router;

