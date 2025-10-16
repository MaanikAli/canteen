
import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
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
import OrderHistory from './components/OrderHistory';
import Cart from './components/Cart';
import PaymentPage from './components/PaymentPage';


import { CartItem, MenuItem, User, UserRole, Order } from './types';
import { apiService } from './services/apiService';


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
  section?: string;
}> = ({ onAddToCart, menu, section }) => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  useEffect(() => {
    if (section === 'offers') {
      const offersElement = document.getElementById('offers');
      if (offersElement) {
        offersElement.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (section === 'menu') {
      const menuElement = document.getElementById('menu');
      if (menuElement) {
        menuElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [section]);

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
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]); // Only use backend data
  const [canteenName, setCanteenName] = useLocalStorage<string>('canteenName', 'Green University Canteen');
  const [logoUrl, setLogoUrl] = useLocalStorage<string>('logoUrl', '');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<{id: string, message: string, type: 'success' | 'info' | 'warning'}[]>([]);

  // Initialize apiService token on app start if user is logged in
  React.useEffect(() => {
    if (currentUser && !apiService.getToken()) {
      // If user is logged in but no token, try to get it from localStorage
      const token = localStorage.getItem('authToken');
      if (token) {
        apiService.setToken(token);
      }
    }
  }, [currentUser]);

  // Socket.IO connection
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('orderStatusUpdate', async (data) => {
      const { orderId, status, userId, userName } = data;

      // Re-fetch orders to ensure instant update
      try {
        const ordersData = await apiService.getOrders();
        setOrders(ordersData);
      } catch (error) {
        console.error('Failed to refresh orders:', error);
      }

      // Show notification to customers only for status updates
      if (currentUser && currentUser.id === userId) {
        const statusMessages = {
          'Preparing': `Your order is now being prepared!`,
          'Ready for Pickup': `Your order is ready for pickup!`,
          'Completed': `Your order has been completed!`
        };

        const message = statusMessages[status as keyof typeof statusMessages] || `Order status updated to ${status}`;

        const notification = {
          id: Date.now().toString(),
          message,
          type: 'info' as const
        };

        setNotifications(prev => [...prev, notification]);

        // Auto-remove notification after 5 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 5000);
      }
    });

    newSocket.on('newOrder', async (data) => {
      // Re-fetch orders to show new order instantly in kitchen/admin dashboards
      try {
        const ordersData = await apiService.getOrders();
        setOrders(ordersData);
      } catch (error) {
        console.error('Failed to refresh orders for new order:', error);
      }

      // Show notification to admin and kitchen staff
      if (currentUser && (currentUser.role === "admin" || currentUser.role === "kitchen")) {
        const notification = {
          id: Date.now().toString(),
          message: `New order received from ${data.userName}!`,
          type: 'success' as const
        };

        setNotifications(prev => [...prev, notification]);

        // Auto-remove notification after 5 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 5000);
      }
    });

    return () => {
      newSocket.close();
    };
  }, [currentUser]);

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

  // Load data from backend on app start and when user logs in
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load menu items
        const menuItems = await apiService.getMenu();
        setMenu(menuItems);

        // Load settings
        const settings = await apiService.getSettings();
        setCanteenName(settings.canteenName);
        setLogoUrl(settings.logoUrl);

        // Load users and orders if user is logged in
        if (currentUser) {
          if (currentUser.role === UserRole.Admin) {
            const usersData = await apiService.getUsers();
            setUsers(usersData);
          }
          const ordersData = await apiService.getOrders();
          setOrders(ordersData);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        setMenu([]);
        setUsers([]);
        setOrders([]);
      }
    };
    loadData();
  }, [currentUser]);


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
        window.location.href = '/login';
        return;
    }
    if (cartItems.length === 0) return;

    // Save order details to localStorage for the payment page to retrieve
    const pendingOrder = { items: cartItems, total: totalPrice };
    localStorage.setItem('pendingOrder', JSON.stringify(pendingOrder));

    setIsCartOpen(false);
    window.location.href = '/payment';
  };

  const handlePaymentSuccess = async () => {
    const orderDataString = localStorage.getItem('pendingOrder');
    if (!orderDataString || !currentUser) {
        // Handle error case where data is missing
        alert("There was an error processing your order. Please try again.");
        window.location.href = '/';
        return;
    }

    const pendingOrder: { items: CartItem[], total: number } = JSON.parse(orderDataString);

    try {
      // Transform cart items to backend order item schema
      const orderItems = pendingOrder.items.map(item => {
        const discountedPrice = item.discountPercent && item.discountPercent > 0 ? item.price - (item.price * (item.discountPercent / 100)) : item.price;
        return {
          menuItemId: item.id || item._id,
          name: item.name,
          price: discountedPrice,
          quantity: item.quantity
        };
      });

      const orderData = {
        userId: currentUser.id.toString(),
        userName: currentUser.name,
        items: orderItems,
        totalPrice: pendingOrder.total,
        status: 'Pending',
        timestamp: new Date().toISOString()
      };

      const createdOrder = await apiService.createOrder(orderData);
      setOrders(prev => [createdOrder, ...prev]);
      setCartItems([]);
      localStorage.removeItem('pendingOrder');

      window.location.href = '/';
      setShowOrderSuccess(true);
      setTimeout(() => setShowOrderSuccess(false), 4000);
    } catch (error) {
      console.error('Failed to create order:', error);
      alert("Failed to place order. Please try again.");
      window.location.href = '/';
    }
  };

  const handlePaymentCancel = () => {
    localStorage.removeItem('pendingOrder');
    window.location.href = '/';
    // Note: setIsCartOpen(true) won't work here because of page reload, but cart state is preserved
  }

  const cartCount = useMemo(() => cartItems.reduce((count, item) => count + item.quantity, 0), [cartItems]);
  
  const renderPage = () => {
    if (currentPage === 'login') return <LoginPage setPage={setCurrentPage} setCurrentUser={setCurrentUser} users={users}/>;
    if (currentPage === 'signup') return <SignUpPage setPage={setCurrentPage} />;
    if (currentPage === 'payment') return <PaymentPage onPaymentSuccess={handlePaymentSuccess} onPaymentCancel={handlePaymentCancel} setPage={setCurrentPage}/>
    if (currentPage === 'admin' && currentUser?.role === UserRole.Admin) return <AdminDashboard users={users} setUsers={setUsers} orders={orders} setOrders={setOrders} menu={menu} setMenu={setMenu} canteenName={canteenName} setCanteenName={setCanteenName} />;
    if (currentPage === 'kitchen' && currentUser?.role === UserRole.Kitchen) return <KitchenDashboard orders={orders} setOrders={setOrders} />;
    if (currentPage === 'orders' && currentUser) {
      const filteredOrders = currentUser.role === UserRole.Kitchen ? orders : orders.filter(o => o.userId === currentUser.id);
      return <OrderHistory orders={filteredOrders} />;
    }
    if (currentPage === 'profile' && currentUser) return <ProfilePage currentUser={currentUser} setCurrentUser={setCurrentUser} setUsers={setUsers} />;
    
    // Default to student view
    return <StudentHomePage onAddToCart={handleAddToCart} menu={menu} />;
  };

  return (
    <BrowserRouter>
      <div className="font-sans text-gray-800">
        <Header
          canteenName={canteenName}
          logoUrl={logoUrl}
          cartCount={cartCount}
          onCartClick={() => setIsCartOpen(true)}
          currentUser={currentUser}
          onLogout={() => {
              setCurrentUser(null);
              setCartItems([]); // Clear cart on logout
              apiService.clearToken(); // Clear API token
          }}
        />

        <Routes>
          <Route path="/" element={<StudentHomePage onAddToCart={handleAddToCart} menu={menu} />} />
          <Route path="/menu" element={<StudentHomePage onAddToCart={handleAddToCart} menu={menu} section="menu" />} />
          <Route path="/offers" element={<StudentHomePage onAddToCart={handleAddToCart} menu={menu} section="offers" />} />
          <Route path="/login" element={<LoginPage setCurrentUser={setCurrentUser} users={users} />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/payment" element={<PaymentPage onPaymentSuccess={handlePaymentSuccess} onPaymentCancel={handlePaymentCancel} />} />
          <Route path="/admin" element={currentUser?.role === UserRole.Admin ? <AdminDashboard users={users} setUsers={setUsers} orders={orders} setOrders={setOrders} menu={menu} setMenu={setMenu} canteenName={canteenName} setCanteenName={setCanteenName} logoUrl={logoUrl} setLogoUrl={setLogoUrl} /> : <div>Access Denied</div>} />
          <Route path="/kitchen" element={currentUser?.role === UserRole.Kitchen ? <KitchenDashboard orders={orders} setOrders={setOrders} /> : <div>Access Denied</div>} />
          <Route path="/orders" element={currentUser ? <OrderHistory orders={orders.filter(o => o.userId === currentUser.id)} onOrderDeleted={() => {
            // Refresh orders after deletion
            const loadOrders = async () => {
              try {
                const ordersData = await apiService.getOrders();
                setOrders(ordersData);
              } catch (error) {
                console.error('Failed to refresh orders:', error);
              }
            };
            loadOrders();
          }} /> : <div>Please log in</div>} />
          <Route path="/profile" element={currentUser ? <ProfilePage currentUser={currentUser} setCurrentUser={setCurrentUser} setUsers={setUsers} /> : <div>Please log in</div>} />
        </Routes>

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

        {/* Real-time Notifications */}
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-fade-in-down ${
              notification.type === 'success' ? 'bg-green-500 text-white' :
              notification.type === 'warning' ? 'bg-yellow-500 text-black' :
              'bg-blue-500 text-white'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{notification.message}</span>
            <button
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
              className="ml-4 font-bold"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </BrowserRouter>
  );
};

export default App;
