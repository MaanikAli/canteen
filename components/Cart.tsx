import React from 'react';
import { CartItem } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: number, newQuantity: number) => void;
  onCheckout: () => void;
  totalPrice: number;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose, cartItems, onUpdateQuantity, onCheckout, totalPrice }) => {
  return (
    <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="absolute top-0 left-0 -ml-16 mt-4">
         <button onClick={onClose} aria-label="Close cart" className="p-2 rounded-full bg-white/50 backdrop-blur-sm hover:bg-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
      </div>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Your Order</h2>
        </div>

        {/* Items */}
        {cartItems.length > 0 ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center gap-4">
                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-md object-cover"/>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-500">৳{item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 border rounded-full hover:bg-gray-100">-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 border rounded-full hover:bg-gray-100">+</button>
                </div>
                <p className="font-semibold w-20 text-right">৳{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <h3 className="font-semibold text-lg">Your cart is empty</h3>
            <p className="text-gray-500">Add items from the menu to get started.</p>
          </div>
        )}

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t space-y-4 bg-gray-50">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>৳{totalPrice.toFixed(2)}</span>
            </div>
            <button onClick={onCheckout} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-dark transition-colors">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
