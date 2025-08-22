import React, { useState, useEffect } from 'react';
import { Star, Brain, Users, CheckCircle, Clock, Target, Zap, ArrowRight } from 'lucide-react';

const CareerDiscoveryLanding = () => {
  const [activePackage, setActivePackage] = useState('HIGH_PLUS');
  const [liveStats, setLiveStats] = useState(47);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    // Live stats animation
    const interval = setInterval(() => {
      setLiveStats(prev => prev + Math.floor(Math.random() * 3));
    }, 8000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const packages = [
    // MIDDLE packages
    { 
      id: 'MIDDLE_BASIC', 
      category: 'MIDDLE', 
      level: 'BASIC', 
      price: '$49', 
      features: ['Temel Kişilik Testi', 'Holland Testi', 'Temel Rapor'],
      duration: '15 dk'
    },
    { 
      id: 'MIDDLE_PLUS', 
      category: 'MIDDLE', 
      level: 'PLUS', 
      price: '$79', 
      features: ['DISC + Holland', 'El Becerileri Testi', 'AI Destekli Analiz', 'Detaylı Rapor'],
      duration: '25 dk'
    },
    { 
      id: 'MIDDLE_MAX', 
      category: 'MIDDLE', 
      level: 'MAX', 
      price: '$129', 
      features: ['Tüm Testler', 'Doğum Haritası', 'AI Coaching', 'Premium Rapor', 'Uzak Durulacak Meslekler'],
      duration: '40 dk'
    },
    
    // HIGH packages  
    { 
      id: 'HIGH_BASIC', 
      category: 'HIGH', 
      level: 'BASIC', 
      price: '$69', 
      features: ['Big Five + DISC', 'Kariyer Odaklı Analiz', 'Üniversite Rehberliği'],
      duration: '20 dk'
    },
    { 
      id: 'HIGH_PLUS', 
      category: 'HIGH', 
      level: 'PLUS', 
      price: '$99', 
      features: ['Kapsamlı Test Bataryası', 'AI Kariyer Analizi', 'Bölüm Önerileri', 'Gelişim Planı'],
      duration: '35 dk',
      popular: true
    },
    { 
      id: 'HIGH_MAX', 
      category: 'HIGH', 
      level: 'MAX', 
      price: '$159', 
      features: ['Premium Analiz', 'Kişisel Koçluk', 'Doğum Haritası', '6 Ay Takip', 'Kariyer Roadmap'],
      duration: '50 dk'
    },
    
    // PRO packages
    { 
      id: 'PRO_BASIC', 
      category: 'PRO', 
      level: 'BASIC', 
      price: '$89', 
      features: ['Profesyonel Analiz', 'Kariyer Dönüşüm', 'Leadership Potansiyeli'],
      duration: '25 dk'
    },
    { 
      id: 'PRO_PLUS', 
      category: 'PRO', 
      level: 'PLUS', 
      price: '$149', 
      features: ['Executive Assessment', 'AI Coaching', 'Networking Önerileri', 'Sektör Analizi'],
      duration: '45 dk'
    },
    { 
      id: 'PRO_MAX', 
      category: 'PRO', 
      level: 'MAX', 
      price: '$229', 
      features: ['Premium Executive', 'Kişisel Mentörlük', 'Stratejik Planlama', '1 Yıl Takip', 'VIP Destek'],
      duration: '60 dk'
    }
  ];

  const testimonials = [
    { name: "Ayşe K.", age: 17, text: "Mühendislik okumak istiyordum ama test el becerilerimde zayıflık olduğunu gösterdi. Şimdi Ekonomi okuyorum ve çok mutluyum!", rating: 5 },
    { name: "Mehmet S.", age: 23, text: "Üniversitede kaybolmuştum. Bu analiz bana gerçek ilgi alanlarımı gösterdi. Kariyerimde 180° döndüm.", rating: 5 },
    { name: "Zehra T.", age: 29, text: "8 yıldır yanlış işte çalışıyormuşum! AI analizi sayesinde kendi işimi kurdum ve çok daha başarılıyım.", rating: 5 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-lg z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">M</span>
              </div>
            </div>
            <div className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">SELF</span>
              <span className="text-gray-600">mode</span>
            </div>
          </div>
          <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all">
            Başla
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 opacity-10"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 text-center">
          {/* Logo in Hero */}
          <div className="mb-8">
            <div className="inline-flex items-center space-x-4 bg-white/20 backdrop-blur-sm px-8 py-4 rounded-2xl">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">S</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-orange-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
              </div>
              <div className="text-4xl font-bold">
                <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">SELF</span>
                <span className="text-gray-700">mode</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent mb-6">
            Switch to<br/>
            <span className="text-6xl md:text-8xl">SELF MODE!</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Otopilot modundan çık! AI destekli kapsamlı analiz ile <span className="font-bold text-orange-500">gerçek potansiyelini keşfet</span>, 
            <span className="font-bold text-green-600"> kendi yolunu çiz!</span>
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12">
            <button className="group bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-full text-lg font-bold hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              Self Mode'a Geç!
              <ArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Son 24 saatte <span className="font-bold text-green-600">{liveStats}</span> kişi Self Mode'a geçti!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-4">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Self Mode Paketlerini Keşfet
          </span>
        </h2>
        <p className="text-center text-gray-600 mb-12 text-lg">Yaşına ve ihtiyacına uygun paketi seç</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Categories Header */}
          <div className="md:col-span-3 grid grid-cols-3 gap-4 mb-6">
            <div className="text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-lg">
              <h3 className="font-bold text-lg">MIDDLE</h3>
              <p className="text-sm opacity-90">Lise Öğrencileri</p>
            </div>
            <div className="text-center bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-lg">
              <h3 className="font-bold text-lg">HIGH</h3>
              <p className="text-sm opacity-90">Üniversite Öğrencileri</p>
            </div>
            <div className="text-center bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-lg">
              <h3 className="font-bold text-lg">PRO</h3>
              <p className="text-sm opacity-90">Çalışan Profesyoneller</p>
            </div>
          </div>

          {packages.map((pkg) => (
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
                <div className="text-3xl font-bold text-gray-800 mb-2">{pkg.price}</div>
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

              <button className={`w-full py-3 rounded-lg font-bold transition-all duration-300 ${
                pkg.popular 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg' 
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-blue-50 hover:to-blue-100'
              }`}>
                Analizi Başlat
              </button>
            </div>
          ))}
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
        <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 font-bold">
          🚀 Hemen Başla
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
    </div>
  );
};

export default CareerDiscoveryLanding;