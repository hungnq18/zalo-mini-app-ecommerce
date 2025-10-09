const jsonServer = require('json-server');
const cors = require('cors');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Enable CORS for all origins including Zalo Mini App
server.use(cors({
  origin: [
    'https://zalo.me',
    'https://*.zalo.me',
    'https://zalo.me/s/543739863337914011',
    'https://zalo.me/s/*',
    'https://zaloapp.com',
    'https://*.zaloapp.com',
    'https://zaloapp.com:3000',
    'https://zaloapp.com:3001',
    'https://zaloapp.com:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173',
    true // Allow all origins for development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Handle preflight requests for Zalo Mini App
server.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// Special middleware for Zalo Mini App
server.use((req, res, next) => {
  // Log Zalo Mini App requests
  if (req.headers.origin && req.headers.origin.includes('zalo.me')) {
    console.log('Zalo Mini App request:', {
      origin: req.headers.origin,
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent']
    });
  }
  
  // Set CORS headers for Zalo Mini App
  if (req.headers.origin && req.headers.origin.includes('zalo.me')) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  }
  
  next();
});

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
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'unknown'
  });
});

// Zalo Mini App test endpoint
server.get('/api/zalo-test', (req, res) => {
  res.json({
    success: true,
    message: 'Zalo Mini App connection successful',
    data: {
      timestamp: new Date().toISOString(),
      origin: req.headers.origin,
      userAgent: req.headers['user-agent'],
      zaloAppId: '543739863337914011'
    }
  });
});

// Lucky Wheel API routes
server.get('/api/lucky-wheel', (req, res) => {
  // Disable caching for this endpoint
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  const db = router.db;
  const luckyWheel = db.get('lucky-wheel').value();
  
  if (!luckyWheel) {
    return res.status(404).json({
      success: false,
      message: 'Lucky wheel data not found'
    });
  }
  
  res.json({
    success: true,
    data: luckyWheel
  });
});

// User API endpoints (API prefix)
server.get('/api/user', (req, res) => {
  const db = router.db;
  const user = db.get('user').value();
  res.json({
    success: true,
    data: user
  });
});

server.put('/api/user', (req, res) => {
  const db = router.db;
  const userData = req.body || {};

  // Merge with existing user object to avoid overwriting unintended fields
  const existing = db.get('user').value() || {};
  const merged = { ...existing, ...userData };

  db.set('user', merged).write();

  res.json({
    success: true,
    data: merged
  });
});

server.get('/api/lucky-wheel/voucher-templates/:voucherId', (req, res) => {
  const db = router.db;
  const luckyWheel = db.get('lucky-wheel').value();
  const { voucherId } = req.params;
  
  if (!luckyWheel || !luckyWheel.voucherTemplates) {
    return res.status(404).json({
      success: false,
      message: 'Voucher templates not found'
    });
  }
  
  const template = luckyWheel.voucherTemplates[voucherId];
  
  if (!template) {
    return res.status(404).json({
      success: false,
      message: 'Voucher template not found'
    });
  }
  
  res.json({
    success: true,
    data: template
  });
});

server.post('/api/lucky-wheel/spin-log', (req, res) => {
  const db = router.db;
  const spinData = req.body;
  
  // Add timestamp if not provided
  if (!spinData.timestamp) {
    spinData.timestamp = new Date().toISOString();
  }
  
  // Add to spin logs
  const luckyWheel = db.get('lucky-wheel').value();
  if (luckyWheel && luckyWheel.spinLogs) {
    luckyWheel.spinLogs.push(spinData);
    db.get('lucky-wheel').write(luckyWheel);
  }
  
  res.json({
    success: true,
    message: 'Spin result logged successfully'
  });
});

// Server-side spin endpoint: validate spins, enforce resetTime and spinCooldown, update user and spin logs
server.post('/api/lucky-wheel/spin', (req, res) => {
  try {
    const db = router.db;
    const spinData = req.body || {};
    const config = db.get('lucky-wheel').get('config').value() || {};
    const now = new Date();

    // Load user (single-user demo)
    const user = db.get('user').value() || {};

    // Compute reset boundary from config.resetTime (format HH:MM)
    const resetTimeStr = config.resetTime || '00:00';
    const [rh, rm] = String(resetTimeStr).split(':').map(s => Number(s || 0));
    const todayReset = new Date(now.getFullYear(), now.getMonth(), now.getDate(), rh || 0, rm || 0, 0);
    const lastResetBoundary = now >= todayReset ? todayReset : new Date(todayReset.getTime() - 24 * 3600 * 1000);

    // Determine lastSpinAt from user (support both lastSpinAt timestamp and legacy lastSpinDate)
    let lastSpinAt = null;
    if (user.lastSpinAt) {
      lastSpinAt = new Date(user.lastSpinAt);
    } else if (user.lastSpinDate) {
      // interpret lastSpinDate as local date at midnight
      lastSpinAt = new Date(`${user.lastSpinDate}T00:00:00`);
    }

    // If user hasn't spun since last reset boundary, reset remainingSpins
    const dailySpins = Number(config.dailySpins ?? user.dailySpins ?? 3);
    if (!lastSpinAt || lastSpinAt < lastResetBoundary) {
      user.remainingSpins = dailySpins;
      // Clear lastSpinAt so cooldown won't block immediately after reset
      user.lastSpinAt = null;
      // do not set lastSpinAt yet for this day's spins
    }

    // Enforce spinCooldown (minutes)
    const spinCooldownMinutes = Number(config.spinCooldown || 0);
    if (spinCooldownMinutes > 0 && user.lastSpinAt) {
      const last = new Date(user.lastSpinAt);
      const diffMs = now.getTime() - last.getTime();
      const cooldownMs = spinCooldownMinutes * 60 * 1000;
      if (diffMs < cooldownMs) {
        const waitSec = Math.ceil((cooldownMs - diffMs) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitSec} seconds before next spin`,
          retryAfterSeconds: waitSec
        });
      }
    }

    // Ensure user has remaining spins
    if (!user.remainingSpins || Number(user.remainingSpins) <= 0) {
      return res.status(400).json({ success: false, message: 'No remaining spins for today' });
    }

    // Consume a spin
    user.remainingSpins = Number(user.remainingSpins) - 1;
    user.lastSpinAt = now.toISOString();
    user.lastSpinDate = now.toISOString().split('T')[0];

    // Apply points if provided
    const pointsEarned = Number(spinData.pointsEarned || 0);
    user.points = Number(user.points || 0) + pointsEarned;

    // Apply voucher if provided (auto-add to user's voucher collection)
    if (spinData.voucherId) {
      if (!Array.isArray(user.vouchers)) user.vouchers = [];
      if (!user.vouchers.includes(spinData.voucherId)) {
        user.vouchers.push(spinData.voucherId);
        console.log(`Added voucher ${spinData.voucherId} to user ${user.id}`);
      }
    }
    
    // Auto-add voucher to user if prize is a voucher (from wheel spin)
    if (spinData.prizeType === 'voucher' && spinData.voucherId) {
      if (!Array.isArray(user.vouchers)) user.vouchers = [];
      if (!user.vouchers.includes(spinData.voucherId)) {
        user.vouchers.push(spinData.voucherId);
        console.log(`Auto-added voucher ${spinData.voucherId} to user ${user.id} from wheel spin`);
      }
    }

    // Persist user
    db.set('user', user).write();

    // Append spin log
    const luckyWheel = db.get('lucky-wheel').value();
    const logEntry = {
      userId: user.id,
      prizeId: spinData.prizeId ?? null,
      prizeType: spinData.prizeType ?? null,
      voucherId: spinData.voucherId ?? null,
      pointsEarned: pointsEarned,
      timestamp: now.toISOString()
    };
    if (luckyWheel && Array.isArray(luckyWheel.spinLogs)) {
      luckyWheel.spinLogs.push(logEntry);
      db.get('lucky-wheel').write(luckyWheel);
    }

    return res.json({ success: true, message: 'Spin accepted', data: { user, log: logEntry } });
  } catch (error) {
    console.error('Error processing spin:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Add voucher to user endpoint
server.post('/api/user/add-voucher', (req, res) => {
  try {
    const { userId, voucherId } = req.body;
    const db = router.db;
    
    // Load user
    const user = db.get('user').value() || {};
    
    if (!user.id || user.id !== userId) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Add voucher to user's collection
    if (!Array.isArray(user.vouchers)) user.vouchers = [];
    if (!user.vouchers.includes(voucherId)) {
      user.vouchers.push(voucherId);
      console.log(`Added voucher ${voucherId} to user ${userId}`);
    }
    
    // Persist user
    db.set('user', user).write();
    
    return res.json({ success: true, message: 'Voucher added to user', data: { user } });
  } catch (error) {
    console.error('Error adding voucher to user:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

server.put('/api/lucky-wheel/config', (req, res) => {
  const db = router.db;
  const configData = req.body;
  
  const luckyWheel = db.get('lucky-wheel').value();
  if (luckyWheel) {
    luckyWheel.config = { ...luckyWheel.config, ...configData };
    db.get('lucky-wheel').write(luckyWheel);
    
    res.json({
      success: true,
      message: 'Config updated successfully',
      data: luckyWheel.config
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Lucky wheel data not found'
    });
  }
});

// Custom search endpoint for products
server.get('/api/products', (req, res) => {
  const db = router.db;
  let products = db.get('products').value() || [];
  
  // Handle search query
  if (req.query.q || req.query.search) {
    const searchTerm = (req.query.q || req.query.search).toLowerCase().trim();
    
    // Split search term into individual words for better matching
    const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
    
    products = products.filter(product => {
      // Helper function to check if text contains any of the search words
      const containsSearchWords = (text) => {
        if (!text) return false;
        const lowerText = text.toLowerCase();
        return searchWords.some(word => lowerText.includes(word));
      };
      
      // Search in name - partial matching
      if (product.name && containsSearchWords(product.name)) {
        return true;
      }
      
      // Search in description - partial matching
      if (product.description && containsSearchWords(product.description)) {
        return true;
      }
      
      // Search in detailedDescription - partial matching
      if (product.detailedDescription && containsSearchWords(product.detailedDescription)) {
        return true;
      }
      
      // Search in searchKeywords - partial matching
      if (product.searchKeywords && Array.isArray(product.searchKeywords)) {
        return product.searchKeywords.some(keyword => 
          containsSearchWords(keyword)
        );
      }
      
      // Search in categories - partial matching
      if (product.categories && Array.isArray(product.categories)) {
        return product.categories.some(category => 
          containsSearchWords(category)
        );
      }
      
      // Search in tags - partial matching
      if (product.tags && Array.isArray(product.tags)) {
        return product.tags.some(tag => 
          containsSearchWords(tag)
        );
      }
      
      // Search in reviews comments - partial matching
      if (product.reviewsList && Array.isArray(product.reviewsList)) {
        return product.reviewsList.some(review => 
          review.comment && containsSearchWords(review.comment)
        );
      }
      
      return false;
    });
  }
  
  // Handle category filter
  if (req.query.categoryIds_like) {
    const categoryId = req.query.categoryIds_like;
    products = products.filter(product => 
      product.categoryIds && product.categoryIds.includes(categoryId)
    );
  }
  
  // Handle price range
  if (req.query.price_gte) {
    const minPrice = parseFloat(req.query.price_gte);
    products = products.filter(product => product.price >= minPrice);
  }
  
  if (req.query.price_lte) {
    const maxPrice = parseFloat(req.query.price_lte);
    products = products.filter(product => product.price <= maxPrice);
  }
  
  // Handle active products
  if (req.query.isActive !== undefined) {
    const isActive = req.query.isActive === 'true';
    products = products.filter(product => product.isActive === isActive);
  }
  
  // Handle featured products
  if (req.query.isFeatured === 'true') {
    products = products.filter(product => product.isFeatured === true);
  }
  
  // Handle limit
  const limit = parseInt(req.query._limit) || products.length;
  products = products.slice(0, limit);
  
  res.json({
    success: true,
    data: products
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
      utilities: '/api/utilities',
      luckyWheel: '/api/lucky-wheel'
    }
  });
});

// Voucher API endpoints
server.post('/api/vouchers', (req, res) => {
  const db = router.db;
  const voucherData = req.body;
  
  // Add timestamp if not provided
  if (!voucherData.createdAt) {
    voucherData.createdAt = new Date().toISOString();
  }
  
  // Generate unique ID if not provided
  if (!voucherData.id) {
    voucherData.id = `voucher-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Get current vouchers array
  const vouchers = db.get('vouchers').value() || [];
  
  // Add new voucher
  vouchers.push(voucherData);
  
  // Update database
  db.set('vouchers', vouchers).write();
  
  res.json({
    success: true,
    data: voucherData
  });
});

server.get('/api/vouchers', (req, res) => {
  const db = router.db;
  const vouchers = db.get('vouchers').value() || [];
  
  res.json({
    success: true,
    data: vouchers
  });
});

// User API endpoints
server.get('/user', (req, res) => {
  const db = router.db;
  const user = db.get('user').value();
  res.json({
    success: true,
    data: user
  });
});

server.put('/user', (req, res) => {
  const db = router.db;
  const userData = req.body;
  
  // Update user data
  db.get('user').assign(userData).write();
  
  res.json({
    success: true,
    data: userData
  });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 UnionMart API Server is running on http://${HOST}:${PORT}`);
  console.log(`📊 Database: db.json`);
  console.log(`🌐 Health check: http://${HOST}:${PORT}/api/health`);
});
