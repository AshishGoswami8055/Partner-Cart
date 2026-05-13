import {
  LayoutDashboard,
  Compass,
  ShoppingBag,
  Heart,
  ListOrdered,
  MessageCircle,
  UserCircle,
  Settings as SettingsIcon,
} from 'lucide-react';
import { DashboardShell } from './DashboardShell';

const items = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/browse', label: 'Browse', icon: Compass },
  { to: '/app/cart', label: 'Cart', icon: ShoppingBag },
  { to: '/app/orders', label: 'Orders', icon: ListOrdered },
  { to: '/app/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/app/messages', label: 'Messages', icon: MessageCircle },
  { to: '/app/profile', label: 'Profile', icon: UserCircle },
  { to: '/app/settings', label: 'Settings', icon: SettingsIcon },
];

export const CustomerLayout = () => (
  <DashboardShell navItems={items} brandLabel="Customer workspace" />
);
