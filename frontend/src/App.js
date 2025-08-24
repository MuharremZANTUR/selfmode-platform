import React, { useState, useEffect } from 'react';
import { Star, Brain, CheckCircle, Clock, Target, Zap, ArrowRight, User, LogOut, Settings } from 'lucide-react';
import { UserProvider, useUser } from './contexts/UserContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import UserProfile from './components/user/UserProfile';
import UserDashboard from './components/user/UserDashboard';
import PaymentModal from './components/payment/PaymentModal';
import DisclaimerModal from './components/common/DisclaimerModal';

const CareerDiscoveryLanding = () => {
  const { user, logout, isAuthenticated, getPackages, getFilteredPackages } = useUser();
  const [liveStats, setLiveStats] = useState(47);
  const [scrollY, setScrollY] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    // Live stats animation
    const interval = setInterval(() => {
      setLiveStats(prev => prev + Math.floor(Math.random() * 3));
    }, 8000);

    // Close user menu on outside click
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      clearInterval(interval);
    };
  }, [showUserMenu]);

  // Load packages on component mount and when authentication changes
  useEffect(() => {
    const loadPackages = async () => {
      setLoadingPackages(true);
      try {
        let response;
        if (isAuthenticated && user?.birthDate) {
          // Load filtered packages for authenticated users
          response = await getFilteredPackages();
        } else {
          // Load all packages for non-authenticated users
          response = await getPackages();
        }
        
        if (response && response.success) {
          setPackages(response.data.packages);
        } else {
          console.error('Failed to load packages:', response?.error);
          // Fallback to hardcoded packages if API fails
          setPackages(getFallbackPackages());
        }
      } catch (error) {
        console.error('Error loading packages:', error);
        // Fallback to hardcoded packages if API fails
        setPackages(getFallbackPackages());
      } finally {
        setLoadingPackages(false);
      }
    };

    loadPackages();
  }, [isAuthenticated, user?.birthDate, getPackages, getFilteredPackages]);

  // Age calculation and package filtering
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getAgeGroup = (age) => {
    if (age >= 14 && age <= 18) return 'MIDDLE';
    if (age >= 19 && age <= 25) return 'HIGH';
    if (age >= 26) return 'PRO';
    return null;
  };

  // Fallback packages when API is not available
  const getFallbackPackages = () => {
    return [
      // MIDDLE packages
      { 
        id: 'middle_basic',
        category: 'MIDDLE', 
        level: 'BASIC', 
        ageGroup: 'MIDDLE',
        price: '₺500', 
        originalPrice: '₺1.000',
        features: ['5 Temel Yetenek Testi', 'Kişilik Analizi', 'Temel Meslek Önerileri', 'PDF Rapor'],
        duration: '45 dakika',
        popular: false
      },
      { 
        id: 'middle_plus',
        category: 'MIDDLE', 
        level: 'PLUS', 
        ageGroup: 'MIDDLE',
        price: '₺1.000', 
        originalPrice: '₺2.000',
        features: ['8 Detaylı Yetenek Testi', 'Kapsamlı Kişilik Analizi', 'Lise Branş Önerileri', 'Üniversite Bölüm Rehberi', 'Detaylı PDF Rapor', '30 Dakika Online Danışmanlık'],
        duration: '75 dakika',
        popular: true
      },
      { 
        id: 'middle_max',
        category: 'MIDDLE', 
        level: 'MAX', 
        ageGroup: 'MIDDLE',
        price: '₺2.000', 
        originalPrice: '₺4.000',
        features: ['12 Kapsamlı Test', 'AI Destekli Analiz', 'Gelecek Meslek Trendleri', 'Üniversite Tercih Rehberi', 'Premium PDF + Video Rapor', '60 Dakika Uzman Danışmanlığı', '3 Ay Takip Desteği'],
        duration: '120 dakika',
        popular: false
      },
      // HIGH packages  
      { 
        id: 'high_basic',
        category: 'HIGH', 
        level: 'BASIC', 
        ageGroup: 'HIGH',
        price: '₺1.000', 
        originalPrice: '₺2.000',
        features: ['6 Üniversite Odaklı Test', 'Kariyer Yönlendirme', 'Staj & İş Önerileri', 'PDF Rapor'],
        duration: '60 dakika',
        popular: false
      },
      { 
        id: 'high_plus',
        category: 'HIGH', 
        level: 'PLUS', 
        ageGroup: 'HIGH',
        price: '₺2.500', 
        originalPrice: '₺5.000',
        features: ['10 Profesyonel Test', 'Sektör Analizi', 'CV & LinkedIn Optimizasyonu', 'Mülakat Hazırlık Rehberi', 'Detaylı PDF Rapor', '45 Dakika Kariyer Danışmanlığı'],
        duration: '90 dakika',
        popular: true
      },
      { 
        id: 'high_max',
        category: 'HIGH', 
        level: 'MAX', 
        ageGroup: 'HIGH',
        price: '₺5.000', 
        originalPrice: '₺10.000',
        features: ['15 Kapsamlı Test', 'AI Kariyer Rehberi', 'Kişisel Marka Stratejisi', 'Network Önerileri', 'Premium Rapor Paketi', '90 Dakika Uzman Mentorluk', '6 Ay Kariyer Takibi'],
        duration: '150 dakika',
        popular: false
      },
      // PRO packages
      { 
        id: 'pro_basic',
        category: 'PRO', 
        level: 'BASIC', 
        ageGroup: 'PRO',
        price: '₺2.500', 
        originalPrice: '₺5.000',
        features: ['7 Profesyonel Değerlendirme', 'Kariyer Geçiş Analizi', 'Leadership Potansiyeli', 'PDF Rapor'],
        duration: '75 dakika',
        popular: false
      },
      { 
        id: 'pro_plus',
        category: 'PRO', 
        level: 'PLUS', 
        ageGroup: 'PRO',
        price: '₺5.000', 
        originalPrice: '₺10.000',
        features: ['12 Executive Test', 'Yöneticilik Değerlendirmesi', 'Girişimcilik Analizi', 'Kariyer Pivot Stratejisi', 'Premium PDF Rapor', '60 Dakika Executive Coaching'],
        duration: '105 dakika',
        popular: true
      },
      { 
        id: 'pro_max',
        category: 'PRO', 
        level: 'MAX', 
        ageGroup: 'PRO',
        price: '₺10.000', 
        originalPrice: '₺20.000',
        features: ['18 Kapsamlı Değerlendirme', 'AI Executive Analiz', 'C-Suite Hazırlık', 'Personal Branding Strategy', 'VIP Rapor Paketi', '120 Dakika C-Level Mentorluk', '12 Ay Premium Takip'],
        duration: '180 dakika',
        popular: false
      }
    ];
  };

  const getFilteredPackagesForUser = () => {
    if (!isAuthenticated || !user?.birthDate) {
      return packages; // Show all packages for non-authenticated users
    }
    
    const age = calculateAge(user.birthDate);
    const ageGroup = getAgeGroup(age);
    
    if (ageGroup) {
      return packages.filter(pkg => pkg.category === ageGroup || pkg.ageGroup === ageGroup);
    }
    
    return packages;
  };
  
  const handleRegistrationSuccess = () => {
    setShowRegister(false);
    if (selectedPackage) {
      setShowPayment(true);
    }
  };

  const handlePackageSelect = (packageId) => {
    const packageData = packages.find(pkg => pkg.id === packageId);
    setSelectedPackage(packageData);
    setShowDisclaimer(true);
  };
  
  const handleDisclaimerAccept = () => {
    setShowDisclaimer(false);
    
    if (!isAuthenticated) {
      setShowRegister(true);
      return;
    }
    
    // For authenticated users, go directly to payment
    setShowPayment(true);
  };

  const testimonials = [
    { name: "Ayşe K.", age: 17, text: "Mühendislik okumak istiyordum ama test el becerilerimde zayıflık olduğunu gösterdi. Şimdi Ekonomi okuyorum ve çok mutluyum!", rating: 5 },
    { name: "Mehmet S.", age: 23, text: "Üniversitede kaybolmuştum. Bu analiz bana gerçek ilgi alanlarımı gösterdi. Kariyerimde 180° döndüm.", rating: 5 },
    { name: "Zehra T.", age: 29, text: "8 yıldır yanlış işte çalışıyormuşum! AI analizi sayesinde kendi işimi kurdum ve çok daha başarılıyım.", rating: 5 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      
      {/* Fixed Login/User Button - Visible when header is not shown */}
      {!isAuthenticated ? (
        <div className={`fixed top-3 right-6 z-50 transition-all duration-500 ${
          scrollY > 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
          <button 
            onClick={() => setShowLogin(true)}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all backdrop-blur-sm flex items-center justify-center space-x-2"
          >
            Giriş Yap
          </button>
        </div>
      ) : (
        <div className={`fixed top-3 right-6 z-50 transition-all duration-500 ${
          scrollY > 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}>
          <div className="relative user-menu-container">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center bg-gradient-to-r from-blue-600 to-orange-500 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all backdrop-blur-sm justify-center space-x-2"
            >
              <User className="w-3 h-3" />
              <span className="truncate">{user.name.split(' ')[0]}</span>
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button 
                  onClick={() => { setShowDashboard(true); setShowUserMenu(false); }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Panel</span>
                </button>
                <button 
                  onClick={() => { setShowProfile(true); setShowUserMenu(false); }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>Profil</span>
                </button>
                <hr className="my-1" />
                <button 
                  onClick={() => { logout(); setShowUserMenu(false); }}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Çıkış</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Morphing Logo - Transitions from center-large to header-left-small */}
      <div className={`fixed z-50 transition-all duration-700 ease-in-out ${
        scrollY > 100 
          ? 'top-3 left-6 transform-none' 
          : 'top-8 left-1/2 transform -translate-x-1/2'
      }`}>
        <div className={`flex items-center backdrop-blur-sm rounded-3xl shadow-2xl transition-all duration-700 ease-in-out ${
          scrollY > 100 
            ? 'space-x-2 bg-white/90 px-3 py-2 rounded-xl' 
            : 'space-x-6 bg-white/20 px-12 py-6'
        }`}>
          <div className="relative">
            <div className={`bg-gradient-to-r from-blue-600 to-orange-500 flex items-center justify-center shadow-xl transition-all duration-700 ease-in-out ${
              scrollY > 100 ? 'w-8 h-8 rounded-lg' : 'w-20 h-20 rounded-2xl'
            }`}>
              <span className={`text-white font-bold transition-all duration-700 ease-in-out ${
                scrollY > 100 ? 'text-sm' : 'text-3xl'
              }`}>S</span>
            </div>
            <div className={`absolute bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center shadow-lg transition-all duration-700 ease-in-out ${
              scrollY > 100 
                ? 'w-3 h-3 -bottom-0.5 -right-0.5' 
                : 'w-10 h-10 -bottom-3 -right-3'
            }`}>
              <span className={`text-white font-bold transition-all duration-700 ease-in-out ${
                scrollY > 100 ? 'text-xs' : 'text-lg'
              }`}>M</span>
            </div>
          </div>
          <div className={`font-bold transition-all duration-700 ease-in-out ${
            scrollY > 100 ? 'text-lg' : 'text-5xl'
          }`}>
            <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">SELF</span>
            <span className={`transition-all duration-700 ease-in-out ${
              scrollY > 100 ? 'text-gray-600' : 'text-gray-700'
            }`}>mode</span>
          </div>
        </div>
      </div>

      {/* Navigation Background - Appears on scroll */}
      <nav className={`fixed top-0 w-full bg-white/50 backdrop-blur-lg z-40 border-b border-gray-200 transition-all duration-500 ${
        scrollY > 100 ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo space - occupied by morphing logo */}
          <div className="w-48">
            {/* Reserved space for morphing logo */}
          </div>
          {isAuthenticated ? (
            <div className="relative user-menu-container">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center bg-gradient-to-r from-blue-600 to-orange-500 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all justify-center space-x-2"
              >
                <User className="w-3 h-3" />
                <span className="truncate">{user.name.split(' ')[0]}</span>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button 
                    onClick={() => { setShowDashboard(true); setShowUserMenu(false); }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Panel</span>
                  </button>
                  <button 
                    onClick={() => { setShowProfile(true); setShowUserMenu(false); }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Profil</span>
                  </button>
                  <hr className="my-1" />
                  <button 
                    onClick={() => { logout(); setShowUserMenu(false); }}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Çıkış</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => setShowLogin(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              Giriş Yap
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 opacity-10"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 pt-40 pb-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-6">
            Switch to<br/>
            <span className="text-6xl md:text-8xl">SELF MODE!</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Otopilot modundan çık! AI destekli kapsamlı analiz ile <span className="font-bold text-orange-500">gerçek potansiyelini keşfet</span>, 
            <span className="font-bold text-green-600"> kendi yolunu çiz!</span>
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
            <button 
              onClick={() => isAuthenticated ? setShowDashboard(true) : setShowRegister(true)}
              className="group bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>{isAuthenticated ? 'Panele Git' : 'Hemen Başla'}</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Son 24 saatte <span className="font-bold text-green-600">{liveStats}</span> kişi analiz yaptı!</span>
            </div>
          </div>
          
          {/* Inspiring Message */}
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-3xl p-8 backdrop-blur-sm border border-white/30 shadow-xl">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Hayatının En Önemli Kararını Vermek Üzeresin!
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Binlerce kişi yanlış kariyer seçimi yüzünden mutsuz. Sen de onlardan biri olma! 
                <span className="font-bold text-orange-600"> AI destekli analiz</span> ile gerçek potansiyelini keşfet, 
                <span className="font-bold text-blue-600"> doğru yolu</span> bul.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">15+</div>
                  <div className="text-sm text-gray-600">Farklı Test</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">94%</div>
                  <div className="text-sm text-gray-600">Başarı Oranı</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">1.247+</div>
                  <div className="text-sm text-gray-600">Mutlu Kullanıcı</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-4">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Analizinizi Seçin
          </span>
        </h2>
        <p className="text-center text-gray-600 mb-12 text-lg">
          {isAuthenticated && user?.birthDate 
            ? `Yaşınıza uygun paketler (${getAgeGroup(calculateAge(user.birthDate))} kategorisi)`
            : 'Size en uygun paketi seçin ve gerçek potansiyelinizi keşfedin'
          }
        </p>

        <div>
          {/* Age Group Header for authenticated users */}
          {isAuthenticated && user?.birthDate && (() => {
            const age = calculateAge(user.birthDate);
            const ageGroup = getAgeGroup(age);
            return (
              <div className="text-center mb-8">
                <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-8 rounded-lg mb-4">
                  <h3 className="font-bold text-lg">
                    {ageGroup === 'MIDDLE' && 'MIDDLE - Lise Öğrencileri'}
                    {ageGroup === 'HIGH' && 'HIGH - Üniversite Öğrencileri'}
                    {ageGroup === 'PRO' && 'PRO - Çalışan Profesyoneller'}
                  </h3>
                  <p className="text-sm opacity-90">
                    {ageGroup === 'MIDDLE' && '14-18 yaş arası için tasarlandı'}
                    {ageGroup === 'HIGH' && '19-25 yaş arası için tasarlandı'}
                    {ageGroup === 'PRO' && '26+ yaş arası için tasarlandı'}
                  </p>
                </div>
              </div>
            );
          })()}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingPackages ? (
              // Loading skeleton for packages
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="relative bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
                  <div className="animate-pulse">
                    <div className="text-center mb-6">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-3 mb-6">
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <div key={idx} className="h-4 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))
            ) : getFilteredPackagesForUser().length > 0 ? (
              getFilteredPackagesForUser().map((pkg) => (
            <div 
              key={pkg.id}
              className={`relative bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 p-6 border-2 ${
                pkg.popular ? 'border-orange-400 ring-4 ring-orange-100' : 'border-gray-200'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-orange-400 to-red-400 text-white px-6 py-2 rounded-full text-sm font-bold">
                    🔥 EN POPÜLER
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="font-bold text-xl mb-2">
                  {pkg.category} <span className="text-orange-500">{pkg.level}</span>
                </h3>
                <div className="mb-2">
                  {pkg.originalPrice && (
                    <div className="text-sm text-gray-500 line-through mb-1">
                      {pkg.originalPrice}
                    </div>
                  )}
                  <div className="text-3xl font-bold text-gray-800">{pkg.price}</div>
                  {pkg.originalPrice && (
                    <div className="inline-block bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold mt-1">
                      %50 İNDİRİM
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{pkg.duration}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => handlePackageSelect(pkg.id)}
                className={`w-full py-3 rounded-lg font-bold transition-all duration-300 ${
                  pkg.popular 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg' 
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-blue-50 hover:to-blue-100'
                }`}
              >
                {isAuthenticated ? 'Analizi Başlat' : 'Kaydol ve Başlat'}
              </button>
            </div>
          ))
        ) : (
          // Empty state when no packages are available
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">Paketler yüklenemedi</h3>
            <p className="text-gray-500 mb-4">Sunucu ile bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-600 to-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Tekrar Dene
            </button>
          </div>
        )}
          </div>
        </div>
      </div>

      {/* Mission, Vision & Values Section */}
      <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-green-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Misyon, Vizyon & Değerlerimiz
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              SelfMode olarak, insanların gerçek potansiyellerini keşfetmelerine rehberlik ediyoruz
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Vision */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mr-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-orange-400">Vizyonumuz</h3>
              </div>
              <p className="text-gray-200 leading-relaxed">
                Dünyadaki her bireyin kendi potansiyelini keşfederek, anlamlı ve tatmin edici bir yaşam sürmesini sağlamak. 
                İnsanların "otopilot modundan" çıkıp, bilinçli seçimlerle kendi hayatlarının mimarı olmalarını desteklemek.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center mr-4">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-green-400">Misyonumuz</h3>
              </div>
              <p className="text-gray-200 leading-relaxed">
                Yapay zeka destekli kapsamlı analiz araçlarımızla, bireylerin kendileriyle gerçek anlamda "tanışmalarını" sağlıyoruz. 
                Yetenekler, ilgi alanları, kişilik özellikleri ve potansiyeli bir araya getirerek, herkesin kendine uygun yaşam ve kariyer yolunu bulmasına rehberlik ediyoruz.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8">
            <h3 className="text-3xl font-bold text-center mb-8">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Değerlerimiz
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-lg text-orange-400 mb-2">Özgünlük</h4>
                <p className="text-gray-300 text-sm">Her birey benzersizdir ve kendi yolunu bulma hakkına sahiptir</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-lg text-blue-400 mb-2">Farkındalık</h4>
                <p className="text-gray-300 text-sm">Kendini tanımak, tüm başarının temelidir</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-lg text-green-400 mb-2">Dönüşüm</h4>
                <p className="text-gray-300 text-sm">Pasif yaşamdan aktif, anlamlı yaşama geçiş mümkündür</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-lg text-purple-400 mb-2">Bütünlük</h4>
                <p className="text-gray-300 text-sm">İnsan sadece bir meslek değil, çok boyutlu bir varlıktır</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-white" />
                </div>
                <h4 className="font-bold text-lg text-yellow-400 mb-2">Güven</h4>
                <p className="text-gray-300 text-sm">Şeffaflık ve dürüstlük, rehberliğimizin temelindedir</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Neden Bu Analiz Hayatını Değiştirir?
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-2">AI Destekli Analiz</h3>
              <p className="text-gray-600">Binlerce veri noktasını analiz ederek size özel sonuçlar üretir</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-2">Uzak Durulacak Meslekler</h3>
              <p className="text-gray-600">Hangi alanlarda zorlanacağınızı önceden öğrenin, zaman kaybetmeyin</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-xl mb-2">El Becerileri Testi</h3>
              <p className="text-gray-600">Mekanik ve sanatsal becerileriniz de kariyerinizi etkiler</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          <span className="bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
            Hayatlarını Değiştirenlerden
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.age} yaşında</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={() => isAuthenticated ? setShowDashboard(true) : setShowRegister(true)}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 font-bold"
        >
          {isAuthenticated ? '📊 Panel' : '🚀 Hemen Başla'}
        </button>
      </div>

      {/* Stats Counter */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white py-12">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-orange-400">1,247+</div>
            <div className="text-gray-300">Mutlu Kullanıcı</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-400">94%</div>
            <div className="text-gray-300">Başarı Oranı</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-400">15+</div>
            <div className="text-gray-300">Farklı Test</div>
          </div>
        </div>
      </div>

      {/* Authentication Modals */}
      <Login 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />
      
      <Register 
        isOpen={showRegister} 
        onClose={() => {
          setShowRegister(false);
          setSelectedPackage(null);
        }}
        onSwitchToLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
        onRegistrationSuccess={handleRegistrationSuccess}
        selectedPackage={selectedPackage}
      />
      
      {/* User Modals */}
      <UserProfile 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)}
      />
      
      <UserDashboard 
        isOpen={showDashboard} 
        onClose={() => setShowDashboard(false)}
      />
      
      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPayment} 
        onClose={() => {
          setShowPayment(false);
          setSelectedPackage(null);
        }}
        selectedPackage={selectedPackage}
      />
      
      {/* Disclaimer Modal */}
      <DisclaimerModal 
        isOpen={showDisclaimer}
        onClose={() => {
          setShowDisclaimer(false);
          setSelectedPackage(null);
        }}
        onAccept={handleDisclaimerAccept}
        selectedPackage={selectedPackage}
      />
    </div>
  );
};

const App = () => {
  return (
    <UserProvider>
      <CareerDiscoveryLanding />
    </UserProvider>
  );
};

export default App;