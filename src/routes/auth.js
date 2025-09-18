const express = require('express');
const router = express.Router();
const rateLimits = require('../config/rate-limits');
const { createProxy } = require('../controllers/proxyController');
const healthChecker = require('../middleware/health');

// Rate limiting específico para auth
router.use(rateLimits.auth);

// Health check del servicio de usuarios antes del proxy
router.use(healthChecker.createHealthCheckMiddleware('usuarios'));

// Proxy para todas las rutas de autenticación
router.use('/', createProxy('usuarios', {
  '^/api/auth': '/api/auth'
}));

module.exports = router;
