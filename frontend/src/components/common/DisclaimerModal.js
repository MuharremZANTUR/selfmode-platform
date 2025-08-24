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
        <div className="p-6 space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-bold text-yellow-800 mb-2">⚠️ Önemli Uyarı</h4>
            <p className="text-yellow-700 text-sm">
              Bu analiz sonuçları bilimsel testlere dayanmakla birlikte, yalnızca rehberlik amaçlıdır. 
              Kesin bir kariyer kararı verebilmek için ek danışmanlık almanızı öneriyoruz.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-gray-800">Kullanım Koşulları:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>
                  Analiz sonuçları kişisel gelişiminize rehberlik etmek amacıyla hazırlanmıştır.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>
                  Test sonuçları %100 kesinlik iddiasında değildir ve zaman içinde değişebilir.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>
                  Sonuçları değerlendirirken kendi deneyim ve tercihlerinizi de göz önünde bulundurun.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>
                  SelfMode, analiz sonuçlarına dayalı alınan kararlardan sorumlu değildir.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span>
                  Kişisel verileriniz gizlilik politikamız çerçevesinde korunmaktadır.
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-bold text-green-800 mb-2">✅ Ne Bekleyebilirsiniz?</h4>
            <ul className="space-y-1 text-sm text-green-700">
              <li>• Kişilik özelliklerinize uygun meslek önerileri</li>
              <li>• Güçlü ve zayıf yönlerinizin analizi</li>
              <li>• Uzak durmanız gereken alanların tespiti</li>
              <li>• AI destekli kariyer rehberliği</li>
              <li>• Detaylı rapor ve gelişim önerileri</li>
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-bold text-red-800 mb-2">❌ Bu Analiz Nedir DEĞIL?</h4>
            <ul className="space-y-1 text-sm text-red-700">
              <li>• Kesin bir kariyer garantisi</li>
              <li>• Profesyonel psikolojik danışmanlık</li>
              <li>• Tıbbi veya klinik değerlendirme</li>
              <li>• İş bulma garantisi</li>
            </ul>
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