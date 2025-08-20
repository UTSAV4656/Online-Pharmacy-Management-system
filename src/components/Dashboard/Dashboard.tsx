import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  Activity,
  RefreshCw,
} from 'lucide-react';
// Assuming StatsCard is a component you have defined elsewhere
// import StatsCard from './StatsCard';

interface DashboardStats {
  totalMedicines?: number;
  totalOrders: number;
  totalRevenue: number;
  activeCustomers?: number;
  totalCustomers?: number; // Added new property for total customers
  pendingPrescriptions?: number;
  myOrders?: number;
  myPrescriptions?: number;
}

interface RecentOrder {
  $id?: string;
  orderId: number;
  customerName?: string;
  totalAmount: number;
  status: string;
  orderDate: string;
}

interface DashboardProps {
  userRole: string;
  userId: string;
}

// Mocked StatsCard component for this example
const StatsCard = ({ title, value, change, changeType, icon: Icon, color }: any) => {
  return (
    <div className={`p-6 rounded-xl shadow-lg border border-gray-200 ${color} text-white`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">{title}</h3>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <div className="flex items-center mt-2 text-sm">
        <span className="font-semibold">{change}</span>
      </div>
    </div>
  );
};


const Dashboard: React.FC<DashboardProps> = ({ userRole, userId }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'https://localhost:7171/api/Dashboard';

  const fetchDashboardData = async () => {
    if (!userId) {
      setLoading(false);
      setError("User ID not available. Please log in.");
      setSampleData(); 
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const headers = {
        'Content-Type': 'application/json',
      };

      const statsResponse = await fetch(`${API_BASE_URL}/stats?role=${userRole}&userId=${userId}`, {
        headers
      });

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const statsData = await statsResponse.json();
      setStats(statsData);

      const ordersResponse = await fetch(`${API_BASE_URL}/recent-orders?role=${userRole}&userId=${userId}&limit=4`, {
        headers
      });

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();

        if (ordersData && Array.isArray(ordersData.$values)) {
          setRecentOrders(ordersData.$values);
        } else {
          console.error('API did not return a $values array for recent orders:', ordersData);
          setRecentOrders([]);
        }
      } else {
        console.warn('Failed to fetch recent orders, using sample data.');
        setSampleData();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSampleData();
    } finally {
      setLoading(false);
    }
  };

  const setSampleData = () => {
    const sampleStats: DashboardStats = {
      totalOrders: 1234,
      totalRevenue: 23456,
      ...(userRole === 'Admin' && {
        totalMedicines: 847,
        activeCustomers: 2156
      }),
      ...(userRole === 'Pharmacist' && {
        totalMedicines: 847,
        pendingPrescriptions: 156,
        totalCustomers: 5000 // Added sample data for total customers
      }),
      ...(userRole === 'Customer' && {
        myOrders: 12,
        myPrescriptions: 3
      })
    };

    const sampleOrders: RecentOrder[] = [
      {
        $id: "2", 
        orderId: 1,
        customerName: userRole !== 'Customer' ? 'Customer 1' : undefined,
        totalAmount: 75.50,
        status: 'Completed',
        orderDate: new Date().toISOString()
      },
      {
        $id: "3",
        orderId: 2,
        customerName: userRole !== 'Customer' ? 'Customer 2' : undefined,
        totalAmount: 100.25,
        status: 'Pending',
        orderDate: new Date().toISOString()
      },
      {
        $id: "4",
        orderId: 3,
        customerName: userRole !== 'Customer' ? 'Customer 3' : undefined,
        totalAmount: 150.00,
        status: 'Cancelled',
        orderDate: new Date().toISOString()
      },
      {
        $id: "5",
        orderId: 4,
        customerName: userRole !== 'Customer' ? 'Customer 4' : undefined,
        totalAmount: 80.00,
        status: 'Completed',
        orderDate: new Date().toISOString()
      }
    ];

    setStats(sampleStats);
    setRecentOrders(sampleOrders);
  };


  useEffect(() => {
    fetchDashboardData();
  }, [userRole, userId]);

  const getStatsForRole = () => {
    if (!stats) return [];

    const commonStats = [
      {
        title: 'Total Orders',
        value: stats.totalOrders?.toLocaleString() || '0',
        change: '+12% from last month',
        changeType: 'increase' as const,
        icon: ShoppingCart,
        color: 'bg-blue-500'
      },
      {
        title: 'Revenue',
        value: `$${stats.totalRevenue?.toLocaleString() || '0'}`,
        change: '+8% from last month',
        changeType: 'increase' as const,
        icon: CreditCard,
        color: 'bg-green-500'
      }
    ];

    const adminStats = [
      {
        title: 'Total Medicines',
        value: stats.totalMedicines?.toLocaleString() || '0',
        change: '+5 new this week',
        changeType: 'increase' as const,
        icon: Package,
        color: 'bg-teal-500'
      },
      {
        title: 'Active Customers',
        value: stats.activeCustomers?.toLocaleString() || '0',
        change: '+23 new this week',
        changeType: 'increase' as const,
        icon: Users,
        color: 'bg-purple-500'
      },
      ...commonStats
    ];

    const pharmacistStats = [
      {
        title: 'Medicines in Stock',
        value: stats.totalMedicines?.toLocaleString() || '0',
        change: '23 expiring soon',
        changeType: 'neutral' as const,
        icon: Package,
        color: 'bg-teal-500'
      },
      {
        title: 'Pending Prescriptions', // Updated title for clarity
        value: stats.pendingPrescriptions?.toLocaleString() || '0',
        change: '+8 pending review',
        changeType: 'increase' as const,
        icon: Activity,
        color: 'bg-orange-500'
      },
      {
        title: 'Total Customers', // Added a new stat card for pharmacists
        value: stats.totalCustomers?.toLocaleString() || '0',
        change: '+15 new this month',
        changeType: 'increase' as const,
        icon: Users,
        color: 'bg-purple-500'
      },
      ...commonStats
    ];

    const customerStats = [
      {
        title: 'My Orders',
        value: stats.myOrders?.toLocaleString() || '0',
        change: '2 in progress',
        changeType: 'neutral' as const,
        icon: ShoppingCart,
        color: 'bg-blue-500'
      },
      {
        title: 'Active Prescriptions', // Updated title for clarity
        value: stats.myPrescriptions?.toLocaleString() || '0',
        change: '1 pending approval',
        changeType: 'neutral' as const,
        icon: Activity,
        color: 'bg-orange-500'
      }
    ];

    if (userRole === 'Admin') return adminStats;
    if (userRole === 'Pharmacist') return pharmacistStats;
    return customerStats;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  const statsData = getStatsForRole();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={fetchDashboardData}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <button className="text-sm text-teal-600 hover:text-teal-700">View all</button>
          </div>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.orderId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Order ID: {order.orderId}</p>
                      {order.customerName && (
                        <p className="text-sm text-gray-500">{order.customerName}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${order.totalAmount.toFixed(2)}</p>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
