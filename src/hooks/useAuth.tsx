
import { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { getCurrentUser, setCurrentUser, logout as logoutStorage } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      // Migração automática: converter ID antigo do secretário para UUID válido
      if (currentUser.id === 'secretary-1' && currentUser.type === 'secretario') {
        const updatedUser = {
          ...currentUser,
          id: crypto.randomUUID()
        };
        setCurrentUser(updatedUser);
        setUser(updatedUser);
        console.log('🔄 Migração automática: ID do secretário atualizado para UUID válido');
      } else {
        setUser(currentUser);
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setCurrentUser(userData);
  };

  const logout = () => {
    setUser(null);
    logoutStorage();
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
