import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

const AdminApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already logged in
    const token = localStorage.getItem('adminToken');
    if (token) {
      verifyAdminToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyAdminToken = async (token) => {
    try {
      const response = await fetch('/api/admin/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAdminUser(data.user);
          setAdminToken(token);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('adminToken');
        }
      } else {
        localStorage.removeItem('adminToken');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      
      // Backend bağlantısı yoksa localStorage'dan kullanıcı bilgilerini al
      const savedUser = localStorage.getItem('adminUser');
      if (savedUser && token) {
        try {
          const userData = JSON.parse(savedUser);
          setAdminUser(userData);
          setAdminToken(token);
          setIsAuthenticated(true);
          console.log('Fallback admin authentication successful');
        } catch (parseError) {
          console.error('Error parsing saved admin user:', parseError);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }
      } else {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (user, token) => {
    setAdminUser(user);
    setAdminToken(token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setAdminUser(null);
    setAdminToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <AdminDashboard 
      user={adminUser} 
      token={adminToken} 
      onLogout={handleLogout} 
    />
  );
};

export default AdminApp;