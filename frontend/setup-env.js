#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envContent = `# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# App Configuration
VITE_APP_NAME=UnionMart
VITE_APP_VERSION=1.0.0

# Zalo Mini App Configuration
VITE_ZALO_APP_ID=your-zalo-app-id
`;

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
  console.log('📝 Please edit .env.local with your actual values');
} else {
  console.log('ℹ️  .env.local already exists');
}
