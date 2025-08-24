import React, { useState } from 'react';
import { AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';

const AdminLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        onLogin(data.user, data.token);
      } else {
        setError(data.message || 'Giriş başarısız');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError('Bağlantı hatası');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4\">
      <div className=\"bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20\">
        {/* Header */}
        <div className=\"text-center mb-8\">
          <div className=\"mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4\">
            <Shield className=\"w-8 h-8 text-white\" />
          </div>
          <h1 className=\"text-2xl font-bold text-white mb-2\">Admin Panel</h1>
          <p className=\"text-gray-300\">SelfMode Admin Dashboard'a hoş geldiniz</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className=\"mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-3\">
            <AlertCircle className=\"w-5 h-5 text-red-400\" />
            <span className=\"text-red-200 text-sm\">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className=\"space-y-6\">
          <div>
            <label className=\"block text-sm font-medium text-gray-300 mb-2\">
              E-posta
            </label>
            <input
              type=\"email\"
              name=\"email\"
              value={formData.email}
              onChange={handleChange}
              placeholder=\"admin@selfmode.app\"
              className=\"w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all\"
              required
            />
          </div>

          <div>
            <label className=\"block text-sm font-medium text-gray-300 mb-2\">
              Şifre
            </label>
            <div className=\"relative\">
              <input
                type={showPassword ? 'text' : 'password'}
                name=\"password\"
                value={formData.password}
                onChange={handleChange}
                placeholder=\"Şifrenizi girin\"
                className=\"w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12\"
                required
              />
              <button
                type=\"button\"
                onClick={() => setShowPassword(!showPassword)}
                className=\"absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors\"
              >
                {showPassword ? <EyeOff className=\"w-5 h-5\" /> : <Eye className=\"w-5 h-5\" />}
              </button>
            </div>
          </div>

          <button
            type=\"submit\"
            disabled={isLoading}
            className=\"w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed\"
          >
            {isLoading ? (
              <div className=\"flex items-center justify-center space-x-2\">
                <div className=\"w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin\"></div>
                <span>Giriş yapılıyor...</span>
              </div>
            ) : (
              'Admin Girişi'
            )}
          </button>
        </form>

        {/* Demo Info */}
        <div className=\"mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg\">
          <p className=\"text-blue-200 text-sm text-center\">
            <strong>Demo Bilgileri:</strong><br />
            E-posta: admin@selfmode.app<br />
            Şifre: admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;