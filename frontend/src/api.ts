// API integration utilities
// This file prepares the project for future API integration
export interface ApiResponse<T> { // what types we want
  data: T | null;
  error: string | null;
  loading: boolean;
}
export interface Tournament {
  id: number;
  name: string;
  players: number; // Current players joined
  maxPlayers: number; // Max players allowed in the tournament
  status: 'Open' | 'In Progress' | 'Completed';
}
export interface User {
  id: number;
  alias: string;
}
// Base API URL - points to our PHP backend server
const API_BASE_URL = 'http://localhost:8000';
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
// API service functions - connected to real backend endpoints
export const apiService = {
  // User related endpoints
  users: {
    register: async (username: string, password: string): Promise<ApiResponse<any>> => {
      // Real API call to the PHP backend
      return fetchApi('/register.php', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
    },

    getProfile: async (): Promise<ApiResponse<User>> => {
      // This would need to be implemented in the backend
      // For now, return mock data
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
      // This would need to be implemented in the backend
      // For now, return mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: [
              { id: 1, name: 'Weekly Challenge', players: 5, maxPlayers: 8, status: 'Open' }, // Updated mock data
              { id: 2, name: 'Pro League', players: 12, maxPlayers: 16, status: 'In Progress' }, // Updated mock data
              { id: 3, name: 'Beginner Friendly', players: 3, maxPlayers: 4, status: 'Open' }, // Updated mock data
              { id: 4, name: 'Speed Ping', players: 8, maxPlayers: 8, status: 'Completed' } // Added a completed one
            ],
            error: null,
            loading: false
          });
        }, 1000);
      });
    },

    resetTournament: async (): Promise<ApiResponse<any>> => {
      // Real API call to the PHP backend
      return fetchApi('/tournament.php', {
        method: 'POST'
      });
    },

    join: async (tournamentId: number): Promise<ApiResponse<{ success: boolean }>> => {
      // This would need to be implemented in the backend
      // For now, return mock data
      console.log(`Attempting to join tournament with ID: ${tournamentId}`); // Debugging
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockSuccess = Math.random() > 0.1; // 90% success rate for mock
          if (mockSuccess) {
            resolve({
              data: { success: true },
              error: null,
              loading: false
            });
          } else {
            resolve({
              data: null,
              error: 'Failed to join tournament (mock error).',
              loading: false
            });
          }
        }, 800);
      });
    }
  }
};