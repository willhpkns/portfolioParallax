// Auth interceptor for automatic token refresh
class AuthInterceptor {
  private static instance: AuthInterceptor;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  static getInstance(): AuthInterceptor {
    if (!AuthInterceptor.instance) {
      AuthInterceptor.instance = new AuthInterceptor();
    }
    return AuthInterceptor.instance;
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  private async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      // Update stored tokens
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      return data.token;
    } catch (error) {
      // Clear invalid tokens
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      // Redirect to login
      window.location.href = '/admin';
      
      throw error;
    }
  }

  async interceptRequest(url: string, config: RequestInit = {}): Promise<Response> {
    const token = localStorage.getItem('token');
    
    // Add auth header if token exists
    if (token) {
      const headers = new Headers(config.headers);
      if (!headers.get('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
        config.headers = headers;
      }
    }

    try {
      const response = await fetch(url, config);
      
      // If unauthorized and we have a refresh token, try to refresh
      if (response.status === 401 && token) {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken && !this.isRefreshing) {
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((newToken) => {
              const headers = new Headers(config.headers);
              headers.set('Authorization', `Bearer ${newToken}`);
              config.headers = headers;
              return fetch(url, config);
            });
          }

          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            this.processQueue(null, newToken);
            
            // Retry original request with new token
            const headers = new Headers(config.headers);
            headers.set('Authorization', `Bearer ${newToken}`);
            config.headers = headers;
            
            return fetch(url, config);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            throw refreshError;
          } finally {
            this.isRefreshing = false;
          }
        }
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default AuthInterceptor.getInstance();
