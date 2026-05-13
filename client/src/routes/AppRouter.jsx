import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { VendorLayout } from '@/components/layout/VendorLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';

import LandingPage from '@/pages/public/Landing';
import AboutPage from '@/pages/public/About';
import ContactPage from '@/pages/public/Contact';
import MarketplacePage from '@/pages/public/Marketplace';
import ProductDetailPage from '@/pages/public/ProductDetail';
import VendorProfilePage from '@/pages/public/VendorProfile';

import LoginPage from '@/pages/auth/Login';
import AdminLoginPage from '@/pages/auth/AdminLogin';
import SignupPage from '@/pages/auth/Signup';
import ForgotPasswordPage from '@/pages/auth/ForgotPassword';
import OAuthCallbackPage from '@/pages/auth/OAuthCallback';

import CustomerHome from '@/pages/customer/CustomerHome';
import BrowsePage from '@/pages/customer/Browse';
import CartPage from '@/pages/customer/Cart';
import CheckoutPage from '@/pages/customer/Checkout';
import OrdersPage from '@/pages/customer/Orders';
import OrderDetailPage from '@/pages/customer/OrderDetail';
import WishlistPage from '@/pages/customer/Wishlist';
import ProfilePage from '@/pages/customer/Profile';
import SettingsPage from '@/pages/customer/Settings';
import MessagesPage from '@/pages/shared/Messages';

import VendorDashboard from '@/pages/vendor/VendorDashboard';
import VendorProducts from '@/pages/vendor/VendorProducts';
import VendorOrders from '@/pages/vendor/VendorOrders';
import VendorInventory from '@/pages/vendor/VendorInventory';
import VendorEarnings from '@/pages/vendor/VendorEarnings';
import VendorStore from '@/pages/vendor/VendorStore';
import VendorCoupons from '@/pages/vendor/VendorCoupons';
import VendorSettings from '@/pages/vendor/VendorSettings';

import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminVendors from '@/pages/admin/AdminVendors';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminSettings from '@/pages/admin/AdminSettings';

export const AppRouter = () => (
  <Routes>
    {/* AUTH */}
    <Route path="/auth/login" element={<LoginPage />} />
    <Route path="/auth/admin" element={<AdminLoginPage />} />
    <Route path="/auth/signup" element={<SignupPage />} />
    <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/auth/callback" element={<OAuthCallbackPage />} />

    {/* PUBLIC */}
    <Route element={<PublicLayout />}>
      <Route index element={<LandingPage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="contact" element={<ContactPage />} />
      <Route path="marketplace" element={<MarketplacePage />} />
      <Route path="products/:slug" element={<ProductDetailPage />} />
      <Route path="vendors/:slug" element={<VendorProfilePage />} />
    </Route>

    {/* CUSTOMER */}
    <Route
      path="/app"
      element={
        <ProtectedRoute roles={['customer', 'vendor', 'admin']}>
          <CustomerLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<CustomerHome />} />
      <Route path="browse" element={<BrowsePage />} />
      <Route path="cart" element={<CartPage />} />
      <Route path="checkout" element={<CheckoutPage />} />
      <Route path="orders" element={<OrdersPage />} />
      <Route path="orders/:id" element={<OrderDetailPage />} />
      <Route path="wishlist" element={<WishlistPage />} />
      <Route path="messages" element={<MessagesPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>

    {/* VENDOR */}
    <Route
      path="/vendor"
      element={
        <ProtectedRoute roles={['vendor']}>
          <VendorLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<VendorDashboard />} />
      <Route path="products" element={<VendorProducts />} />
      <Route path="orders" element={<VendorOrders />} />
      <Route path="inventory" element={<VendorInventory />} />
      <Route path="earnings" element={<VendorEarnings />} />
      <Route path="store" element={<VendorStore />} />
      <Route path="coupons" element={<VendorCoupons />} />
      <Route path="messages" element={<MessagesPage />} />
      <Route path="settings" element={<VendorSettings />} />
    </Route>

    {/* ADMIN */}
    <Route
      path="/admin"
      element={
        <ProtectedRoute roles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<AdminDashboard />} />
      <Route path="vendors" element={<AdminVendors />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="products" element={<AdminProducts />} />
      <Route path="orders" element={<AdminOrders />} />
      <Route path="categories" element={<AdminCategories />} />
      <Route path="analytics" element={<AdminAnalytics />} />
      <Route path="settings" element={<AdminSettings />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
