
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Menu from './components/Menu';
import SpecialOffers from './components/SpecialOffers';
import About from './components/About';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import ChatbotIcon from './components/ChatbotIcon';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import AdminDashboard from './components/AdminDashboard';
import KitchenDashboard from './components/KitchenDashboard';
import ProfilePage from './components/ProfilePage';
import Cart from './components/Cart';
import PaymentPage from './components/PaymentPage';


import { CartItem, MenuItem, User, UserRole, Order } from './types';
import { INITIAL_USERS } from './constants';


// A helper to get data from localStorage
const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
};

// --- Order Success Notification ---
const OrderSuccessNotification: React.FC<{onClose: () => void}> = ({onClose}) => (
    <div className="fixed top-5 right-5 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-fade-in-down">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>Order placed successfully!</span>
        <button onClick={onClose} className="ml-4 font-bold">&times;</button>
    </div>
);

// --- Main Student-facing App Component ---
const StudentHomePage: React.FC<{
  onAddToCart: (item: MenuItem) => void;
  menu: MenuItem[];
}> = ({ onAddToCart, menu }) => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <>
      <main>
        <Hero />
        <Menu onAddToCart={onAddToCart} menu={menu} />
        <SpecialOffers menu={menu} onAddToCart={onAddToCart} />
        <About />
      </main>
      <Footer />
      {!isChatbotOpen && <ChatbotIcon onClick={() => setIsChatbotOpen(true)} />}
      {isChatbotOpen && <Chatbot onClose={() => setIsChatbotOpen(false)} />}
    </>
  );
};


const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [users, setUsers] = useLocalStorage<User[]>('users', INITIAL_USERS);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [orders, setOrders] = useLocalStorage<Order[]>('orders', []);
  const [menu, setMenu] = useLocalStorage<MenuItem[]>('menu', []);
  const [canteenName, setCanteenName] = useLocalStorage<string>('canteenName', 'Green University Canteen');
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);

  // Navigate to home or dashboard if user logs in/out
  useEffect(() => {
    if (currentUser) {
        if(currentPage === 'login' || currentPage === 'signup') {
            if(currentUser.role === UserRole.Admin) setCurrentPage('admin');
            else if (currentUser.role === UserRole.Kitchen) setCurrentPage('kitchen');
            else setCurrentPage('home');
        }
    } else {
        if(currentPage !== 'signup' && currentPage !== 'login') {
            setCurrentPage('home');
        }
    }
  }, [currentUser, currentPage]);

  // Load menu items from API on app start
  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        const { apiService } = await import('./services/apiService');
        const menuItems = await apiService.getMenuItems();
        setMenu(menuItems);
      } catch (error) {
        console.error('Failed to load menu items:', error);
        // Keep empty array if API fails
      }
    };
    loadMenuItems();
  }, []);


  const handleAddToCart = (itemToAdd: MenuItem) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemToAdd.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === itemToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...itemToAdd, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };
  
  const totalPrice = useMemo(() => cartItems.reduce((total, item) => {
    const discountedPrice = item.discountPercent && item.discountPercent > 0 ? item.price - (item.price * (item.discountPercent / 100)) : item.price;
    return total + discountedPrice * item.quantity;
  }, 0), [cartItems]);

  const handleCheckout = () => {
    if (!currentUser) {
        alert("Please sign in to place an order.");
        setCurrentPage('login');
        return;
    }
    if (cartItems.length === 0) return;

    // Save order details to localStorage for the payment page to retrieve
    const pendingOrder = { items: cartItems, total: totalPrice };
    localStorage.setItem('pendingOrder', JSON.stringify(pendingOrder));

    setIsCartOpen(false);
    setCurrentPage('payment');
  };

  const handlePaymentSuccess = () => {
    const orderDataString = localStorage.getItem('pendingOrder');
    if (!orderDataString || !currentUser) {
        // Handle error case where data is missing
        alert("There was an error processing your order. Please try again.");
        setCurrentPage('home');
        return;
    }

    const pendingOrder: { items: CartItem[], total: number } = JSON.parse(orderDataString);

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      userId: currentUser.id.toString(),
      userName: currentUser.name,
      items: pendingOrder.items,
      totalPrice: pendingOrder.total,
      status: 'Pending',
      timestamp: new Date().toISOString()
    };
    
    setOrders(prev => [newOrder, ...prev]);
    setCartItems([]);
    localStorage.removeItem('pendingOrder');

    setCurrentPage('home');
    setShowOrderSuccess(true);
    setTimeout(() => setShowOrderSuccess(false), 4000);
  };

  const handlePaymentCancel = () => {
    localStorage.removeItem('pendingOrder');
    setCurrentPage('home');
    setIsCartOpen(true); // Re-open cart
  }

  const cartCount = useMemo(() => cartItems.reduce((count, item) => count + item.quantity, 0), [cartItems]);
  
  const renderPage = () => {
    if (currentPage === 'login') return <LoginPage setPage={setCurrentPage} setCurrentUser={setCurrentUser} users={users}/>;
    if (currentPage === 'signup') return <SignUpPage setPage={setCurrentPage} />;
    if (currentPage === 'payment') return <PaymentPage onPaymentSuccess={handlePaymentSuccess} onPaymentCancel={handlePaymentCancel} setPage={setCurrentPage}/>
    if (currentPage === 'admin' && currentUser?.role === UserRole.Admin) return <AdminDashboard users={users} setUsers={setUsers} orders={orders} setOrders={setOrders} menu={menu} setMenu={setMenu} canteenName={canteenName} setCanteenName={setCanteenName} />;
    if (currentPage === 'kitchen' && currentUser?.role === UserRole.Kitchen) return <KitchenDashboard orders={orders} setOrders={setOrders} />;
    if (currentPage === 'profile' && currentUser) return <ProfilePage currentUser={currentUser} setCurrentUser={setCurrentUser} setUsers={setUsers} orders={orders.filter(o => o.userId === currentUser.id)} />;
    
    // Default to student view
    return <StudentHomePage onAddToCart={handleAddToCart} menu={menu} />;
  };

  return (
    <div className="font-sans text-gray-800">
      <Header 
        canteenName={canteenName}
        cartCount={cartCount} 
        onCartClick={() => setIsCartOpen(true)}
        currentUser={currentUser}
        onLogout={() => {
            setCurrentUser(null);
            setCartItems([]); // Clear cart on logout
        }}
        onNavigate={setCurrentPage}
      />
      
      {renderPage()}
      
      {currentUser && (
         <Cart
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onCheckout={handleCheckout}
            totalPrice={totalPrice}
          />
      )}

      {showOrderSuccess && <OrderSuccessNotification onClose={() => setShowOrderSuccess(false)} />}
    </div>
  );
};

export default App;
