
import React, { useState, useEffect } from 'react';
import { CartItem } from '../types';

interface PaymentPageProps {
  onPaymentSuccess: () => void;
  onPaymentCancel: () => void;
  setPage: (page: string) => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ onPaymentSuccess, onPaymentCancel, setPage }) => {
  const [pendingOrder, setPendingOrder] = useState<{ items: CartItem[], total: number } | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Retrieve the pending order from localStorage
    const orderData = localStorage.getItem('pendingOrder');
    if (orderData) {
      setPendingOrder(JSON.parse(orderData));
    } else {
      // If no order data, redirect to home
      setPage('home');
    }
  }, [setPage]);

  const handleSuccess = () => {
    setProcessing(true);
    // Simulate API call to payment gateway
    setTimeout(() => {
      onPaymentSuccess();
    }, 2000); // 2 second delay to simulate processing
  };

  const handleCancel = () => {
    onPaymentCancel();
  };

  if (!pendingOrder) {
    return (
        <div className="flex items-center justify-center py-20">
            <p>Loading order details...</p>
        </div>
    );
  }

  return (
    <div className="bg-light min-h-[calc(100vh-150px)] flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
            <img src="https://logowik.com/content/uploads/images/sslcommerz-payment-gateway-bangladesh7472.logowik.com.webp" alt="SSLCommerz Logo" className="mx-auto h-12 mb-4"/>
            <h2 className="text-2xl font-bold text-gray-800">Confirm Your Order</h2>
            <p className="text-gray-500">You are being redirected to our secure payment gateway.</p>
        </div>
        
        <div className="my-6 border-t border-b py-4">
            <h3 className="font-semibold text-lg mb-2">Order Summary</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {pendingOrder.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.name} x {item.quantity}</span>
                        <span className="font-medium">৳{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
            </div>
            <div className="flex justify-between font-bold text-xl mt-4 pt-4 border-t">
                <span>Total Payable</span>
                <span>৳{pendingOrder.total.toFixed(2)}</span>
            </div>
        </div>

        {processing ? (
             <div className="text-center">
                <div className="flex justify-center items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-primary animate-pulse"></div>
                    <div className="w-4 h-4 rounded-full bg-primary animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-4 h-4 rounded-full bg-primary animate-pulse [animation-delay:0.4s]"></div>
                </div>
                <p className="mt-3 text-gray-600">Processing payment, please wait...</p>
            </div>
        ) : (
            <div className="space-y-3">
                <button 
                    onClick={handleSuccess}
                    className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-dark transition-colors"
                >
                    Pay Now ৳{pendingOrder.total.toFixed(2)}
                </button>
                <button 
                    onClick={handleCancel}
                    className="w-full bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition-colors"
                >
                   Cancel Payment
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default PaymentPage;
