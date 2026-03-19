import { create } from 'zustand';
import type { Notification } from '@/types';
import { mockNotifications } from '@/data/mock-data';

// ─────────────────────────────────────────────────────────────────────────────
// Toast shape
// ─────────────────────────────────────────────────────────────────────────────

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Store interface
// ─────────────────────────────────────────────────────────────────────────────

interface UIStore {
  sidebarCollapsed: boolean;
  activePage: string;
  notifications: Notification[];
  toasts: Toast[];

  // Sidebar
  toggleSidebar: () => void;

  // Navigation
  setActivePage: (page: string) => void;

  // Notifications
  addNotification: (notification: Notification) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllRead: () => void;

  // Toasts
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (toastId: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

let _toastCounter = 0;

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  activePage: 'dashboard',
  notifications: mockNotifications,
  toasts: [],

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setActivePage: (page) => set({ activePage: page }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),

  markNotificationRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n,
      ),
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  addToast: (toast) => {
    const id = `toast-${++_toastCounter}-${Date.now()}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
  },

  removeToast: (toastId) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== toastId),
    })),
}));
