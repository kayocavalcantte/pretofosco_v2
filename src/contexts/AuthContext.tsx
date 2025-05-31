import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type UserRole = 'admin' | 'user' | null;

interface AuthContextType {
  role: UserRole;
  isLoggedIn: boolean;
  setRole: (role: UserRole) => void;
  setIsLoggedIn: (loggedIn: boolean) => void;
  logout: (navigateTo?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    return localStorage.getItem('userRole') as UserRole | null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!localStorage.getItem('token');
  });

  const navigate = useNavigate();

  const logout = (navigateTo: string = '/login') => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setRole(null);
    setIsLoggedIn(false);
    navigate(navigateTo);
  };

  return (
    <AuthContext.Provider value={{ role, isLoggedIn, setRole, setIsLoggedIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
