import React, { useState } from 'react';
import { CartProvider } from './components/Cart/CartContext';
import CartSidebar from './components/Cart/CartSidebar';
import CheckoutModal from './components/Cart/CheckoutModal';
import OrderSuccessModal from './components/Orders/OrderSuccessModal';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import MedicinesList from './components/Medicines/MedicinesList';
import OrdersList from './components/Orders/OrdersList';
import PaymentsList from './components/Payments/PaymentsList';
import UsersList from './components/User/UserList';
import UserProfile from './components/Profile/UserProfile';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [userRole, setUserRole] = useState('Admin'); // Can be 'Admin', 'Pharmacist', or 'Customer'
  const [userName, setUserName] = useState('Dr. Sarah Johnson');
  const [userId, setUserId] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [lastOrderData, setLastOrderData] = useState(null);

  const handleLogin = (email: string, role: string, name: string, id: string) => {
    setUserRole(role);
    setUserName(name);
    setUserId(id);
    setIsAuthenticated(true);
  };

  const handleRegister = (userData: any) => {
    setUserRole(userData.role);
    setUserName(userData.fullName);
    setUserId(userData.userId);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
    setUserRole('Admin');
    setUserName('');
    setUserId(null);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = (orderData: any) => {
    setLastOrderData(orderData);
    setIsCheckoutOpen(false);
    setIsOrderSuccessOpen(true);
  };

  if (!isAuthenticated) {
    return showRegister ? (
      <Register
        onRegister={handleRegister}
        onSwitchToLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard userRole={userRole} userId={userId || ''} />;
      case 'medicines':
        return <MedicinesList userRole={userRole} />;
      case 'orders':
        return <OrdersList userRole={userRole} />;
      case 'payments':
        return <PaymentsList userRole={userRole} />;
      case 'users':
        return <UsersList userRole={userRole} />;
      case 'user':
        return (
          <UserProfile
            userRole={userRole}
            userName={userName}
            userId={userId || ''}
          />
        );
      default:
        return <Dashboard userRole={userRole} userId={userId || ''} />;
    }
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          userRole={userRole}
          onLogout={handleLogout}
        />
        <div className="flex-1 flex flex-col">
          <Header
            currentPage={currentPage}
            userRole={userRole}
            userName={userName}
            onLogout={handleLogout}
            onCartClick={() => setIsCartOpen(true)}
          />
          <main className="flex-1 overflow-auto">{renderContent()}</main>
        </div>

        <CartSidebar
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onCheckout={handleCheckout}
        />

        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderComplete={handleOrderComplete}
        />

        <OrderSuccessModal
          isOpen={isOrderSuccessOpen}
          onClose={() => setIsOrderSuccessOpen(false)}
          orderData={lastOrderData}
        />
      </div>
    </CartProvider>
  );
}

export default App;
