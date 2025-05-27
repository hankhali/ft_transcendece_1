// API integration utilities
// This file prepares the project for future API integration

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface Tournament {
  id: number;
  name: string;
  players: number;
  status: 'Open' | 'In Progress' | 'Completed';
}

export interface User {
  id: number;
  alias: string;
}

// Base API URL - would be replaced with actual backend URL in production
const API_BASE_URL = '/api';

// Generic fetch wrapper with typing and error handling
export async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      data,
      error: null,
      loading: false
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      loading: false
    };
  }
}

// API service functions - these would connect to real endpoints in production
export const apiService = {
  // User related endpoints
  users: {
    register: async (alias: string): Promise<ApiResponse<User>> => {
      // This would be a real API call in production
      // For now, simulate network delay and return mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: { id: 1, alias },
            error: null,
            loading: false
          });
        }, 800);
      });
    },
    
    getProfile: async (): Promise<ApiResponse<User>> => {
      // Simulated API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: { id: 1, alias: 'Player1' },
            error: null,
            loading: false
          });
        }, 600);
      });
    }
  },
  
  // Tournament related endpoints
  tournaments: {
    getAll: async (): Promise<ApiResponse<Tournament[]>> => {
      // Simulated API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: [
              { id: 1, name: 'Weekly Challenge', players: 8, status: 'Open' },
              { id: 2, name: 'Pro League', players: 16, status: 'In Progress' },
              { id: 3, name: 'Beginner Friendly', players: 4, status: 'Open' }
            ],
            error: null,
            loading: false
          });
        }, 1000);
      });
    },
    
    join: async (tournamentId: number): Promise<ApiResponse<{ success: boolean }>> => {
      // Simulated API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: { success: true },
            error: null,
            loading: false
          });
        }, 800);
      });
    }
  }
};
