import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import AuthService from '@/services/auth';

import LoginPage from '@/views/auth/LoginPage.vue';
import RegisterPage from '@/views/auth/RegisterPage.vue';
import HomePage from '@/views/HomePage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/order'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { guest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { guest: true }
  },
  {
    path: '/home',
    name: 'Home',
    component: HomePage,
    meta: { requiresAuth: true }
  },
  // ── Guest Order Routes (no auth) ──
  {
    path: '/order',
    name: 'GuestLanding',
    component: () => import('@/views/customer/GuestLanding.vue')
  },
  {
    path: '/order/menu',
    name: 'CustomerMenu',
    component: () => import('@/views/customer/CustomerDashboard.vue')
  },
  {
    path: '/order/pending/:id',
    name: 'OrderPending',
    component: () => import('@/views/customer/OrderPending.vue')
  },
  // ── Admin Routes ──
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/AdminDashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/menus',
    name: 'MenuManagement',
    component: () => import('@/views/admin/MenuManagement.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/categories',
    name: 'CategoryManagement',
    component: () => import('@/views/admin/CategoryManagement.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'UserManagement',
    component: () => import('@/views/admin/UserManagement.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/reports',
    name: 'FinancialReport',
    component: () => import('@/views/admin/FinancialReport.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  // ── Kasir Routes ──
  {
    path: '/kasir',
    name: 'KasirDashboard',
    component: () => import('@/views/kasir/KasirDashboard.vue'),
    meta: { requiresAuth: true }
  },
  // ── Chef Routes ──
  {
    path: '/chef',
    name: 'ChefDashboard',
    component: () => import('@/views/chef/ChefDashboard.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = AuthService.isAuthenticated();

  // Helper: get dashboard path based on user role
  function getRoleDashboard(): string {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const role = user.role ? user.role.toLowerCase() : '';
        if (['admin', 'owner'].includes(role)) return '/admin';
        if (role === 'kasir') return '/kasir';
        if (role === 'chef') return '/chef';
      }
    } catch { }
    return '/home';
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.meta.guest && isAuthenticated) {
    next(getRoleDashboard());
  } else if (to.meta.requiresAdmin) {
    // Only admin/owner can access admin pages
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const role = user.role ? user.role.toLowerCase() : '';
        if (['admin', 'owner'].includes(role)) {
          next();
        } else {
          next(getRoleDashboard());
        }
      } catch {
        next(getRoleDashboard());
      }
    } else {
      next('/login');
    }
  } else {
    next();
  }
});

export default router;
