const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message,
        retryAfter: Math.ceil(windowMs / 1000),
        timestamp: new Date().toISOString()
      });
    }
  });
};

module.exports = {
  global: createRateLimiter(
    15 * 60 * 1000, // 15 minutos
    100,
    'Demasiadas solicitudes desde esta IP'
  ),
  auth: createRateLimiter(
    15 * 60 * 1000, // 15 minutos
    10,
    'Demasiados intentos de autenticación'
  ),
  api: createRateLimiter(
    60 * 1000, // 1 minuto
    50,
    'Demasiadas solicitudes a la API'
  )
};
