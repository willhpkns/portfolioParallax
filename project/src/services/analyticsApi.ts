const API_BASE_URL = 'http://localhost:5000/api';

export interface AnalyticsData {
  today: {
    total: number;
    unique: number;
  };
  monthly: {
    total: number;
    unique: number;
  };
  popularPages: Array<{
    _id: string;
    count: number;
  }>;
}

export interface DailyVisitors {
  date: string;
  total: number;
  unique: number;
}

export interface DeviceStats {
  browsers: Array<{ _id: string; count: number }>;
  operatingSystems: Array<{ _id: string; count: number }>;
  devices: {
    mobile: number;
    desktop: number;
  };
}

export interface LocationData {
  _id: string;
  cities: Array<{
    name: string;
    count: number;
    coordinates: {
      lat: number;
      lng: number;
    };
  }>;
  totalVisits: number;
}

class AnalyticsApiClass {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async fetchApi(endpoint: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      console.error('Analytics API Error:', {
        endpoint,
        status: response.status,
        error: errorData
      });
      throw new Error(errorData.message || 'Analytics API request failed');
    }

    return response.json();
  }

  async getOverview(): Promise<AnalyticsData> {
    try {
      return await this.fetchApi('/analytics/overview');
    } catch (error) {
      console.error('Error fetching analytics overview:', error);
      throw error;
    }
  }

  async getDailyVisitors(): Promise<DailyVisitors[]> {
    try {
      return await this.fetchApi('/analytics/daily');
    } catch (error) {
      console.error('Error fetching daily visitors:', error);
      throw error;
    }
  }

  async getDeviceStats(): Promise<DeviceStats> {
    try {
      return await this.fetchApi('/analytics/devices');
    } catch (error) {
      console.error('Error fetching device stats:', error);
      throw error;
    }
  }

  async getGeography(): Promise<LocationData[]> {
    try {
      return await this.fetchApi('/analytics/geography');
    } catch (error) {
      console.error('Error fetching geography data:', error);
      throw error;
    }
  }
}

export const analyticsApi = new AnalyticsApiClass();
