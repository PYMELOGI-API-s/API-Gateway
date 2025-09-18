const services = require('../config/services');
const healthChecker = require('../middleware/health');
const metricsMiddleware = require('../middleware/metrics');

const gatewayController = {
  // Información del gateway
  getInfo: (req, res) => {
    res.json({
      success: true,
      message: 'API Gateway funcionando correctamente',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: Object.keys(services).reduce((acc, key) => {
        acc[key] = {
          name: services[key].name,
          status: 'configured',
          baseUrl: `/api/${key === 'usuarios' ? 'auth' : key}`
        };
        return acc;
      }, {}),
      documentation: {
        docs: '/api/docs',
        postman: '/api/postman-collection',
        metrics: '/api/metrics'
      }
    });
  },

  // Health check
  getHealth: async (req, res) => {
    try {
      const serviceHealths = {};
      
      // Simular health checks (en producción harías requests HTTP reales)
      for (const [name, config] of Object.entries(services)) {
        serviceHealths[name] = {
          status: 'healthy',
          url: config.url,
          lastCheck: new Date().toISOString(),
          responseTime: Math.floor(Math.random() * 100) + 'ms'
        };
      }

      const overallStatus = Object.values(serviceHealths).every(s => s.status === 'healthy') 
        ? 'healthy' : 'degraded';

      res.status(overallStatus === 'healthy' ? 200 : 503).json({
        success: overallStatus === 'healthy',
        status: overallStatus,
        gateway: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: Math.floor(process.uptime()),
          version: '1.0.0'
        },
        services: serviceHealths
      });
    } catch (error) {
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        error: 'Error checking service health',
        timestamp: new Date().toISOString()
      });
    }
  },

  // Métricas
  getMetrics: (req, res) => {
    const stats = metricsMiddleware.getStats();
    res.json({
      success: true,
      message: 'Métricas obtenidas exitosamente',
      data: stats,
      timestamp: new Date().toISOString()
    });
  },

  // Documentación
  getDocs: (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('host');
    
    res.json({
      success: true,
      data: {
        title: 'API Gateway - Documentación',
        version: '1.0.0',
        description: 'Gateway unificado para microservicios',
        baseUrl,
        authentication: {
          type: 'Bearer Token (JWT)',
          header: 'Authorization: Bearer <token>',
          endpoints: {
            register: 'POST /api/auth/registro',
            login: 'POST /api/auth/login',
            refresh: 'POST /api/auth/refresh'
          }
        },
        services: {
          usuarios: {
            description: 'Servicio de gestión de usuarios',
            baseUrl: '/api/usuarios',
            endpoints: [
              { method: 'GET', path: '/api/usuarios', auth: true, description: 'Listar usuarios' },
              { method: 'GET', path: '/api/usuarios/perfil', auth: true, description: 'Obtener perfil' },
              { method: 'GET', path: '/api/usuarios/:id', auth: true, description: 'Obtener usuario por ID' },
              { method: 'PUT', path: '/api/usuarios/:id', auth: true, description: 'Actualizar usuario' },
              { method: 'DELETE', path: '/api/usuarios/:id', auth: true, description: 'Eliminar usuario' }
            ]
          },
          productos: {
            description: 'Servicio de gestión de productos',
            baseUrl: '/api/productos',
            endpoints: [
              { method: 'GET', path: '/api/productos', auth: true, description: 'Listar productos' },
              { method: 'GET', path: '/api/productos/:id', auth: true, description: 'Obtener producto por ID' },
              { method: 'POST', path: '/api/productos', auth: true, description: 'Crear producto' },
              { method: 'PUT', path: '/api/productos/:id', auth: true, description: 'Actualizar producto' },
              { method: 'DELETE', path: '/api/productos/:id', auth: true, description: 'Eliminar producto' },
              { method: 'GET', path: '/api/productos/categorias', auth: true, description: 'Obtener categorías' },
              { method: 'GET', path: '/api/productos/stats', auth: true, description: 'Estadísticas' }
            ]
          }
        },
        examples: {
          login: {
            method: 'POST',
            url: `${baseUrl}/api/auth/login`,
            headers: { 'Content-Type': 'application/json' },
            body: { correo: 'user@example.com', contrasena: 'password123' }
          },
          createProduct: {
            method: 'POST',
            url: `${baseUrl}/api/productos`,
            headers: {
              'Authorization': 'Bearer <token>',
              'Content-Type': 'application/json'
            },
            body: {
              nombre: 'Producto Test',
              descripcion: 'Descripción del producto',
              codigoBarras: '1234567890123',
              precio: 99.99,
              stock: 10,
              categoria: 'Test'
            }
          }
        }
      }
    });
  },

  // Colección de Postman
  getPostmanCollection: (req, res) => {
    const baseUrl = req.protocol + '://' + req.get('host');
    
    const collection = {
      info: {
        name: 'API Gateway Collection',
        description: 'Colección completa para el API Gateway',
        version: '1.0.0'
      },
      variable: [
        { key: 'baseUrl', value: baseUrl },
        { key: 'token', value: '{{jwt_token}}' }
      ],
      item: [
        {
          name: 'Gateway',
          item: [
            {
              name: 'Info',
              request: { method: 'GET', url: '{{baseUrl}}/' }
            },
            {
              name: 'Health',
              request: { method: 'GET', url: '{{baseUrl}}/health' }
            },
            {
              name: 'Metrics',
              request: { method: 'GET', url: '{{baseUrl}}/api/metrics' }
            }
          ]
        },
        {
          name: 'Authentication',
          item: [
            {
              name: 'Login',
              request: {
                method: 'POST',
                header: [{ key: 'Content-Type', value: 'application/json' }],
                body: {
                  mode: 'raw',
                  raw: JSON.stringify({
                    correo: 'test@example.com',
                    contrasena: 'password123'
                  }, null, 2)
                },
                url: '{{baseUrl}}/api/auth/login'
              }
            }
          ]
        },
        {
          name: 'Users',
          item: [
            {
              name: 'Get Profile',
              request: {
                method: 'GET',
                header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
                url: '{{baseUrl}}/api/usuarios/perfil'
              }
            }
          ]
        },
        {
          name: 'Products',
          item: [
            {
              name: 'Get Products',
              request: {
                method: 'GET',
                header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
                url: '{{baseUrl}}/api/productos'
              }
            }
          ]
        }
      ]
    };

    res.json({
      success: true,
      data: collection,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = gatewayController;
