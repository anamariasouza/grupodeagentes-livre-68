
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType, defaultUser } from '@/types/auth';
import { UserProfile, defaultUserProfile } from '@/types/user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Inicializar usuário padrão se não existir
    const users = JSON.parse(localStorage.getItem('chathy-users') || '[]');
    if (users.length === 0) {
      localStorage.setItem('chathy-users', JSON.stringify([defaultUser]));
    }

    // Verificar se há uma sessão ativa e se ainda é válida (24h)
    const currentUser = localStorage.getItem('chathy-current-user');
    const sessionExpiry = localStorage.getItem('chathy-session-expiry');
    
    if (currentUser && sessionExpiry) {
      const now = new Date().getTime();
      const expiryTime = parseInt(sessionExpiry);
      
      if (now < expiryTime) {
        // Sessão ainda válida
        const userData = JSON.parse(currentUser);
        setUser(userData);
        syncUserProfile(userData);
      } else {
        // Sessão expirada, limpar
        localStorage.removeItem('chathy-current-user');
        localStorage.removeItem('chathy-session-expiry');
      }
    }
  }, []);

  const syncUserProfile = (userData: User) => {
    const userProfileKey = `${userData.id}-user-profile`;
    const existingProfile = JSON.parse(localStorage.getItem(userProfileKey) || 'null');
    
    // Se não há perfil ou o perfil não corresponde ao usuário logado, criar/atualizar
    if (!existingProfile || existingProfile.email !== userData.email) {
      const userProfile: UserProfile = {
        ...defaultUserProfile,
        id: userData.id,
        name: userData.name,
        email: userData.email,
        updatedAt: new Date()
      };
      localStorage.setItem(userProfileKey, JSON.stringify(userProfile));
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const users: User[] = JSON.parse(localStorage.getItem('chathy-users') || '[]');
    const foundUser = users.find(u => u.email === email && u.password === password && u.isActive);
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('chathy-current-user', JSON.stringify(foundUser));
      
      // Definir expiração da sessão para 24 horas
      const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
      localStorage.setItem('chathy-session-expiry', expiryTime.toString());
      
      syncUserProfile(foundUser);
      return true;
    }
    return false;
  };

  const register = async (email: string, name: string, password: string): Promise<boolean> => {
    const users: User[] = JSON.parse(localStorage.getItem('chathy-users') || '[]');
    
    // Verificar se o email já existe
    if (users.some(u => u.email === email)) {
      return false;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      password,
      createdAt: new Date(),
      isActive: true
    };

    users.push(newUser);
    localStorage.setItem('chathy-users', JSON.stringify(users));
    
    setUser(newUser);
    localStorage.setItem('chathy-current-user', JSON.stringify(newUser));
    
    // Definir expiração da sessão para 24 horas
    const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
    localStorage.setItem('chathy-session-expiry', expiryTime.toString());
    
    syncUserProfile(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('chathy-current-user');
    localStorage.removeItem('chathy-session-expiry');
    // Os dados específicos do usuário permanecem no localStorage para quando ele logar novamente
    // O novo hook useUserStorage irá carregar os dados corretos automaticamente
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
