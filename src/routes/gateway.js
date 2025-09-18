const express = require('express');
const router = express.Router();
const gatewayController = require('../controllers/gatewayController');

// Rutas principales del gateway
router.get('/', gatewayController.getInfo);
router.get('/health', gatewayController.getHealth);
router.get('/api/metrics', gatewayController.getMetrics);
router.get('/api/docs', gatewayController.getDocs);
router.get('/api/postman-collection', gatewayController.getPostmanCollection);

module.exports = router;