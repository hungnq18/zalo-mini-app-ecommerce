const jsonServer = require('json-server');
const cors = require('cors');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Enable CORS for all origins
server.use(cors({
  origin: true,
  credentials: true
}));

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.use(jsonServer.bodyParser);

// Custom middleware for API responses
server.use((req, res, next) => {
  // Add delay for development (remove in production)
  if (process.env.NODE_ENV !== 'production') {
    setTimeout(next, 500);
  } else {
    next();
  }
});

// Custom routes
server.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'UnionMart API Server is running',
    timestamp: new Date().toISOString()
  });
});

// Use default router with /api prefix
server.use('/api', router);

// Fallback route
server.get('/', (req, res) => {
  res.json({
    message: 'Welcome to UnionMart API Server',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      categories: '/api/categories',
      users: '/api/users',
      orders: '/api/orders',
      vouchers: '/api/vouchers',
      promotions: '/api/promotions',
      utilities: '/api/utilities'
    }
  });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 UnionMart API Server is running on http://${HOST}:${PORT}`);
  console.log(`📊 Database: db.json`);
  console.log(`🌐 Health check: http://${HOST}:${PORT}/api/health`);
});
