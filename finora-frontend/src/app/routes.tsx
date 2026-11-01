import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

const Landing = lazy(() => import('@/pages/landing'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const Dashboard = lazy(() => import('@/pages/dashboard'));
const Transactions = lazy(() => import('@/pages/transactions'));
const Analytics = lazy(() => import('@/pages/analytics'));
const Budgets = lazy(() => import('@/pages/budgets'));
const Investments = lazy(() => import('@/pages/investments'));
const Goals = lazy(() => import('@/pages/goals'));
const Subscriptions = lazy(() => import('@/pages/subscriptions'));
const Calendar = lazy(() => import('@/pages/calendar'));
const Assistant = lazy(() => import('@/pages/assistant'));
const Profile = lazy(() => import('@/pages/profile'));
const Settings = lazy(() => import('@/pages/settings'));
const Privacy = lazy(() => import('@/pages/privacy'));

export interface RouteDef {
  path: string;
  element: LazyExoticComponent<ComponentType>;
  /** Rendered inside AppShell (sidebar + topbar) vs. standalone (landing/auth) */
  layout: 'app' | 'bare';
  /** Label shown in the sidebar; omit to hide from nav */
  navLabel?: string;
  navIcon?: string;
}

export const routes: RouteDef[] = [
  { path: '/', element: Landing, layout: 'bare' },
  { path: '/privacy', element: Privacy, layout: 'bare' },
  { path: '/login', element: Login, layout: 'bare' },
  { path: '/register', element: Register, layout: 'bare' },
  { path: '/dashboard', element: Dashboard, layout: 'app', navLabel: 'Dashboard', navIcon: 'LayoutDashboard' },
  { path: '/transactions', element: Transactions, layout: 'app', navLabel: 'Transactions', navIcon: 'ArrowLeftRight' },
  { path: '/analytics', element: Analytics, layout: 'app', navLabel: 'Analytics', navIcon: 'PieChart' },
  { path: '/budgets', element: Budgets, layout: 'app', navLabel: 'Budgets', navIcon: 'Wallet' },
  { path: '/investments', element: Investments, layout: 'app', navLabel: 'Investments', navIcon: 'TrendingUp' },
  { path: '/goals', element: Goals, layout: 'app', navLabel: 'Goals', navIcon: 'Target' },
  { path: '/subscriptions', element: Subscriptions, layout: 'app', navLabel: 'Subscriptions', navIcon: 'RefreshCw' },
  { path: '/calendar', element: Calendar, layout: 'app', navLabel: 'Calendar', navIcon: 'Calendar' },
  { path: '/assistant', element: Assistant, layout: 'app', navLabel: 'Ask Finora', navIcon: 'Sparkles' },
  { path: '/profile', element: Profile, layout: 'app', navLabel: 'Profile', navIcon: 'User' },
  { path: '/settings', element: Settings, layout: 'app', navLabel: 'Settings', navIcon: 'Settings' },
];
