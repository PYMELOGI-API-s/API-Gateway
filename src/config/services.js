const services = {
  usuarios: {
    name: 'Servicio de Usuarios',
    url: process.env.USUARIOS_SERVICE_URL || 'http://localhost:8080',
    healthCheck: '/health',
    timeout: 30000
  },
  productos: {
    name: 'Servicio de Productos', 
    url: process.env.PRODUCTOS_SERVICE_URL || 'http://localhost:3001',
    healthCheck: '/health',
    timeout: 30000
  }
};

module.exports = services;
