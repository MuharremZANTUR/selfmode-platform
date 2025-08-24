import React, { useState } from 'react';
import { X, CreditCard, Shield, Check } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

const PaymentModal = ({ isOpen, onClose, selectedPackage }) => {
  const { user, addAssessment } = useUser();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    fullName: user?.name || '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) return; // Limit to 16 digits + spaces
    }

    // Format expiry date
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(.{2})/, '$1/');
      if (formattedValue.length > 5) return; // Limit to MM/YY
    }

    // Format CVV
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 3) return; // Limit to 3 digits
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      // Add assessment to user's history
      const newAssessment = {
        id: Date.now(),
        packageName: `${selectedPackage.category} ${selectedPackage.level}`,
        date: new Date().toISOString(),
        status: 'in_progress',
        type: 'Kariyer Analizi',
        duration: selectedPackage.duration,
        isPremium: selectedPackage.price.includes('₺') ? parseInt(selectedPackage.price.replace(/[₺.]/g, '')) > 1000 : false,
        reportUrl: null
      };

      addAssessment(newAssessment);
      setLoading(false);
      setShowSuccess(true);
    }, 2000);
  };

  const handleCloseModal = () => {
    setShowSuccess(false);
    setFormData({
      email: user?.email || '',
      fullName: user?.name || '',
      cardNumber: '',
      expiryDate: '',
      cvv: ''
    });
    onClose();
  };

  if (!isOpen || !selectedPackage) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100">
          <button
            onClick={handleCloseModal}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                Ödeme Bilgileri
              </h2>
            </div>
            <p className="text-gray-600 text-sm">
              Güvenli ödeme ile Self Mode'a geç!
            </p>
          </div>
        </div>

        {!showSuccess ? (
          <div className="p-6">
            {/* Test Mode Banner */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-3 rounded-lg text-center mb-6 text-sm font-semibold">
              ⚠️ TEST MODU - Gerçek ödeme alınmayacak
            </div>

            {/* Selected Package */}
            <div className="bg-gradient-to-r from-blue-50 to-orange-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-gray-900">
                    {selectedPackage.category} {selectedPackage.level}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {selectedPackage.features?.[0] || 'Kapsamlı analiz paketi'}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">⏱️ {selectedPackage.duration}</span>
                    {selectedPackage.popular && (
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                        🔥 Popüler
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">
                    {selectedPackage.price}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta Adresi
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ornek@email.com"
                  required
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Test Kullanıcı"
                  required
                />
              </div>

              {/* Card Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kart Numarası
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="4111 1111 1111 1111"
                  required
                />
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Son Kullanma
                  </label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="12/26"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-5 h-5" />
                <span>{loading ? 'İşleniyor...' : 'Ödemeyi Tamamla'}</span>
              </button>

              {/* Security Info */}
              <div className="flex items-center justify-center space-x-2 text-gray-500 text-xs">
                <Shield className="w-4 h-4" />
                <span>256-bit SSL ile güvenli ödeme</span>
              </div>
            </form>
          </div>
        ) : (
          /* Success Screen */
          <div className="p-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-green-600 mb-3">
              Ödeme Başarılı!
            </h3>
            <p className="text-gray-600 mb-6">
              Analiziniz hazırlanıyor...<br />
              Raporunuz e-posta adresinize gönderilecek.<br />
              <strong>Test modu:</strong> Gerçek ödeme alınmadı.
            </p>
            <button
              onClick={handleCloseModal}
              className="bg-gradient-to-r from-blue-600 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;