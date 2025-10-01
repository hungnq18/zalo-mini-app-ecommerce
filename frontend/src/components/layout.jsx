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

const Layout = () => {
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
            <Route path="/profile" element={<ProfilePage />}></Route>
          </AnimationRoutes>
        </ZMPRouter>
      </SnackbarProvider>
    </App>
  );
};
export default Layout;
