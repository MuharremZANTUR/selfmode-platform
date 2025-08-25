const Iyzipay = require('iyzipay');
require('dotenv').config();

// Check if iyzico environment variables are set
if (!process.env.IYZICO_API_KEY || !process.env.IYZICO_SECRET_KEY || !process.env.IYZICO_BASE_URL) {
    console.warn('⚠️ iyzico environment variables not set. Payment functionality will be disabled.');
    module.exports = {
        createPaymentForm: async () => ({ status: 'error', errorMessage: 'iyzico not configured' }),
        verifyPayment: async () => ({ status: 'error', errorMessage: 'iyzico not configured' }),
        createRefund: async () => ({ status: 'error', errorMessage: 'iyzico not configured' }),
        getPaymentStatus: async () => ({ status: 'error', errorMessage: 'iyzico not configured' })
    };
    return;
}

// iyzico configuration
const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY,
  secretKey: process.env.IYZICO_SECRET_KEY,
  uri: process.env.IYZICO_BASE_URL
});

// Create payment form
const createPaymentForm = async (paymentData) => {
  return new Promise((resolve, reject) => {
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: paymentData.conversationId,
      price: paymentData.price,
      paidPrice: paymentData.paidPrice,
      currency: Iyzipay.CURRENCY.TRY,
      basketId: paymentData.basketId,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: `${process.env.FRONTEND_URL}/payment/callback`,
      enabledInstallments: [1, 2, 3, 6, 9],
      buyer: {
        id: paymentData.userId.toString(),
        name: paymentData.buyerName,
        surname: paymentData.buyerSurname,
        gsmNumber: paymentData.buyerPhone,
        email: paymentData.buyerEmail,
        identityNumber: paymentData.buyerIdentityNumber,
        lastLoginDate: new Date().toISOString(),
        registrationDate: new Date().toISOString(),
        registrationAddress: paymentData.buyerAddress,
        ip: paymentData.buyerIp,
        city: paymentData.buyerCity,
        country: paymentData.buyerCountry,
        zipCode: paymentData.buyerZipCode
      },
      shippingAddress: {
        contactName: paymentData.shippingContactName,
        city: paymentData.shippingCity,
        country: paymentData.shippingCountry,
        address: paymentData.shippingAddress,
        zipCode: paymentData.shippingZipCode
      },
      billingAddress: {
        contactName: paymentData.billingContactName,
        city: paymentData.billingCity,
        country: paymentData.billingCountry,
        address: paymentData.billingAddress,
        zipCode: paymentData.billingZipCode
      },
      basketItems: paymentData.basketItems
    };

    iyzipay.checkoutFormInitialize.create(request, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// Verify payment
const verifyPayment = async (token) => {
  return new Promise((resolve, reject) => {
    const request = {
      token: token
    };

    iyzipay.checkoutForm.retrieve(request, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// Create refund
const createRefund = async (paymentId, amount, reason) => {
  return new Promise((resolve, reject) => {
    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: `refund_${Date.now()}`,
      paymentTransactionId: paymentId,
      price: amount,
      currency: Iyzipay.CURRENCY.TRY,
      ip: '127.0.0.1',
      reason: reason || 'customer_request',
      description: 'Refund requested by customer'
    };

    iyzipay.refund.create(request, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// Get payment status
const getPaymentStatus = async (paymentId) => {
  return new Promise((resolve, reject) => {
    const request = {
      paymentId: paymentId
    };

    iyzipay.payment.retrieve(request, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  createPaymentForm,
  verifyPayment,
  createRefund,
  getPaymentStatus
};
