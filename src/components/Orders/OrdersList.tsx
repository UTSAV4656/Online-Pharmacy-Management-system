import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  Package,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  AlertTriangle
} from 'lucide-react';

interface Order {
  id: number;
  orderId: string;
  customerId?: number;
  customerName?: string;
  customerEmail?: string;
  orderDate: string;
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  itemCount: number;
  paymentMethod: string;
  paymentStatus: 'Success' | 'Failed' | 'Pending';
  shippingAddress?: string;
  notes?: string;
}

interface OrdersListProps {
  userRole: string;
}

const OrdersList: React.FC<OrdersListProps> = ({ userRole }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const API_BASE_URL = 'https://localhost:7171/api';

  const fetchOrders = async (search: string = '', status: string = 'All') => {
  try {
    setLoading(true);
    setError(null);

    const headers = {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${token}`, // Add your auth token here
    };

    const params = new URLSearchParams({
      ...(search && { search }),
      ...(status !== 'All' && { status }),
    });

    if (userRole === 'Customer') {
      const currentCustomerId = 1; // Replace with the actual logged-in customer's ID
      params.set('customerId', currentCustomerId.toString());
    }

    const response = await fetch(`${API_BASE_URL}/orders?${params}`, {
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    const responseData = await response.json();

    // Check if the response has a '$values' property.
    // This is the key change to handle the new data format.
    const ordersArray = responseData.$values || [];

    if (ordersArray.length === 0) {
      setOrders([]);
      return;
    }

    const mappedOrders: Order[] = ordersArray.map((item: any) => ({
      // The API's 'id' property is what your component uses as a unique key.
      id: item.id, 
      orderId: item.orderId,
      customerId: item.customerId,
      customerName: item.customerName,
      customerEmail: item.customerEmail,
      orderDate: item.orderDate,
      totalAmount: item.totalAmount,
      status: item.status,
      itemCount: item.itemCount,
      paymentMethod: item.paymentMethod || 'N/A',
      paymentStatus: item.paymentStatus || 'N/A',
      shippingAddress: item.shippingAddress,
    }));

    setOrders(mappedOrders);

  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
    setOrders([]); // Clear orders on error
  } finally {
    setLoading(false);
  }
};

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`, // Add your auth token here
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchOrders(searchTerm, selectedStatus); // Refresh the list
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
    }
  };

  const exportOrders = async () => {
    try {
      // The API endpoint handles the export logic
      const response = await fetch(`${API_BASE_URL}/orders/export`, {
        headers: {
          // 'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to export orders');
      }
    } catch (err) {
      console.error('Error exporting orders:', err);
      alert('Failed to export orders');
    }
  };

  useEffect(() => {
    fetchOrders(searchTerm, selectedStatus);
  }, [userRole]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchOrders(searchTerm, selectedStatus);
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Processing':
      case 'Shipped':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'Cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => fetchOrders(searchTerm, selectedStatus)}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
          <p className="text-gray-600">Track and manage customer orders</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportOrders}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => fetchOrders(searchTerm, selectedStatus)}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Order ID</th>
                {userRole !== 'Customer' && (
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Customer</th>
                )}
                <th className="text-left py-4 px-6 font-medium text-gray-900">Date</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Items</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Total</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Payment</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={userRole !== 'Customer' ? 8 : 7} className="py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{order.orderId}</div>
                    </td>
                    {userRole !== 'Customer' && (
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <span className="text-gray-900">{order.customerName}</span>
                            {order.customerEmail && (
                              <div className="text-sm text-gray-500">{order.customerEmail}</div>
                            )}
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{order.itemCount} items</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">${order.totalAmount.toFixed(2)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{order.paymentMethod}</span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button className="text-teal-600 hover:text-teal-700 transition-colors flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                        {(userRole === 'Admin' || userRole === 'Pharmacist') && order.status === 'Pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Processing')}
                            className="text-blue-600 hover:text-blue-700 transition-colors text-sm"
                          >
                            Process
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersList;