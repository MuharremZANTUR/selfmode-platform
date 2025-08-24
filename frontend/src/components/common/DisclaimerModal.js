import React from 'react';
import { X, AlertCircle, Check } from 'lucide-react';

const DisclaimerModal = ({ isOpen, onClose, onAccept, selectedPackage }) => {
  if (!isOpen || !selectedPackage) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <AlertCircle className="w-8 h-8 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-800">
                Feragat Beyanı
              </h2>
            </div>
            <p className="text-gray-600 text-sm">
              Lütfen devam etmeden önce aşağıdaki bilgileri okuyun ve kabul edin
            </p>
          </div>
        </div>

        {/* Selected Package Info */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-orange-50 border-b border-gray-100">
          <div className="text-center">
            <h3 className="font-bold text-lg text-gray-800">
              Seçilen Paket: {selectedPackage.category} {selectedPackage.level}
            </h3>
            <p className="text-orange-600 font-bold text-xl">{selectedPackage.price}</p>
            <p className="text-gray-600 text-sm">⏱️ {selectedPackage.duration}</p>
          </div>
        </div>

        {/* Disclaimer Content */}
        <div className="p-6 space-y-6">
          {/* Ana Bilgilendirme */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-bold text-blue-800 mb-3 flex items-center">
              <span className="text-2xl mr-2">🎯</span>
              Analizin Amacı ve Değeri
            </h4>
            <p className="text-blue-700 text-sm mb-3">
              Bu kapsamlı kişilik ve potansiyel analizi, binlerce kişinin kendilerini daha iyi tanımasına katkı sağlamış olan yapay zeka destekli metodolojimiz ile geliştirilmiştir.
            </p>
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-2">Bu analiz size şunları sunar:</p>
              <ul className="space-y-1 text-xs">
                <li>• Kişilik yapınızın derinlemesine analizi</li>
                <li>• Doğal yeteneklerinizin ve güçlü yönlerinizin keşfi</li>
                <li>• Size uygun kariyer alanlarının belirlenmesi</li>
                <li>• Uzak durmanız gereken mesleki alanların tespiti</li>
                <li>• Kişisel gelişim için özel öneriler</li>
                <li>• Yaşam tarzı ve değerlerinize uygun rehberlik</li>
              </ul>
            </div>
          </div>

          {/* Gizlilik ve Veri Güvenliği */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h4 className="font-bold text-green-800 mb-3 flex items-center">
              <span className="text-2xl mr-2">🔒</span>
              Gizlilik ve Veri Güvenliği
            </h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span>Kişisel bilgileriniz (ad, e-posta vb.) katı gizlilik politikamız kapsamında korunur</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span>Test cevaplarınız sadece kişisel raporunuz için kullanılır ve kimlik bilgilerinizden ayrı tutulur</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span>Verileriniz üçüncü taraflarla paylaşılmaz</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span>İstediğiniz zaman verilerinizin silinmesini talep edebilirsiniz</span>
              </li>
            </ul>
          </div>

          {/* Sonuçların Doğası ve Sınırları */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h4 className="font-bold text-yellow-800 mb-3 flex items-center">
              <span className="text-2xl mr-2">⚖️</span>
              Sonuçların Doğası ve Sınırları
            </h4>
            <p className="text-yellow-700 text-sm mb-3 font-semibold">Lütfen dikkat edin:</p>
            <ul className="space-y-2 text-sm text-yellow-700">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                <span>Bu analiz, belirli bir andaki düşünce, duygu ve tercihlerinizi yansıtır</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                <span>Yapay zeka modelimiz sürekli gelişmekte olsa da, %100 kesin sonuçlar garanti edemez</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                <span>Sonuçlar, kişisel gelişiminize ışık tutmak ve yeni perspektifler kazandırmak amacıyla hazırlanmıştır</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                <span>Bu analiz, profesyonel psikolojik değerlendirme veya tıbbi teşhis yerine geçmez</span>
              </li>
            </ul>
          </div>

          {/* Tavsiyelerimiz */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h4 className="font-bold text-purple-800 mb-3 flex items-center">
              <span className="text-2xl mr-2">🎓</span>
              Tavsiyelerimiz
            </h4>
            <ul className="space-y-2 text-sm text-purple-700">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <span>Sonuçları açık bir zihinle değerlendirin ve kendi deneyimlerinizle harmanlayın</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <span>Önemli yaşam kararları öncesinde profesyonel danışmanlık almayı düşünün</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <span>Bu analizi, sürekli gelişen bir yolculuğun başlangıcı olarak görün</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <span>Sonuçları aileniz ve güvendiğiniz kişilerle paylaşarak farklı bakış açıları edinin</span>
              </li>
            </ul>
          </div>

          {/* Final Message */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6 text-center">
            <p className="text-gray-700 font-medium mb-4">
              Bu analizi başlatarak, yukarıdaki tüm bilgileri okuduğunuzu, anladığınızı ve kabul ettiğinizi onaylamış olursunuz.
            </p>
            <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Kendi potansiyelinizi keşfetme yolculuğunuzda size rehberlik etmekten mutluluk duyacağız.
            </p>
            <p className="text-xl mt-4">
              <span className="font-bold text-orange-600">Hazır mısınız?</span> 
              <span className="font-bold text-green-600">Hadi kendinizle tanışmaya başlayalım! ✨</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 space-y-4">
          <div className="text-center text-sm text-gray-600">
            Bu koşulları kabul ederek analize başlayabilirsiniz.
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              İptal Et
            </button>
            <button
              onClick={onAccept}
              className="flex-1 bg-gradient-to-r from-blue-600 to-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Check className="w-5 h-5" />
              <span>Okudum, Anladım ve Kabul Ediyorum</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;