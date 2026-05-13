import {
  LayoutDashboard,
  Package,
  ListOrdered,
  Boxes,
  Wallet,
  MessageCircle,
  Store,
  Ticket,
  Settings as SettingsIcon,
} from 'lucide-react';
import { DashboardShell } from './DashboardShell';

const items = [
  { to: '/vendor', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/vendor/products', label: 'Products', icon: Package },
  { to: '/vendor/orders', label: 'Orders', icon: ListOrdered },
  { to: '/vendor/inventory', label: 'Inventory', icon: Boxes },
  { to: '/vendor/earnings', label: 'Earnings', icon: Wallet },
  { to: '/vendor/coupons', label: 'Coupons', icon: Ticket },
  { to: '/vendor/messages', label: 'Messages', icon: MessageCircle },
  { to: '/vendor/store', label: 'Store settings', icon: Store },
  { to: '/vendor/settings', label: 'Account', icon: SettingsIcon },
];

export const VendorLayout = () => (
  <DashboardShell navItems={items} brandLabel="Vendor workspace" />
);
