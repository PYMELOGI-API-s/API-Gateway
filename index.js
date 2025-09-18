// index.js - Punto de entrada principal
const express = require('express');
const helmet = require('helmet');
require('dotenv').config();

// Importar configuraciones
const serviceConfig = require('./src/config/services');
const rateLimits = require('./src/config/rate-limits');
const corsMiddleware = require('./src/middleware/cors');
const loggingMiddleware = require('./src/middleware/logging');
const errorHandler = require('./src/middleware/error-handler');
const metricsMiddleware = require('./src/middleware/metrics');

// Importar rutas
const gatewayRoutes = require('./src/routes/gateway');
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const productRoutes = require('./src/routes/products');

const app = express();
const port = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARE GLOBALES
// ==========================================

// Seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS
app.use(corsMiddleware);

// Logging
app.use(loggingMiddleware.requestLogger);

// Métricas
app.use(metricsMiddleware.middleware());

// Rate limiting global
app.use('/api/', rateLimits.global);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Headers personalizados
app.use((req, res, next) => {
  res.setHeader('X-Gateway', 'API-Gateway-v1.0.0');
  res.setHeader('X-Request-ID', req.requestId || Date.now());
  next();
});

// ==========================================
// RUTAS
// ==========================================

// Rutas del gateway (info, health, docs, etc.)
app.use('/', gatewayRoutes);

// Rutas de autenticación (públicas)
app.use('/api/auth', authRoutes);

// Rutas de usuarios (protegidas)
app.use('/api/usuarios', userRoutes);

// Rutas de productos (protegidas)
app.use('/api/productos', productRoutes);

// ==========================================
// MANEJO DE ERRORES
// ==========================================

// Ruta no encontrada - se elimina el asterisco para compatibilidad
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'ROUTE_NOT_FOUND',
    message: `La ruta ${req.method} ${req.originalUrl} no existe`,
    timestamp: new Date().toISOString()
  });
});

// Manejo global de errores
app.use(errorHandler);

// ==========================================
// INICIO DEL SERVIDOR
// ==========================================

// Solo iniciar el servidor si no estamos en modo de prueba
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(port, () => {
    console.log('🚀 ================================');
    console.log(`🚀 API Gateway iniciado en puerto ${port}`);
    console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('🚀 ================================');
    console.log(`📚 Documentación: http://localhost:${port}/api/docs`);
    console.log(`💚 Health Check: http://localhost:${port}/health`);
    console.log(`📊 Métricas: http://localhost:${port}/api/metrics`);
    console.log('🚀 ================================');
  });

  // Cierre graceful
  process.on('SIGTERM', () => {
    console.log('SIGTERM recibido. Cerrando servidor...');
    server.close(() => {
      console.log('Servidor cerrado.');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT recibido. Cerrando servidor...');
    server.close(() => {
      console.log('Servidor cerrado.');
      process.exit(0);
    });
  });
}

module.exports = app; // Exportar la app para las pruebas
