import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  ListOrdered,
  BarChart3,
  Layers,
  Settings,
} from 'lucide-react';
import { DashboardShell } from './DashboardShell';

const items = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/vendors', label: 'Vendors', icon: Store },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ListOrdered },
  { to: '/admin/categories', label: 'Categories', icon: Layers },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export const AdminLayout = () => (
  <DashboardShell navItems={items} brandLabel="Admin console" />
);
