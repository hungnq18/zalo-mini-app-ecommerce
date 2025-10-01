import { getSystemInfo } from "zmp-sdk";
import {
  AnimationRoutes,
  App,
  Route,
  SnackbarProvider,
  ZMPRouter,
} from "zmp-ui";

import AddressFormPage from "../pages/addressForm";
import AddressesPage from "../pages/addresses";
import CartPage from "../pages/cart";
import CheckoutPage from "../pages/checkout";
import HomePage from "../pages/index";
import MyVouchersPage from "../pages/myVouchers";
import NotificationsPage from "../pages/notifications";
import OrderDetailPage from "../pages/orderDetail";
import OrdersPage from "../pages/orders";
import PrivacyPage from "../pages/privacy";
import ProductDetail from "../pages/productDetail";
import ProductListPage from "../pages/productList";
import ProfilePage from "../pages/profile";
import SearchPage from "../pages/search";
import VouchersPage from "../pages/vouchers";
import TestComponent from "./TestComponent";

const Layout = () => {
  console.log('Layout component rendering...');
  
  // Simple test first - bypass ZMP UI completely
  const SimpleLayout = () => {
    console.log('SimpleLayout rendering...');
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#007aff',
        color: 'white',
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: '0 0 16px 0', fontSize: '32px' }}>UnionMart</h1>
        <p style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Simple Layout Working!</p>
        <div style={{
          width: '100px',
          height: '100px',
          backgroundColor: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#007aff',
          fontSize: '48px',
          fontWeight: 'bold'
        }}>
          ✓
        </div>
      </div>
    );
  };
  
  // Test if simple layout works first
  const useSimpleLayout = true; // Change to false to test ZMP UI
  
  if (useSimpleLayout) {
    console.log('Using simple layout...');
    return <SimpleLayout />;
  }
  
  try {
    console.log('Using ZMP UI layout...');
    return (
      <App theme={getSystemInfo().zaloTheme}>
        <SnackbarProvider>
          <ZMPRouter>
            <AnimationRoutes>
              <Route path="/" element={<TestComponent />}></Route>
              <Route path="/home" element={<HomePage />}></Route>
              <Route path="/search" element={<SearchPage />}></Route>
              <Route path="/category/:categoryId" element={<ProductListPage />}></Route>
              <Route path="/product/:id" element={<ProductDetail />}></Route>
              <Route path="/orders" element={<OrdersPage />}></Route>
              <Route path="/orders/:id" element={<OrderDetailPage />}></Route>
              <Route path="/notifications" element={<NotificationsPage />}></Route>
              <Route path="/privacy" element={<PrivacyPage />}></Route>
              <Route path="/cart" element={<CartPage />}></Route>
              <Route path="/checkout" element={<CheckoutPage />}></Route>
              <Route path="/checkout/address" element={<AddressFormPage />}></Route>
              <Route path="/addresses" element={<AddressesPage />}></Route>
              <Route path="/vouchers" element={<VouchersPage />}></Route>
              <Route path="/my-vouchers" element={<MyVouchersPage />}></Route>
              <Route path="/profile" element={<ProfilePage />}></Route>
            </AnimationRoutes>
          </ZMPRouter>
        </SnackbarProvider>
      </App>
    );
  } catch (error) {
    console.error('Layout render error:', error);
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1>Layout Error</h1>
        <p>Error: {error.message}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }
};
export default Layout;
