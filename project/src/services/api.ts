const API_BASE_URL = 'http://localhost:5000/api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
  };
}

// Authentication API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    return response.json();
  },

  verifyToken: async (token: string): Promise<{ user: { id: string; username: string } }> => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Invalid token');
    }

    return response.json();
  },
};

// Content API base class
export class ContentApi {
  protected token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  protected async fetchApi(endpoint: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}/content${endpoint}`, {
      ...options,
      headers,
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

// Specific content APIs
export const aboutApi = new class extends ContentApi {
  async get() {
    return this.fetchApi('/about');
  }

  async update(data: {
    name: string;
    position: string;
    description: string[];
    profileImage: string;
  }) {
    return this.fetchApi('/about', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};

export const projectApi = new class extends ContentApi {
  async getAll() {
    return this.fetchApi('/projects');
  }

  async create(project: any) {
    return this.fetchApi('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async update(id: string, project: any) {
    return this.fetchApi(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  }

  async delete(id: string) {
    return this.fetchApi(`/projects/${id}`, {
      method: 'DELETE',
    });
  }
};

export const educationApi = new class extends ContentApi {
  async getAll() {
    return this.fetchApi('/education');
  }

  async create(education: any) {
    return this.fetchApi('/education', {
      method: 'POST',
      body: JSON.stringify(education),
    });
  }

  async update(id: string, education: any) {
    return this.fetchApi(`/education/${id}`, {
      method: 'PUT',
      body: JSON.stringify(education),
    });
  }

  async delete(id: string) {
    return this.fetchApi(`/education/${id}`, {
      method: 'DELETE',
    });
  }

  async reorder(items: any[]) {
    return this.fetchApi('/education/reorder', {
      method: 'PUT',
      body: JSON.stringify({ items }),
    });
  }

  async updateOrder(items: any[]) {
    const response = await fetch(`${API_BASE_URL}/education/order`, {
      method: 'PUT',
      body: JSON.stringify(items),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }
};

export const experienceApi = new class extends ContentApi {
  async getAll() {
    return this.fetchApi('/experience');
  }

  async create(experience: any) {
    return this.fetchApi('/experience', {
      method: 'POST',
      body: JSON.stringify(experience),
    });
  }

  async update(id: string, experience: any) {
    return this.fetchApi(`/experience/${id}`, {
      method: 'PUT',
      body: JSON.stringify(experience),
    });
  }

  async delete(id: string) {
    return this.fetchApi(`/experience/${id}`, {
      method: 'DELETE',
    });
  }

  async reorder(items: any[]) {
    return this.fetchApi('/experience/reorder', {
      method: 'PUT',
      body: JSON.stringify({ items }),
    });
  }

  async updateOrder(items: any[]) {
    const response = await fetch(`${API_BASE_URL}/experience/order`, {
      method: 'PUT',
      body: JSON.stringify(items),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }
};

export interface SkillItem {
  name: string;
  level: number;
}

export interface Skill {
  _id: string;
  category: string;
  items: SkillItem[];
  order?: number;
}

export const skillsApi = new class extends ContentApi {
  async getAll(): Promise<Skill[]> {
    return this.fetchApi('/skills');
  }

  async create(skills: Omit<Skill, '_id'>): Promise<Skill> {
    return this.fetchApi('/skills', {
      method: 'POST',
      body: JSON.stringify(skills),
    });
  }

  async update(id: string, skills: Omit<Skill, '_id'>): Promise<Skill> {
    return this.fetchApi(`/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(skills),
    });
  }

  async delete(id: string) {
    return this.fetchApi(`/skills/${id}`, {
      method: 'DELETE',
    });
  }

  async reorder(items: Skill[]): Promise<Skill[]> {
    return this.fetchApi('/skills/reorder', {
      method: 'PUT',
      body: JSON.stringify({ items }),
    });
  }

  async updateOrder(items: any[]) {
    const response = await fetch(`${API_BASE_URL}/skills/order`, {
      method: 'PUT',
      body: JSON.stringify(items),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }
};

export type ResumeSectionType = 'education' | 'experience' | 'skills';

export const settingsApi = new class extends ContentApi {
  async getResumeOrder(): Promise<ResumeSectionType[]> {
    const response = await this.fetchApi('/settings/resume-order');
    return response.order;
  }

  async updateResumeOrder(order: ResumeSectionType[]) {
    return this.fetchApi('/settings/resume-order', {
      method: 'POST',
      body: JSON.stringify({ order }),
    });
  }
};
