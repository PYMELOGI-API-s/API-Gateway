const express = require('express');
const router = express.Router();
const rateLimits = require('../config/rate-limits');
const { authenticateToken } = require('../middleware/auth');
const { createProxy } = require('../controllers/proxyController');
const healthChecker = require('../middleware/health');

// Autenticación requerida para todas las rutas de usuarios
router.use(authenticateToken);

// Rate limiting para API de usuarios
router.use(rateLimits.api);

// Health check del servicio de usuarios
router.use(healthChecker.createHealthCheckMiddleware('usuarios'));

// Proxy para todas las rutas de usuarios
router.use('/', createProxy('usuarios', {
  '^/api/usuarios': '/api/usuarios'
}));

module.exports = router;
