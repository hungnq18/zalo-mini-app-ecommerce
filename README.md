# UnionMart - Zalo Mini App E-commerce

Ứng dụng thương mại điện tử UnionMart được xây dựng trên nền tảng Zalo Mini App, cung cấp trải nghiệm mua sắm trực tuyến tối ưu cho người dùng Việt Nam.

## 🏗️ Cấu trúc dự án

```
UnionMart/
│
├── frontend/                # Mini App (React + ZMP UI)
│   ├── public/              # Static assets
│   ├── src/                 # Source code
│   │   ├── pages/           # Các page (Home, ProductList...)
│   │   ├── components/      # Component UI
│   │   ├── context/         # Context (AppContext...)
│   │   ├── css/             # SCSS/CSS
│   │   └── App.jsx
│   ├── package.json
│   ├── zalo.config.json     # Cấu hình cho Mini App
│   └── .vercel.json         # Cấu hình build cho Vercel
│
├── backend/                 # Backend API (json-server)
│   ├── db.json              # Mock data
│   ├── package.json
│   ├── server.js            # Custom JSON Server
│   └── render.yaml          # Cấu hình deploy Render
│
└── README.md
```

## 🚀 Tính năng chính

### 🛍️ Mua sắm
- **Trang chủ**: Hiển thị sản phẩm nổi bật, khuyến mãi
- **Danh mục sản phẩm**: Duyệt sản phẩm theo danh mục
- **Tìm kiếm**: Tìm kiếm sản phẩm với bộ lọc
- **Chi tiết sản phẩm**: Thông tin chi tiết, đánh giá
- **Giỏ hàng**: Quản lý sản phẩm trong giỏ
- **Thanh toán**: Đặt hàng với nhiều phương thức thanh toán

### 👤 Người dùng
- **Hồ sơ cá nhân**: Quản lý thông tin người dùng
- **Đơn hàng**: Theo dõi trạng thái đơn hàng
- **Địa chỉ**: Quản lý địa chỉ giao hàng
- **Voucher**: Sử dụng và quản lý mã giảm giá
- **Thông báo**: Nhận thông báo về đơn hàng, khuyến mãi

## 🛠️ Công nghệ sử dụng

### Frontend
- **React 18**: Library UI chính
- **ZMP UI**: Component library cho Zalo Mini App
- **React Router**: Điều hướng trang
- **SCSS**: Styling
- **Vite**: Build tool
- **Lucide React**: Icon library

### Backend
- **JSON Server**: Mock API server
- **Node.js**: Runtime environment
- **CORS**: Cross-origin resource sharing

## 📦 Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js >= 14.0.0
- npm hoặc yarn
- Zalo Developer Account (để deploy)

### 1. Clone repository
```bash
git clone https://github.com/hungnq18/zalo-mini-app-ecommerce.git
cd UnionMart
```

### 2. Cài đặt Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Cài đặt Backend
```bash
cd ../backend
npm install
npm run dev
```

### 4. Truy cập ứng dụng
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## 🌐 Deploy

### Frontend (Vercel)
1. Kết nối repository với Vercel
2. Cấu hình environment variables:
   ```
   VITE_API_BASE_URL=https://your-backend-domain.com/api
   ```
3. Deploy tự động từ main branch

### Backend (Render)
1. Kết nối repository với Render
2. Chọn thư mục `backend`
3. Cấu hình:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `NODE_ENV=production`

### Zalo Mini App
1. Đăng ký tài khoản Zalo Developer
2. Tạo Mini App mới
3. Cấu hình `zalo.config.json`
4. Upload build files
5. Submit for review

## 📱 API Endpoints

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm mới

### Categories
- `GET /api/categories` - Lấy danh sách danh mục
- `GET /api/categories/:id` - Lấy chi tiết danh mục

### Users
- `GET /api/users` - Lấy danh sách người dùng
- `GET /api/users/:id` - Lấy thông tin người dùng
- `PUT /api/users/:id` - Cập nhật thông tin người dùng

### Orders
- `GET /api/orders` - Lấy danh sách đơn hàng
- `POST /api/orders` - Tạo đơn hàng mới
- `PUT /api/orders/:id` - Cập nhật đơn hàng

### Vouchers
- `GET /api/vouchers` - Lấy danh sách voucher
- `POST /api/vouchers` - Tạo voucher mới

## 🎨 UI/UX Features

- **Responsive Design**: Tối ưu cho mobile
- **Dark/Light Mode**: Hỗ trợ chế độ sáng/tối
- **Loading States**: Skeleton loading cho UX tốt hơn
- **Error Handling**: Xử lý lỗi user-friendly
- **Offline Support**: Hoạt động cơ bản khi offline

## 🔧 Cấu hình môi trường

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=UnionMart
VITE_ZALO_APP_ID=your-zalo-app-id
```

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Dự án này được phân phối dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.

## 👥 Team

- **Developer**: UnionMart Team
- **Contact**: [your-email@example.com]

## 🙏 Acknowledgments

- Zalo Mini App Platform
- React Community
- JSON Server
- Vercel & Render for hosting