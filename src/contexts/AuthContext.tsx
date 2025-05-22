// src/contexts/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type UserRole = 'admin' | 'user' | null;

interface AuthContextType {
  role: UserRole;
  login: (role: 'admin' | 'user', navigateTo?: string) => void;
  logout: (navigateTo?: string) => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    // Tenta pegar o papel do localStorage para persistência simples na sessão
    return localStorage.getItem('userRole') as UserRole | null;
  });
  const navigate = useNavigate(); // Mova useNavigate para dentro do escopo do Provider se precisar aqui

  const login = (newRole: 'admin' | 'user', navigateTo?: string) => {
    localStorage.setItem('userRole', newRole);
    setRole(newRole);
    if (navigateTo) {
      navigate(navigateTo);
    }
  };

  const logout = (navigateTo: string = '/login') => {
    localStorage.removeItem('userRole');
    setRole(null);
    navigate(navigateTo);
  };

  const isLoggedIn = role !== null;

  return (
    <AuthContext.Provider value={{ role, login, logout, isLoggedIn }}>
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