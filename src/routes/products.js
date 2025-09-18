const express = require('express');
const router = express.Router();
const rateLimits = require('../config/rate-limits');
const { authenticateToken } = require('../middleware/auth');
const { createProxy } = require('../controllers/proxyController');
const healthChecker = require('../middleware/health');

// Autenticación requerida para todas las rutas de productos
router.use(authenticateToken);

// Rate limiting para API de productos
router.use(rateLimits.api);

// Health check del servicio de productos
router.use(healthChecker.createHealthCheckMiddleware('productos'));

// Proxy para todas las rutas de productos
router.use('/', createProxy('productos', {
  '^/api/productos': '/api/productos'
}));

module.exports = router;
