export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface Tournament {
  id: number;
  name: string;
  max_players: number;
  status: 'pending' | 'started' | 'completed';
  created_by: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  alias?: string;
}

export interface JoinTournamentRequest {
  playerAliases: string[];
  userId: number;
}

// Base API URL - update this to match your backend
const API_BASE_URL = 'http://localhost:8000'; 

// Generic fetch wrapper
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
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

// API services
export const apiService = {
  // User endpoints
  users: {
    //User registration 
    register: async (username: string, password: string, email: string): Promise<ApiResponse<{ userId: number }>> => {
      return fetchApi('/register', {
        method: 'POST',
        body: JSON.stringify({ username, password, email })
      });
    },

    //setting user alias 
    setAlias: async (userId: number, alias: string): Promise<ApiResponse<{ message: string; alias: string }>> => {
      return fetchApi('/set-alias', {
        method: 'POST',
        body: JSON.stringify({ userId, alias })
      });
    },

    // Login
    login: async (username: string, password: string): Promise<ApiResponse<{ userId: number; username: string }>> => {
      return fetchApi('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
    },

    // Get user profile
    getProfile: async (userId: number): Promise<ApiResponse<User>> => {
      return fetchApi(`/users/${userId}`, {
        method: 'GET'
      });
    }
  },

  // Tournament related endpoints
  tournaments: {
    // 3. Create tournament (4 or 8 players only)
    create: async (name: string, maxPlayers: 4 | 8, userId: number): Promise<ApiResponse<Tournament>> => {
      return fetchApi('/tournaments', {
        method: 'POST',
        body: JSON.stringify({ 
          name, 
          max_players: maxPlayers,
          created_by: userId 
        })
      });
    },

    // Get all tournaments
    getAll: async (): Promise<ApiResponse<Tournament[]>> => {
      return fetchApi('/tournaments', {
        method: 'GET'
      });
    },

    // Get specific tournament details
    getById: async (tournamentId: number): Promise<ApiResponse<{ tournament: Tournament; players: any[] }>> => {
      return fetchApi(`/tournaments/${tournamentId}`, {
        method: 'GET'
      });
    },

    // 4. Join tournament with multiple aliases (4/8)
    join: async (tournamentId: number, playerAliases: string[], userId: number): Promise<ApiResponse<{
      message: string;
      tournament_id: number;
      players: string[];
      status: string;
    }>> => {
      return fetchApi(`/tournaments/${tournamentId}/join`, {
        method: 'POST',
        body: JSON.stringify({ 
          playerAliases, 
          userId 
        })
      });
    },

    // Leave tournament
    leave: async (tournamentId: number, playerId: number): Promise<ApiResponse<{ message: string }>> => {
      return fetchApi(`/tournaments/${tournamentId}/leave`, {
        method: 'DELETE',
        body: JSON.stringify({ player_id: playerId })
      });
    }
  }
};