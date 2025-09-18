// src/middleware/health.js
const axios = require('axios');
const services = require('../config/services');

class HealthChecker {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 30000; // 30 segundos
  }

  async checkService(serviceName) {
    const cacheKey = `health_${serviceName}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.status;
    }

    const service = services[serviceName];
    if (!service) {
      return {
        status: 'unknown',
        error: 'Service not configured'
      };
    }

    try {
      const start = Date.now();
      const response = await axios.get(
        `${service.url}${service.healthCheck}`,
        { timeout: 5000 }
      );

      const status = {
        status: response.status === 200 ? 'healthy' : 'unhealthy',
        timestamp: Date.now(),
        responseTime: Date.now() - start,
        url: service.url
      };

      this.cache.set(cacheKey, status);
      return status;
    } catch (error) {
      const status = {
        status: 'unhealthy',
        timestamp: Date.now(),
        error: error.message,
        url: service.url
      };

      this.cache.set(cacheKey, status);
      return status;
    }
  }

  createHealthCheckMiddleware(serviceName) {
    return async (req, res, next) => {
      try {
        const health = await this.checkService(serviceName);
        
        if (health.status !== 'healthy') {
          return res.status(503).json({
            success: false,
            error: 'SERVICE_UNAVAILABLE',
            message: `El servicio ${serviceName} no está disponible`,
            service: serviceName,
            timestamp: new Date().toISOString()
          });
        }
        
        next();
      } catch (error) {
        res.status(503).json({
          success: false,
          error: 'HEALTH_CHECK_ERROR',
          message: 'Error verificando salud del servicio',
          service: serviceName,
          timestamp: new Date().toISOString()
        });
      }
    };
  }
}

module.exports = new HealthChecker();
