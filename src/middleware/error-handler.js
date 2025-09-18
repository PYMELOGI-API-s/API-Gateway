// src/middleware/error-handler.js
const { logger } = require('./logging');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled Error', {
    error: err.message,
    stack: err.stack,
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });

  if (res.headersSent) {
    return next(err);
  }

  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let message = 'Error interno del servidor';

  switch (err.name) {
    case 'ValidationError':
      statusCode = 400;
      errorCode = 'VALIDATION_ERROR';
      message = 'Error de validación';
      break;
    
    case 'JsonWebTokenError':
      statusCode = 401;
      errorCode = 'INVALID_TOKEN';
      message = 'Token inválido';
      break;
    
    case 'TokenExpiredError':
      statusCode = 401;
      errorCode = 'TOKEN_EXPIRED';
      message = 'Token expirado';
      break;
    
    case 'SyntaxError':
      if (err.status === 400 && 'body' in err) {
        statusCode = 400;
        errorCode = 'INVALID_JSON';
        message = 'JSON malformado';
      }
      break;
  }

  const errorResponse = {
    success: false,
    error: errorCode,
    message,
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;