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

    // Apply voucher if provided
    if (spinData.voucherId) {
      if (!Array.isArray(user.vouchers)) user.vouchers = [];
      if (!user.vouchers.includes(spinData.voucherId)) {
        user.vouchers.push(spinData.voucherId);
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
