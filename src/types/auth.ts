
export interface User {
  id: string;
  email: string;
  name: string;
  password: string; // Array de números como string
  createdAt: Date;
  isActive: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const defaultUser: User = {
  id: 'default-admin',
  email: 'walter@ledmkt.com',
  name: 'Walter Admin',
  password: '976431', // Números concatenados para facilitar comparação
  createdAt: new Date(),
  isActive: true
};
