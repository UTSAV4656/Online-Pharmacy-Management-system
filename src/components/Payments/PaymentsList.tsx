import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  CreditCard, 
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Download,
  Eye,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface Payment {
  id: number;
  paymentId: string;
  orderId: string;
  customerId?: number;
  customerName?: string;
  customerEmail?: string;
  amount: number;
  paymentMethod: 'Credit Card' | 'Debit Card' | 'UPI' | 'COD' | 'Net Banking';
  status: 'Success' | 'Failed' | 'Pending' | 'Refunded';
  paymentDate: string;
  transactionId: string;
  gatewayResponse?: string;
  refundAmount?: number;
  refundDate?: string;
}

interface PaymentStats {
  totalRevenue: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
}

interface PaymentsListProps {
  userRole: string;
}

const PaymentsList: React.FC<PaymentsListProps> = ({ userRole }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedMethod, setSelectedMethod] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // TODO: Replace with your actual API base URL
  const API_BASE_URL = 'https://localhost:5001/api';

  const fetchPayments = async (page: number = 1, search: string = '', status: string = 'All', method: string = 'All') => {
    try {
      setLoading(true);
      setError(null);

      // TODO: Add authentication headers
      const headers = {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`,
      };

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '10',
        ...(search && { search }),
        ...(status !== 'All' && { status }),
        ...(method !== 'All' && { paymentMethod: method }),
        ...(userRole === 'Customer' && { customerId: 'current' }) // Replace with actual customer ID
      });

      const response = await fetch(`${API_BASE_URL}/payments?${params}`, {
        headers
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const data = await response.json();
      setPayments(data.payments || data);
      setTotalPages(data.totalPages || 1);

      // Fetch payment statistics
      const statsResponse = await fetch(`${API_BASE_URL}/payments/stats`, {
        headers
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      
      // Fallback to sample data for development
      setSampleData();
    } finally {
      setLoading(false);
    }
  };

  const setSampleData = () => {
    // Sample data for development - remove when API is ready
    const samplePayments: Payment[] = [
      {
        id: 1,
        paymentId: 'PAY-1001',
        orderId: 'ORD-1001',
        customerId: 1,
        customerName: userRole !== 'Customer' ? 'John Doe' : undefined,
        customerEmail: 'john@example.com',
        amount: 125.50,
        paymentMethod: 'Credit Card',
        status: 'Success',
        paymentDate: '2024-01-15T14:30:00Z',
        transactionId: 'TXN-ABC123',
        gatewayResponse: 'Payment successful'
      },
      {
        id: 2,
        paymentId: 'PAY-1002',
        orderId: 'ORD-1002',
        customerId: 2,
        customerName: userRole !== 'Customer' ? 'Jane Smith' : undefined,
        customerEmail: 'jane@example.com',
        amount: 89.25,
        paymentMethod: 'UPI',
        status: 'Pending',
        paymentDate: '2024-01-14T16:45:00Z',
        transactionId: 'TXN-DEF456'
      },
      {
        id: 3,
        paymentId: 'PAY-1003',
        orderId: 'ORD-1003',
        customerId: 3,
        customerName: userRole !== 'Customer' ? 'Bob Johnson' : undefined,
        customerEmail: 'bob@example.com',
        amount: 67.80,
        paymentMethod: 'COD',
        status: 'Failed',
        paymentDate: '2024-01-13T10:20:00Z',
        transactionId: 'TXN-GHI789',
        gatewayResponse: 'Insufficient funds'
      }
    ];

    const sampleStats: PaymentStats = {
      totalRevenue: samplePayments.filter(p => p.status === 'Success').reduce((sum, p) => sum + p.amount, 0),
      successfulPayments: samplePayments.filter(p => p.status === 'Success').length,
      pendingPayments: samplePayments.filter(p => p.status === 'Pending').length,
      failedPayments: samplePayments.filter(p => p.status === 'Failed').length
    };

    setPayments(samplePayments);
    setStats(sampleStats);
  };

  const processRefund = async (paymentId: number, amount: number) => {
    try {
      // TODO: Add authentication headers
      const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ amount })
      });

      if (response.ok) {
        // Refresh payments list
        fetchPayments(currentPage, searchTerm, selectedStatus, selectedMethod);
        alert('Refund processed successfully');
      } else {
        throw new Error('Failed to process refund');
      }
    } catch (err) {
      console.error('Error processing refund:', err);
      alert('Failed to process refund');
    }
  };

  const exportPayments = async () => {
    try {
      // TODO: Add authentication headers
      const response = await fetch(`${API_BASE_URL}/payments/export`, {
        headers: {
          // 'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Error exporting payments:', err);
      alert('Failed to export payments');
    }
  };

  useEffect(() => {
    fetchPayments(currentPage, searchTerm, selectedStatus, selectedMethod);
  }, [currentPage, userRole]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setCurrentPage(1);
      fetchPayments(1, searchTerm, selectedStatus, selectedMethod);
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, selectedStatus, selectedMethod]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'Refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'Failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'Refunded':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payments...</p>
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
            onClick={() => fetchPayments(currentPage, searchTerm, selectedStatus, selectedMethod)}
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
          <p className="text-gray-600">Track and manage payment transactions</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={exportPayments}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Export</span>
          </button>
          <button 
            onClick={() => fetchPayments(currentPage, searchTerm, selectedStatus, selectedMethod)}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successfulPayments}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.failedPayments}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search payments..."
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
          <option value="Success">Success</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
        </select>
        <select 
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="All">All Methods</option>
          <option value="Credit Card">Credit Card</option>
          <option value="Debit Card">Debit Card</option>
          <option value="UPI">UPI</option>
          <option value="COD">COD</option>
          <option value="Net Banking">Net Banking</option>
        </select>
        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Payment ID</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Order ID</th>
                {userRole !== 'Customer' && (
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Customer</th>
                )}
                <th className="text-left py-4 px-6 font-medium text-gray-900">Amount</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Method</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Date</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={userRole !== 'Customer' ? 8 : 7} className="py-12 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{payment.paymentId}</div>
                      <div className="text-sm text-gray-500">{payment.transactionId}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-teal-600 hover:text-teal-700 cursor-pointer">
                        {payment.orderId}
                      </span>
                    </td>
                    {userRole !== 'Customer' && (
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <span className="text-gray-900">{payment.customerName}</span>
                            {payment.customerEmail && (
                              <div className="text-sm text-gray-500">{payment.customerEmail}</div>
                            )}
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">${payment.amount.toFixed(2)}</div>
                      {payment.refundAmount && (
                        <div className="text-sm text-red-600">Refunded: ${payment.refundAmount.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">{payment.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(payment.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button className="text-teal-600 hover:text-teal-700 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-700 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        {(userRole === 'Admin') && payment.status === 'Success' && (
                          <button 
                            onClick={() => {
                              const amount = prompt('Enter refund amount:', payment.amount.toString());
                              if (amount && parseFloat(amount) > 0) {
                                processRefund(payment.id, parseFloat(amount));
                              }
                            }}
                            className="text-red-600 hover:text-red-700 transition-colors text-sm"
                          >
                            Refund
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsList;