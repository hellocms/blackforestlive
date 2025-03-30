const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, updateSendingQty, createAndPrintOrder } = require('../controllers/orderController');
const auth = require('../middleware/auth');

router.post('/', auth(['branch']), createOrder);
router.post('/print', auth(['branch']), createAndPrintOrder); // New route for save and print
router.get('/', auth(['admin', 'superadmin']), getAllOrders);
router.patch('/:id', auth(['admin', 'superadmin']), updateSendingQty);

module.exports = router;