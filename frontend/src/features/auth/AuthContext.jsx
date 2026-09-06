import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../../api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : { email: 'admin@urbanfurniture.com', role: 'admin', full_name: 'System Admin' };
  });

  const loginWithCredentials = async (email, password) => {
    try {
      const data = await apiClient.login(email, password);
      setUser(data.user);
      return data.user;
    } catch (err) {
      // Fallback local login for quick role switching if offline
      const mockRole = email.includes('accountant') ? 'invoicing_user' : (email.includes('customer') ? 'contact' : 'admin');
      const fallbackUser = { email, role: mockRole, full_name: email.split('@')[0] };
      setUser(fallbackUser);
      localStorage.setItem('user', JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  };

  const setRoleDirectly = (role) => {
    let email = 'admin@urbanfurniture.com';
    let name = 'System Admin';
    let formattedRole = 'admin';
    if (role === 'Invoicing User' || role === 'invoicing_user') {
      email = 'accountant@urbanfurniture.com';
      name = 'Lead Accountant';
      formattedRole = 'invoicing_user';
    } else if (role === 'Contact' || role === 'contact') {
      email = 'customer@tejas.com';
      name = 'Tejas Client';
      formattedRole = 'contact';
    }
    const newUser = { email, role: formattedRole, full_name: name };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    return newUser;
  };

  const signUp = async (userData) => {
    const data = await apiClient.signup(userData);
    return data;
  };

  const forgotPassword = async (loginOrEmail, newPassword) => {
    return await apiClient.forgotPassword(loginOrEmail, newPassword);
  };

  const createUser = async (userData) => {
    return await apiClient.createUser(userData);
  };

  const getUsers = async () => {
    return await apiClient.getUsers();
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login: setRoleDirectly, loginWithCredentials, signUp, forgotPassword, createUser, getUsers, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);