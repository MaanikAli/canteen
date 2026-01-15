import { NotificationItem } from '../components/NotificationCenter';

class NotificationService {
  private notifications: NotificationItem[] = [];
  private listeners: ((notifications: NotificationItem[]) => void)[] = [];
  private audioContext: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private browserNotificationsEnabled: boolean = false;

  constructor() {
    this.loadFromStorage();
    this.initializeAudio();
    this.requestNotificationPermission();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        this.notifications = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load notifications from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to save notifications to storage:', error);
    }
  }

  private initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context not supported');
    }
  }

  private async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.browserNotificationsEnabled = permission === 'granted';
    }
  }

  private playNotificationSound() {
    if (!this.soundEnabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  private showBrowserNotification(notification: NotificationItem) {
    if (!this.browserNotificationsEnabled) return;

    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
        badge: '/logo.png',
        tag: notification.id,
        requireInteraction: notification.persistent || false
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notification.actionUrl) {
          window.location.href = notification.actionUrl;
        }
        browserNotification.close();
      };

      // Auto-close after 5 seconds unless persistent
      if (!notification.persistent) {
        setTimeout(() => browserNotification.close(), 5000);
      }
    } catch (error) {
      console.warn('Failed to show browser notification:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Public API
  addNotification(notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) {
    const newNotification: NotificationItem = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };

    this.notifications.unshift(newNotification); // Add to beginning

    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.saveToStorage();
    this.notifyListeners();

    // Play sound and show browser notification
    if (notification.sound !== false) {
      this.playNotificationSound();
    }
    this.showBrowserNotification(newNotification);

    return newNotification.id;
  }

  markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      notification.read = true;
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  markAllAsRead() {
    let hasChanges = false;
    this.notifications.forEach(n => {
      if (!n.read) {
        n.read = true;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  deleteNotification(id: string) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  clearAll() {
    this.notifications = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  getNotifications(): NotificationItem[] {
    return [...this.notifications];
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  subscribe(listener: (notifications: NotificationItem[]) => void) {
    this.listeners.push(listener);
    // Immediately call with current notifications
    listener([...this.notifications]);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Settings
  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    localStorage.setItem('notificationSoundEnabled', enabled.toString());
  }

  setBrowserNotificationsEnabled(enabled: boolean) {
    this.browserNotificationsEnabled = enabled;
    localStorage.setItem('browserNotificationsEnabled', enabled.toString());
  }

  getSettings() {
    return {
      soundEnabled: this.soundEnabled,
      browserNotificationsEnabled: this.browserNotificationsEnabled
    };
  }

  // Convenience methods for common notifications
  notifyOrderUpdate(orderId: string, status: string, userName: string, userId: string, currentUserId?: string) {
    const statusMessages = {
      'Pending': 'Your order has been received and is pending processing.',
      'Preparing': 'Your order is now being prepared by our kitchen staff.',
      'Ready for Pickup': 'Your order is ready for pickup! Please show your OTP to collect.',
      'Completed': 'Your order has been completed successfully.'
    };

    const titles = {
      'Pending': 'Order Received',
      'Preparing': 'Order Being Prepared',
      'Ready for Pickup': 'Order Ready for Pickup',
      'Completed': 'Order Completed'
    };

    // Only notify the user who owns the order
    if (currentUserId && userId === currentUserId) {
      this.addNotification({
        title: titles[status as keyof typeof titles] || 'Order Update',
        message: statusMessages[status as keyof typeof statusMessages] || `Your order status has been updated to ${status}`,
        type: status === 'Ready for Pickup' ? 'order' : 'info',
        actionUrl: '/orders',
        actionText: 'View Order',
        sound: true,
        persistent: status === 'Ready for Pickup'
      });
    }
  }

  notifyNewOrder(userName: string, currentUserRole?: string) {
    // Notify admin and kitchen staff
    if (currentUserRole === 'admin' || currentUserRole === 'kitchen') {
      this.addNotification({
        title: 'New Order Received',
        message: `A new order has been placed by ${userName}`,
        type: 'order',
        actionUrl: currentUserRole === 'admin' ? '/admin' : '/kitchen',
        actionText: 'View Orders',
        sound: true
      });
    }
  }

  notifySystemMessage(title: string, message: string, type: 'info' | 'warning' | 'error' = 'info') {
    this.addNotification({
      title,
      message,
      type: type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'system',
      sound: type === 'error',
      persistent: type === 'error'
    });
  }

  notifySuccess(title: string, message: string) {
    this.addNotification({
      title,
      message,
      type: 'success',
      sound: true
    });
  }
}

export const notificationService = new NotificationService();
