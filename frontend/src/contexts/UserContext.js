import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verify token and load user on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          apiService.setToken(token);
          const response = await apiService.verifyToken();
          if (response.success) {
            setUser(response.data.user);
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          // Token is invalid, remove it
          localStorage.removeItem('auth_token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await apiService.login(credentials);
      if (response.success) {
        setUser(response.data.user);
        setLoading(false);
        return { success: true, user: response.data.user };
      } else {
        setLoading(false);
        return { success: false, error: response.message || 'Login failed' };
      }
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message || 'Network error' };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      // Transform frontend data to backend format
      const backendData = {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName || userData.name?.split(' ')[0] || '',
        lastName: userData.lastName || userData.name?.split(' ')[1] || '',
        birthDate: userData.birthDate,
        phone: userData.phone || null
      };
      
      const response = await apiService.register(backendData);
      if (response.success) {
        setUser(response.data.user);
        setLoading(false);
        return { success: true, user: response.data.user };
      } else {
        setLoading(false);
        return { success: false, error: response.message || 'Registration failed' };
      }
    } catch (error) {
      setLoading(false);
      
      // Backend bağlantısı yoksa localStorage fallback
      console.warn('Backend registration failed, using localStorage fallback:', error);
      
      const mockUser = {
        id: Date.now(),
        email: userData.email,
        firstName: userData.firstName || userData.name?.split(' ')[0] || '',
        lastName: userData.lastName || userData.name?.split(' ')[1] || '',
        birthDate: userData.birthDate,
        phone: userData.phone || null,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        loginCount: 1,
        testCompleted: false,
        reportDownloaded: false
      };
      
      // localStorage'a kullanıcı bilgilerini kaydet
      const existingUsers = localStorage.getItem('registeredUsers');
      let users = [];
      
      if (existingUsers) {
        try {
          users = JSON.parse(existingUsers);
        } catch (parseError) {
          console.error('Error parsing existing users:', parseError);
          users = [];
        }
      }
      
      // E-posta kontrolü - aynı e-posta ile kayıt varsa hata döndür
      const existingUser = users.find(user => user.email === userData.email);
      if (existingUser) {
        return { success: false, error: 'Bu e-posta adresi zaten kullanılıyor' };
      }
      
      users.push(mockUser);
      localStorage.setItem('registeredUsers', JSON.stringify(users));
      
      // Kullanıcıyı giriş yapmış olarak işaretle
      const authToken = 'mock-token-' + Date.now();
      localStorage.setItem('auth_token', authToken);
      
      setUser({
        id: mockUser.id,
        email: mockUser.email,
        name: `${mockUser.firstName} ${mockUser.lastName}`.trim(),
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        birthDate: mockUser.birthDate,
        phone: mockUser.phone
      });
      
      return { success: true, user: mockUser };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // localStorage'daki authentication token'ı da temizle
      localStorage.removeItem('auth_token');
      setLoading(false);
    }
  };

  const updateUser = async (updates) => {
    try {
      const response = await apiService.updateUserProfile(updates);
      if (response.success) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const addAssessment = async (packageId) => {
    try {
      const response = await apiService.createAssessment(packageId);
      if (response.success) {
        // Refresh user data to get updated assessments
        const userResponse = await apiService.getUserDashboard();
        if (userResponse.success) {
          setUser(prevUser => ({
            ...prevUser,
            assessments: userResponse.data.assessments
          }));
        }
        return response;
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getUserDashboard = async () => {
    try {
      return await apiService.getUserDashboard();
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getPackages = async () => {
    try {
      return await apiService.getPackages();
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getFilteredPackages = async () => {
    try {
      return await apiService.getFilteredPackages();
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    addAssessment,
    getUserDashboard,
    getPackages,
    getFilteredPackages,
    isAuthenticated: !!user,
    apiService // Expose API service for direct access if needed
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};