import { API_BASE_URL } from './api';

export interface Ingredient {
  name: string;
  metric: {
    amount: number;
    unit: string;
  };
  imperial: {
    amount: number;
    unit: string;
  };
}

export interface Recipe {
  _id: string;
  title: string;
  description: string;
  photos: string[];
  ingredients: Ingredient[];
  instructions: string[];
  rating: number;
  review: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'dessert' | 'snack' | 'drink' | 'appetizer' | 'side' | 'other';
  cookingTime: {
    prep: number;
    cook: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RecipeFilters {
  search?: string;
  category?: string;
  difficulty?: string;
  minRating?: number;
  maxCookingTime?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface RecipeListResponse {
  recipes: Recipe[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export type RecipeInput = Omit<Recipe, '_id' | 'createdAt' | 'updatedAt'>;

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const recipeApi = {
  // Get all recipes with filters (public)
  getRecipes: async (filters: RecipeFilters = {}): Promise<RecipeListResponse> => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.minRating) params.append('minRating', filters.minRating.toString());
    if (filters.maxCookingTime) params.append('maxCookingTime', filters.maxCookingTime.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.order) params.append('order', filters.order);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await fetch(`${API_BASE_URL}/recipes?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch recipes');
    }
    
    return response.json();
  },

  // Get single recipe (public)
  getRecipe: async (id: string): Promise<Recipe> => {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch recipe');
    }
    
    return response.json();
  },

  // Create recipe (admin)
  createRecipe: async (recipe: Partial<RecipeInput>): Promise<Recipe> => {
    const response = await fetch(`${API_BASE_URL}/recipes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(recipe),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create recipe');
    }
    
    return response.json();
  },

  // Update recipe (admin)
  updateRecipe: async (id: string, recipe: Partial<RecipeInput>): Promise<Recipe> => {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(recipe),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update recipe');
    }
    
    return response.json();
  },

  // Delete recipe (admin)
  deleteRecipe: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/recipes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete recipe');
    }
  },

  // Upload photos (admin)
  uploadPhotos: async (recipeId: string, files: File[]): Promise<{ photos: string[]; recipe: Recipe }> => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('photos', file);
    });

    const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/photos`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload photos');
    }
    
    return response.json();
  },

  // Delete photo (admin)
  deletePhoto: async (recipeId: string, photoIndex: number): Promise<Recipe> => {
    const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/photos/${photoIndex}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete photo');
    }
    
    const result = await response.json();
    return result.recipe;
  },

  // Get categories
  getCategories: async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/recipes/meta/categories`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    return response.json();
  },
};

// Helper functions
export const formatCookingTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const getTotalCookingTime = (recipe: Recipe): number => {
  return recipe.cookingTime.prep + recipe.cookingTime.cook;
};

export const getDifficultyColor = (difficulty: Recipe['difficulty']): string => {
  switch (difficulty) {
    case 'easy': return 'text-green-600 bg-green-100';
    case 'medium': return 'text-yellow-600 bg-yellow-100';
    case 'hard': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const getCategoryLabel = (category: Recipe['category']): string => {
  const labels: Record<Recipe['category'], string> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    dessert: 'Dessert',
    snack: 'Snack',
    drink: 'Drink',
    appetizer: 'Appetizer',
    side: 'Side Dish',
    other: 'Other',
  };
  return labels[category] || category;
};
