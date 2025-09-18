// src/middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'MISSING_TOKEN',
      message: 'Token de acceso requerido',
      timestamp: new Date().toISOString()
    });
  }

  // Se elimino el secret por defecto
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
        success: false,
        error: 'JWT_SECRET_NOT_CONFIGURED',
        message: 'El secreto de JWT no está configurado en las variables de entorno.',
        timestamp: new Date().toISOString()
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'TOKEN_EXPIRED',
          message: 'El token ha expirado',
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(403).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Token inválido',
        timestamp: new Date().toISOString()
      });
    }
    
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
