import { Router } from 'express';
import { createOrder, cancelOrder, createRazorpayOrder } from '../controllers/order.controller.js';

const router = Router();

router.post('/', createOrder);
router.post('/razorpay/create-order', createRazorpayOrder);
router.post('/:id/cancel', cancelOrder);
router.patch('/:id/cancel', cancelOrder);

export default router;

