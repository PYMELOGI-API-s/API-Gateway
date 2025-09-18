const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/services');

const createProxy = (serviceName, pathRewrite = {}) => {
  const service = services[serviceName];
  
  if (!service) {
    throw new Error(`Servicio ${serviceName} no encontrado`);
  }

  return createProxyMiddleware({
    target: service.url,
    changeOrigin: true,
    timeout: service.timeout || 30000,
    pathRewrite,
    
    onProxyReq: (proxyReq, req, res) => {
      // Headers personalizados
      proxyReq.setHeader('X-Gateway-Request-ID', req.requestId || Date.now());
      proxyReq.setHeader('X-Forwarded-For', req.ip);
      
      if (req.user) {
        proxyReq.setHeader('X-User-ID', req.user.id);
        proxyReq.setHeader('X-User-Username', req.user.username);
      }
    },

    onProxyRes: (proxyRes, req, res) => {
      proxyRes.headers['X-Gateway'] = 'API-Gateway-v1.0.0';
      proxyRes.headers['X-Service'] = serviceName;
    },

    onError: (err, req, res) => {
      console.error(`Proxy error for ${serviceName}:`, err.message);
      
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          error: 'SERVICE_UNAVAILABLE',
          message: `El servicio ${serviceName} no está disponible`,
          service: serviceName,
          timestamp: new Date().toISOString()
        });
      }
    }
  });
};

module.exports = { createProxy };