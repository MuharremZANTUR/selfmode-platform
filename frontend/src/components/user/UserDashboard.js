import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  Award, 
  BookOpen, 
  TrendingUp, 
  Download, 
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

const UserDashboard = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mock assessment data - replace with real data from API
  const mockAssessments = [
    {
      id: 1,
      packageName: 'HIGH PLUS',
      date: '2024-01-15',
      status: 'completed',
      score: 85,
      type: 'Kariyer Analizi',
      duration: '35 dk',
      isPremium: true,
      reportUrl: '#'
    },
    {
      id: 2,
      packageName: 'MIDDLE BASIC',
      date: '2023-12-20',
      status: 'completed',
      score: 78,
      type: 'Temel Kişilik Testi',
      duration: '15 dk',
      isPremium: false,
      reportUrl: '#'
    },
    {
      id: 3,
      packageName: 'PRO MAX',
      date: '2024-01-10',
      status: 'in_progress',
      score: null,
      type: 'Executive Assessment',
      duration: '60 dk',
      isPremium: true,
      reportUrl: null
    }
  ];

  const assessments = user?.assessments || mockAssessments;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-orange-600 bg-orange-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'in_progress':
        return 'Devam Ediyor';
      case 'failed':
        return 'Başarısız';
      default:
        return 'Bilinmiyor';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-orange-50">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Hoş geldin, {user.name}!
              </h2>
              <p className="text-gray-600">
                Değerlendirme geçmişin ve sonuçların burada
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                selectedTab === 'overview'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Genel Bakış
            </button>
            <button
              onClick={() => setSelectedTab('assessments')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                selectedTab === 'assessments'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Değerlendirmeler
            </button>
            <button
              onClick={() => setSelectedTab('reports')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                selectedTab === 'reports'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Raporlar
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {assessments.length}
                      </p>
                      <p className="text-sm text-blue-700">Toplam Test</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {assessments.filter(a => a.status === 'completed').length}
                      </p>
                      <p className="text-sm text-green-700">Tamamlanan</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Award className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600">
                        {assessments.filter(a => a.isPremium).length}
                      </p>
                      <p className="text-sm text-orange-700">Premium</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Son Aktiviteler
                </h3>
                <div className="space-y-3">
                  {assessments.slice(0, 3).map((assessment) => (
                    <div key={assessment.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-lg ${getStatusColor(assessment.status)}`}>
                        {getStatusIcon(assessment.status)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{assessment.packageName}</p>
                        <p className="text-sm text-gray-600">{assessment.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {new Date(assessment.date).toLocaleDateString('tr-TR')}
                        </p>
                        {assessment.score && (
                          <p className="text-sm font-medium text-blue-600">
                            %{assessment.score}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'assessments' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Tüm Değerlendirmeler
              </h3>
              
              <div className="space-y-3">
                {assessments.map((assessment) => (
                  <div key={assessment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {assessment.packageName}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(assessment.status)}`}>
                            {getStatusIcon(assessment.status)}
                            <span>{getStatusText(assessment.status)}</span>
                          </span>
                          {assessment.isPremium && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                              Premium
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{assessment.type}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{assessment.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(assessment.date).toLocaleDateString('tr-TR')}</span>
                          </div>
                          {assessment.score && (
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="w-4 h-4" />
                              <span>%{assessment.score}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {assessment.status === 'completed' && assessment.reportUrl && (
                          <>
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {assessment.status === 'in_progress' && (
                          <button className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors">
                            Devam Et
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {assessments.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Henüz hiç değerlendirme yapmadınız</p>
                  <button
                    onClick={onClose}
                    className="mt-4 bg-gradient-to-r from-blue-600 to-orange-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    İlk Testinizi Başlatın
                  </button>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'reports' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Raporlar ve Sonuçlar
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assessments
                  .filter(a => a.status === 'completed' && a.reportUrl)
                  .map((assessment) => (
                    <div key={assessment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {assessment.packageName} Raporu
                          </h4>
                          <p className="text-sm text-gray-600">{assessment.type}</p>
                        </div>
                        {assessment.isPremium && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            Premium
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <span>{new Date(assessment.date).toLocaleDateString('tr-TR')}</span>
                        {assessment.score && (
                          <span className="font-medium text-blue-600">
                            Skor: %{assessment.score}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="flex-1 flex items-center justify-center space-x-2 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                          <Eye className="w-4 h-4" />
                          <span>Görüntüle</span>
                        </button>
                        <button className="flex-1 flex items-center justify-center space-x-2 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                          <Download className="w-4 h-4" />
                          <span>İndir</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
              
              {assessments.filter(a => a.status === 'completed' && a.reportUrl).length === 0 && (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Henüz tamamlanmış rapor bulunmuyor</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;