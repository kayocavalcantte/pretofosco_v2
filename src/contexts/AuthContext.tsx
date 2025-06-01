import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export type UserRole = 'ADMIN' | 'CLIENTE' | 'FUNCIONARIO' | null;

interface AuthContextType {
  role: UserRole;
  isLoggedIn: boolean;
  userId: number | null;
  setRole: (role: UserRole) => void;
  setIsLoggedIn: (loggedIn: boolean) => void;
  setUserId: (id: number | null) => void;
  logout: (navigateTo?: string) => void;
  login: (token: string, userRole: UserRole, id: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    return localStorage.getItem('userRole') as UserRole | null;
  });

  const [isLoggedIn, setIsLoggedInState] = useState<boolean>(() => {
    return !!localStorage.getItem('token');
  });

  const [userId, setUserIdState] = useState<number | null>(() => {
    const storedUserId = localStorage.getItem('userId');
    return storedUserId ? parseInt(storedUserId, 10) : null;
  });

  const navigate = useNavigate();

  const login = (token: string, userRole: UserRole, id: number) => {
    localStorage.setItem('token', token);
    if (userRole) {
      localStorage.setItem('userRole', userRole);
    } else {
      localStorage.removeItem('userRole');
    }
    localStorage.setItem('userId', id.toString());
    setIsLoggedInState(true);
    setRoleState(userRole);
    setUserIdState(id);
  };

  const logout = (navigateTo: string = '/login') => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    setIsLoggedInState(false);
    setRoleState(null);
    setUserIdState(null);
    navigate(navigateTo);
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem('userRole', newRole);
    } else {
      localStorage.removeItem('userRole');
    }
  };

  const setIsLoggedIn = (loggedIn: boolean) => {
    setIsLoggedInState(loggedIn);
    if (!loggedIn) {
        logout();
    }
  };

  const setUserId = (newId: number | null) => {
    setUserIdState(newId);
    if (newId !== null) {
        localStorage.setItem('userId', newId.toString());
    } else {
        localStorage.removeItem('userId');
    }
  };

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token' && !event.newValue) {
        logout('/login');
      } else if (event.key === 'userRole') {
        setRoleState(event.newValue as UserRole | null);
      } else if (event.key === 'userId') {
        setUserIdState(event.newValue ? parseInt(event.newValue, 10) : null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [logout]);

  return (
    <AuthContext.Provider value={{
        role,
        isLoggedIn,
        userId,
        setRole,
        setIsLoggedIn,
        setUserId,
        logout,
        login
    }}>
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