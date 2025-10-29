const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async register(data: { email: string; password: string; name?: string }) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile() {
    return this.request('/api/auth/profile');
  }

  // Currency endpoints
  async getCurrencies() {
    return this.request('/api/currencies');
  }

  async getExchangeRates() {
    return this.request('/api/exchange-rates');
  }

  async createCurrency(data: { code: string; name: string; symbol: string }) {
    return this.request('/api/currencies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExchangeRate(data: { baseCurrencyId: string; targetCurrencyId: string; rate: number }) {
    return this.request('/api/exchange-rates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Transaction endpoints
  async createTransaction(data: { fromCurrencyId: string; toCurrencyId: string; fromAmount: number }) {
    return this.request('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransactions() {
    return this.request('/api/transactions');
  }

  async getTransaction(id: string) {
    return this.request(`/api/transactions/${id}`);
  }

  async updateTransactionStatus(id: string, status: string) {
    return this.request(`/api/transactions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getWallets() {
    return this.request('/api/wallets');
  }
}

export const apiClient = new ApiClient();
