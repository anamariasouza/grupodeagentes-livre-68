
export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    language?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const defaultUserProfile: UserProfile = {
  id: 'user-default',
  name: 'Usuário',
  avatar: '/src/assets/default-user-avatar.png',
  bio: 'Olá! Sou um usuário do Chathy.',
  preferences: {
    theme: 'light',
    language: 'pt-BR'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};
