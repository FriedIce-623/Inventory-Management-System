import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, getAuthToken } from '../services/api';
import { ShopOut, ShopRegister } from '../services/types';

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  shop: ShopOut | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: ShopRegister) => Promise<void>;
  logout: () => Promise<void>;
  refreshShop: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    shop: null,
  });

  const refreshShop = useCallback(async () => {
    try {
      const shop = await authAPI.getMe();
      setState({ isLoading: false, isAuthenticated: true, shop });
    } catch {
      setState({ isLoading: false, isAuthenticated: false, shop: null });
    }
  }, []);

  useEffect(() => {
    (async () => {
      const token = await getAuthToken();
      if (token) {
        await refreshShop();
      } else {
        setState({ isLoading: false, isAuthenticated: false, shop: null });
      }
    })();
  }, [refreshShop]);

  const login = async (email: string, password: string) => {
    await authAPI.login(email, password);
    await refreshShop();
  };

  const register = async (data: ShopRegister) => {
    await authAPI.register(data);
    // Auto-login after registration
    await authAPI.login(data.email, data.password);
    await refreshShop();
  };

  const logout = async () => {
    await authAPI.logout();
    setState({ isLoading: false, isAuthenticated: false, shop: null });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshShop }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
