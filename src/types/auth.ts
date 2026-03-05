
// Legacy types kept for compatibility - auth now uses Supabase
export interface AuthContextType {
  user: any;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, name: string, password: string) => Promise<any>;
  logout: () => void;
  isAuthenticated: boolean;
}

// No longer needed - kept for import compatibility
export const defaultUser = null;
