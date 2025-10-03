import React from "react";
import { BrowserRouter, Route as ReactRoute, Routes } from "react-router-dom";
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
import LuckyWheelPage from "../pages/luckyWheel";
import MyVouchersPage from "../pages/myVouchers";
import NotificationsPage from "../pages/notifications";
import OrderDetailPage from "../pages/orderDetail";
import OrdersPage from "../pages/orders";
import PrivacyPage from "../pages/privacy";
import ProductDetail from "../pages/productDetail";
import ProductListPage from "../pages/productList";
import ProfilePage from "../pages/profile";
import SearchPage from "../pages/search";
import VipMemberPage from "../pages/vipMember";
import VouchersPage from "../pages/vouchers";

const Layout = () => {
  // Check if running in Zalo environment
  const isZaloEnvironment = () => {
    try {
      // Force web browser mode for now to debug
      return false;
      
      // Original detection (commented out for debugging)
      // return typeof window !== 'undefined' && 
      //        (window.ZaloJavaScriptInterface || 
      //         navigator.userAgent.includes('ZaloTheme') ||
      //         window.location.href.includes('zalo'));
    } catch (error) {
      return false;
    }
  };

  const isZalo = isZaloEnvironment();
  console.log('Environment:', isZalo ? 'Zalo' : 'Web Browser');
  console.log('Force using web browser mode for debugging...');

  if (isZalo) {
    // Zalo Mini App Layout
    try {
      return (
        <App theme={getSystemInfo().zaloTheme}>
          <SnackbarProvider>
            <ZMPRouter>
              <AnimationRoutes>
                <Route path="/" element={<HomePage />}></Route>
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
                <Route path="/lucky-wheel" element={<LuckyWheelPage shouldLoad={true} />}></Route>
                <Route path="/vip-member" element={<VipMemberPage />}></Route>
                <Route path="/profile" element={<ProfilePage />}></Route>
              </AnimationRoutes>
            </ZMPRouter>
          </SnackbarProvider>
        </App>
      );
    } catch (error) {
      console.error('ZMP UI Error:', error);
      // Fallback to web layout if ZMP fails
    }
  }

  // Web Browser Layout (fallback)
  console.log('Using web browser layout...');
  return (
    <BrowserRouter>
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f5f5f5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <Routes>
          <ReactRoute path="/" element={<HomePage />} />
          <ReactRoute path="/search" element={<SearchPage />} />
          <ReactRoute path="/category/:categoryId" element={<ProductListPage />} />
          <ReactRoute path="/product/:id" element={<ProductDetail />} />
          <ReactRoute path="/orders" element={<OrdersPage />} />
          <ReactRoute path="/orders/:id" element={<OrderDetailPage />} />
          <ReactRoute path="/notifications" element={<NotificationsPage />} />
          <ReactRoute path="/privacy" element={<PrivacyPage />} />
          <ReactRoute path="/cart" element={<CartPage />} />
          <ReactRoute path="/checkout" element={<CheckoutPage />} />
          <ReactRoute path="/checkout/address" element={<AddressFormPage />} />
          <ReactRoute path="/addresses" element={<AddressesPage />} />
          <ReactRoute path="/vouchers" element={<VouchersPage />} />
          <ReactRoute path="/my-vouchers" element={<MyVouchersPage />} />
          <ReactRoute path="/lucky-wheel" element={<LuckyWheelPage shouldLoad={true} />} />
          <ReactRoute path="/vip-member" element={<VipMemberPage />} />
          <ReactRoute path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};
export default Layout;
