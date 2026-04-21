import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (storedUser && storedUser !== 'undefined' && token) {
        setUser(JSON.parse(storedUser));
      } else {
        // Limpa dados corrompidos
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (e) {
      // Se JSON.parse falhar, limpa tudo
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, []);

  const login = async (email, senha) => {
    const { data } = await api.post('/auth/login', { email, senha });
    const userData = data.data; // backend retorna {success, data: {id,nome,email,role}, token}
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
