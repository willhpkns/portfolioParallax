import { API_BASE_URL } from './api';

// Base class for pixel-related API calls
class BasePixelApi {
  protected token: string | null = null;

  setToken(token: string | null) {
    console.log('Setting token in pixelApi:', token);
    this.token = token;
  }

  protected async fetchApi(endpoint: string, options: RequestInit = {}) {
    console.log('fetchApi called with token:', this.token);
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}/pixels${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 401) {
        throw new Error(errorData.message || 'No authentication token, access denied');
      }
      throw new Error(errorData.error || errorData.message || 'API request failed');
    }

    return response.json();
  }
}

export interface PixelBoardSettings {
  rateLimit: number;
  boardSize: number;
  enabled: boolean;
  maintenanceMessage?: string;
}

export interface TimelapseState {
  pixel: Pixel;
  timestamp: Date;
  fullState: Pixel[];
}

export interface TimelapseData {
  totalPixels: number;
  states: TimelapseState[];
}

export interface Pixel {
  x: number;
  y: number;
  color: string;
  timestamp?: Date;
}

export interface PixelHistoryEntry extends Pixel {
  userId?: string;
  ipAddress: string;
  createdAt: Date;
}

export interface PixelStats {
  totalPixels: number;
  mostActiveHours: {
    _id: {
      year: number;
      month: number;
      day: number;
      hour: number;
    };
    count: number;
  }[];
  colorStats: {
    _id: string;
    count: number;
  }[];
}

export interface PixelHistoryResponse {
  history: PixelHistoryEntry[];
  total: number;
  pages: number;
  currentPage: number;
}

export const pixelApi = new class extends BasePixelApi {
  // Board state endpoints
  async getBoard(): Promise<Pixel[]> {
    return this.fetchApi('');
  }

  async updatePixel(x: number, y: number, color: string): Promise<void> {
    return this.fetchApi('', {
      method: 'POST',
      body: JSON.stringify({ x, y, color }),
    });
  }

  // Public endpoints
  async getPublicSettings(): Promise<Omit<PixelBoardSettings, 'enabled'>> {
    return this.fetchApi('/public-settings');
  }

  // Admin endpoints
  async getSettings(): Promise<PixelBoardSettings> {
    return this.fetchApi('/settings');
  }

  async updateSettings(settings: Partial<PixelBoardSettings>): Promise<PixelBoardSettings> {
    return this.fetchApi('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getHistory(page: number = 1, limit: number = 100, startDate?: Date, endDate?: Date): Promise<PixelHistoryResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(startDate && { startDate: startDate.toISOString() }),
      ...(endDate && { endDate: endDate.toISOString() }),
    });
    
    return this.fetchApi(`/history?${params}`);
  }

  async getTimelapse(): Promise<TimelapseData> {
    return this.fetchApi('/history/timelapse');
  }

  async getStats(): Promise<PixelStats> {
    return this.fetchApi('/stats');
  }
};
