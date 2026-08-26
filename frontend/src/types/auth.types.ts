export interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userId: number) => Promise<void>;
  logout: () => void;
}
