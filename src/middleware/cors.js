// src/middleware/cors.js
const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim());
    
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:3000', 'http://localhost:3001', 'http://localhost:4200');
    }
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Request-ID'
  ],
  exposedHeaders: [
    'X-Request-ID',
    'X-Gateway',
    'X-Response-Time'
  ],
  credentials: true,
  maxAge: 86400
};

module.exports = cors(corsOptions);
