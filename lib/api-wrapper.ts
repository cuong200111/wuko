// API wrapper with automatic error handling
import { Domain } from "@/config";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  status?: number;
}

// Generic API wrapper with error handling
export async function apiCall<T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {

    const url =  `${Domain}${endpoint}`;
    let headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    // Check for token in localStorage (browser only)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers = {
          ...headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }
  
    const defaultOptions: RequestInit = {
      ...options,
      headers,
    };

   
    
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      ...data,
      status: response.status,
    };
  } catch (error: any) {
    console.error(`❌ API Error for ${endpoint}:`, error);
    
    return {
      success: false,
      message: error.message || 'Network error occurred',
      status: error.status || 500,
    };
  }
}

// Specific API wrappers that work properly
export const apiWrappers = {
  // Categories API
  categories: {
    getAll: (params: Record<string, any> = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      return apiCall(`/api/categories?${searchParams}`);
    },
    
    getById: (id: number) => apiCall(`/api/categories/${id}`),
    
    create: (data: any) => apiCall('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    update: (id: number, data: any) => {
      
    
      return apiCall(`/api/categories/${id}`, {
      method: 'PUT', 
      body: JSON.stringify(data),
    })},
    
    delete: (id: number) => apiCall(`/api/categories/${id}`, {
      method: 'DELETE',
    }),
  },

  // Products API  
  products: {
    getAll: (params: Record<string, any> = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      return apiCall(`/api/products?${searchParams}`);
    },
    
    getById: (id: number) => apiCall(`/api/products/${id}`),
    
    create: (data: any) => apiCall('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    update: (id: number, data: any) => apiCall(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data), 
    }),
    
    delete: (id: number) => apiCall(`/api/products/${id}`, {
      method: 'DELETE',
    }),
  },

  // Users API
  users: {
    getAll: (params: Record<string, any> = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      return apiCall(`/api/users?${searchParams}`);
    },
    
    getById: (id: number) => apiCall(`/api/users/${id}`),
    
    create: (data: any) => apiCall('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
    update: (id: number, data: any) => apiCall(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
    delete: (id: number) => apiCall(`/api/users/${id}`, {
      method: 'DELETE',
    }),
  },

  // Auth API
  auth: {
    login: (email: string, password: string) => apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
    
    register: (data: any) => apiCall('/api/auth/register', {
      method: 'POST', 
      body: JSON.stringify(data),
    }),
    
    getProfile: () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      return apiCall('/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    
    createAdmin: () => apiCall('/api/auth/create-admin', {
      method: 'POST',
    }),
  },

  // Media API (if exists)
  media: {
    getAll: (params: Record<string, any> = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      return apiCall(`/api/media?${searchParams}`);
    },
    
    upload: async (file: File, entityType: string = 'general') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entity_type', entityType);
      
      // Use fetch directly for file upload to avoid forcing JSON headers
      const url = `${Domain}/api/media`;
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      try {
        const response = await fetch(url, {
          method: 'POST',
          body: formData,
          headers, // Do not set 'Content-Type' for FormData
        });
        const data = await response.json();
        return {
          ...data,
          status: response.status,
        };
      } catch (error: any) {
        return {
          success: false,
          message: error.message || 'Network error occurred',
          status: error.status || 500,
        };
      }
    },
    
    update: (id: number, data: any) => apiCall(`/api/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
    delete: (id: number) => apiCall(`/api/media/${id}`, {
      method: 'DELETE',
    }),
  },
};
