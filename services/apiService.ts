const API_BASE_URL = 'https://canteendb-v6gg.onrender.com/api';

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('authToken');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.token}`,
      };
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // User API
  async login(email: string, password: string) {
    const response = await this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async register(userData: { email: string; password: string; role: string; name: string; studentId?: string }) {
    const response = await this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async getUsers() {
    const users = await this.request('/users');
    return users.map((user: any) => ({
      ...user,
      id: user._id || user.id
    }));
  }

  async updateUser(userId: string, userData: { name: string; email: string; password?: string }) {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Menu API
  async getMenu() {
    const items = await this.request('/menu');
    return items.map((item: any) => ({
      ...item,
      id: item._id || item.id
    }));
  }

  async getMenuItems() {
    const items = await this.request('/menu');
    return items.map((item: any) => ({
      ...item,
      id: item._id || item.id
    }));
  }

  async createMenuItem(menuItem: any) {
    const { id, ...itemData } = menuItem; // Exclude id for creation
    const response = await this.request('/menu', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
    return {
      ...response,
      id: response._id || response.id
    };
  }

  async updateMenuItem(id: string, menuItem: any) {
    const response = await this.request(`/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(menuItem),
    });
    return {
      ...response,
      id: response._id || response.id
    };
  }

  async deleteMenuItem(id: string) {
    return this.request(`/menu/${id}`, {
      method: 'DELETE',
    });
  }

  // Order API
  async getOrders() {
    const orders = await this.request('/orders');
    return orders.map((order: any) => ({
      ...order,
      id: order._id || order.id
    }));
  }

  async createOrder(order: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteOrder(orderId: string) {
    return this.request(`/orders/${orderId}`, {
      method: 'DELETE',
    });
  }

  // Settings API
  async getSettings() {
    return this.request('/settings');
  }

  async updateSettings(settingsData: { canteenName?: string; logo?: File }) {
    const formData = new FormData();
    if (settingsData.canteenName) {
      formData.append('canteenName', settingsData.canteenName);
    }
    if (settingsData.logo) {
      formData.append('logo', settingsData.logo);
    }

    const config: RequestInit = {
      method: 'PUT',
      body: formData,
    };

    if (this.token) {
      config.headers = {
        Authorization: `Bearer ${this.token}`,
      };
    }

    const response = await fetch(`${API_BASE_URL}/settings`, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }
}

export const apiService = new ApiService();
