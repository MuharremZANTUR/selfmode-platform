import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, FileText, Download, TrendingUp, 
  Calendar, Shield, LogOut, BarChart3, UserCheck,
  Clock, CheckCircle, AlertCircle
} from 'lucide-react';

const AdminDashboard = ({ user, token, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchDashboardStats();
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Stats fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Users fetch error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    onLogout();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status, label) => {
    const isActive = status === 1 || status === true;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800 border border-green-200'
          : 'bg-gray-100 text-gray-600 border border-gray-200'
      }`}>
        {isActive ? (
          <CheckCircle className=\"w-3 h-3 mr-1\" />
        ) : (
          <Clock className=\"w-3 h-3 mr-1\" />
        )}
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className=\"min-h-screen bg-gray-50 flex items-center justify-center\">
        <div className=\"text-center\">
          <div className=\"w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4\"></div>
          <p className=\"text-gray-600\">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=\"min-h-screen bg-gray-50\">
      {/* Header */}
      <header className=\"bg-white shadow-sm border-b border-gray-200\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <div className=\"flex justify-between items-center h-16\">
            <div className=\"flex items-center space-x-4\">
              <Shield className=\"w-8 h-8 text-blue-600\" />
              <div>
                <h1 className=\"text-xl font-bold text-gray-900\">SelfMode Admin</h1>
                <p className=\"text-sm text-gray-500\">Dashboard Yönetim Paneli</p>
              </div>
            </div>
            
            <div className=\"flex items-center space-x-4\">
              <div className=\"text-right\">
                <p className=\"text-sm font-medium text-gray-900\">{user.email}</p>
                <p className=\"text-xs text-gray-500\">Admin</p>
              </div>
              <button
                onClick={handleLogout}
                className=\"flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors\"
              >
                <LogOut className=\"w-4 h-4\" />
                <span>Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className=\"bg-white shadow-sm border-b border-gray-200\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <div className=\"flex space-x-8\">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className=\"w-4 h-4 inline mr-2\" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className=\"w-4 h-4 inline mr-2\" />
              Kullanıcılar
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8\">
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats Cards */}
            <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8\">
              <div className=\"bg-white p-6 rounded-lg shadow-sm border border-gray-200\">
                <div className=\"flex items-center justify-between\">
                  <div>
                    <p className=\"text-sm font-medium text-gray-600\">Toplam Kullanıcı</p>
                    <p className=\"text-2xl font-bold text-gray-900\">{stats?.totalUsers || 0}</p>
                  </div>
                  <div className=\"p-3 bg-blue-100 rounded-full\">
                    <Users className=\"w-6 h-6 text-blue-600\" />
                  </div>
                </div>
              </div>

              <div className=\"bg-white p-6 rounded-lg shadow-sm border border-gray-200\">
                <div className=\"flex items-center justify-between\">
                  <div>
                    <p className=\"text-sm font-medium text-gray-600\">Aktif Kullanıcı</p>
                    <p className=\"text-2xl font-bold text-gray-900\">{stats?.activeUsers || 0}</p>
                  </div>
                  <div className=\"p-3 bg-green-100 rounded-full\">
                    <Activity className=\"w-6 h-6 text-green-600\" />
                  </div>
                </div>
              </div>

              <div className=\"bg-white p-6 rounded-lg shadow-sm border border-gray-200\">
                <div className=\"flex items-center justify-between\">
                  <div>
                    <p className=\"text-sm font-medium text-gray-600\">Test Tamamlanan</p>
                    <p className=\"text-2xl font-bold text-gray-900\">{stats?.testCompleted || 0}</p>
                  </div>
                  <div className=\"p-3 bg-purple-100 rounded-full\">
                    <FileText className=\"w-6 h-6 text-purple-600\" />
                  </div>
                </div>
              </div>

              <div className=\"bg-white p-6 rounded-lg shadow-sm border border-gray-200\">
                <div className=\"flex items-center justify-between\">
                  <div>
                    <p className=\"text-sm font-medium text-gray-600\">Rapor İndirilen</p>
                    <p className=\"text-2xl font-bold text-gray-900\">{stats?.reportDownloaded || 0}</p>
                  </div>
                  <div className=\"p-3 bg-orange-100 rounded-full\">
                    <Download className=\"w-6 h-6 text-orange-600\" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Registrations Chart */}
            {stats?.recentRegistrations && stats.recentRegistrations.length > 0 && (
              <div className=\"bg-white p-6 rounded-lg shadow-sm border border-gray-200\">
                <h3 className=\"text-lg font-semibold text-gray-900 mb-4\">Son 7 Günlük Kayıtlar</h3>
                <div className=\"space-y-3\">
                  {stats.recentRegistrations.map((item, index) => (
                    <div key={index} className=\"flex items-center justify-between\">
                      <span className=\"text-sm text-gray-600\">{formatDate(item.date)}</span>
                      <span className=\"text-sm font-medium text-gray-900\">{item.count} kayıt</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className=\"space-y-6\">
            <div className=\"flex justify-between items-center\">
              <h2 className=\"text-2xl font-bold text-gray-900\">Kullanıcı Yönetimi</h2>
              <div className=\"text-sm text-gray-500\">
                Toplam {users.length} kullanıcı
              </div>
            </div>

            <div className=\"bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden\">
              <div className=\"overflow-x-auto\">
                <table className=\"min-w-full divide-y divide-gray-200\">
                  <thead className=\"bg-gray-50\">
                    <tr>
                      <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">
                        Kullanıcı
                      </th>
                      <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">
                        Son Giriş
                      </th>
                      <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">
                        Giriş Sayısı
                      </th>
                      <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">
                        Test Durumu
                      </th>
                      <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">
                        Rapor Durumu
                      </th>
                      <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">
                        Kayıt Tarihi
                      </th>
                    </tr>
                  </thead>
                  <tbody className=\"bg-white divide-y divide-gray-200\">
                    {users.map((user) => (
                      <tr key={user.id} className=\"hover:bg-gray-50\">
                        <td className=\"px-6 py-4 whitespace-nowrap\">
                          <div className=\"flex items-center\">
                            <div className=\"w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center\">
                              <span className=\"text-white text-sm font-medium\">
                                {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                              </span>
                            </div>
                            <div className=\"ml-4\">
                              <div className=\"text-sm font-medium text-gray-900\">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className=\"text-sm text-gray-500\">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className=\"px-6 py-4 whitespace-nowrap text-sm text-gray-900\">
                          {user.last_login ? formatDate(user.last_login) : 'Hiç giriş yok'}
                        </td>
                        <td className=\"px-6 py-4 whitespace-nowrap text-sm text-gray-900\">
                          {user.login_count || 0}
                        </td>
                        <td className=\"px-6 py-4 whitespace-nowrap\">
                          {getStatusBadge(user.test_completed, user.test_completed ? 'Tamamlandı' : 'Beklemede')}
                        </td>
                        <td className=\"px-6 py-4 whitespace-nowrap\">
                          {getStatusBadge(user.report_downloaded, user.report_downloaded ? 'İndirildi' : 'İndirilmedi')}
                        </td>
                        <td className=\"px-6 py-4 whitespace-nowrap text-sm text-gray-900\">
                          {formatDate(user.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;