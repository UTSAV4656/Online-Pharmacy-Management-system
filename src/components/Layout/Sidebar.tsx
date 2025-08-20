import React, { useState } from 'react';
import Logo from './Logo';
import {
  Home,
  Pill,
  ShoppingCart,
  Users,
  CreditCard,
  Settings,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  userRole: string;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onPageChange,
  userRole,
  onLogout,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const getMenuItems = () => {
    const commonItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'user', label: 'My Profile', icon: User },
      { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: 2 }, // example badge
    ];

    const adminItems = [
      { id: 'medicines', label: 'Medicines', icon: Pill },
      { id: 'users', label: 'Users', icon: Users },
      { id: 'payments', label: 'Payments', icon: CreditCard },
    ];

    const pharmacistItems = [{ id: 'medicines', label: 'Medicines', icon: Pill }];

    const customerItems = [
      { id: 'medicines', label: 'Browse Medicines', icon: Pill },
    ];

    let items = [...commonItems];
    if (userRole === 'Admin') items.push(...adminItems);
    else if (userRole === 'Pharmacist') items.push(...pharmacistItems);
    else items.push(...customerItems);

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <div
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 h-screen flex flex-col transition-all duration-300`}
    >
      {/* Logo and collapse button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Logo size="md" showText={!collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-lg hover:bg-gray-100"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <p className={`text-xs text-gray-500 uppercase ${collapsed && 'hidden'}`}>
          Main Menu
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center ${
                collapsed ? 'justify-center' : 'space-x-3'
              } px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                isActive
                  ? 'bg-teal-100 text-teal-700 font-semibold shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white rounded-full px-1">
                    {item.badge}
                  </span>
                )}
              </div>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom user info + logout */}
      <div className="p-4 border-t border-gray-200">
        {!collapsed && (
          <div className="mb-3">
            <p className="text-sm font-semibold">{userRole}</p>
            <p className="text-xs text-gray-500">Logged in</p>
          </div>
        )}
        <div className={`flex ${collapsed ? 'justify-center' : 'space-x-3'}`}>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
