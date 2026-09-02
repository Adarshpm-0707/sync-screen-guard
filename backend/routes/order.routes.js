import { Router } from 'express';
import {
  createOrder,
  cancelOrder,
  createRazorpayOrder,
  verifyRazorpayPayment
} from '../controllers/order.controller.js';

const router = Router();

// Order endpoints
router.post('/', createOrder);
router.post('/razorpay/create-order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);
router.post('/:id/cancel', cancelOrder);
router.patch('/:id/cancel', cancelOrder);

export default router;
