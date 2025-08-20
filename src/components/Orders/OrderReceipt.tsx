import React from 'react';
import { Download, Calendar, MapPin, CreditCard, Package, Check } from 'lucide-react';
import Logo from '../Layout/Logo';

interface OrderReceiptProps {
  orderData: any;
  onDownload: () => void;
}

const OrderReceipt: React.FC<OrderReceiptProps> = ({ orderData, onDownload }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Logo size="md" showText={true} />
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-900">Order Receipt</h2>
          <p className="text-gray-600">#{orderData.orderId}</p>
        </div>
      </div>

      {/* Success Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-green-800">Order Placed Successfully!</h3>
          <p className="text-green-600 text-sm">Your order has been confirmed and will be processed shortly.</p>
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            <span>Order Information</span>
          </h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Order ID:</span> {orderData.orderId}</p>
            <p><span className="font-medium">Date:</span> {formatDate(orderData.orderDate)}</p>
            <p><span className="font-medium">Status:</span> 
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                {orderData.status}
              </span>
            </p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-teal-600" />
            <span>Delivery Address</span>
          </h3>
          <div className="text-sm text-gray-600">
            <p className="font-medium">{orderData.customerInfo.fullName}</p>
            <p>{orderData.customerInfo.address}</p>
            <p>{orderData.customerInfo.city}, {orderData.customerInfo.zipCode}</p>
            <p>{orderData.customerInfo.phone}</p>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-teal-600" />
          <span>Payment Information</span>
        </h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm">
            <span className="font-medium">Payment Method:</span> 
            <span className="ml-2 capitalize">{orderData.customerInfo.paymentMethod.replace('-', ' ')}</span>
          </p>
          <p className="text-sm mt-1">
            <span className="font-medium">Payment Status:</span> 
            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
              Paid
            </span>
          </p>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <Package className="w-5 h-5 text-teal-600" />
          <span>Order Items</span>
        </h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Item</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Qty</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Price</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orderData.items.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.brand}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-900">{item.quantity}</td>
                  <td className="py-3 px-4 text-gray-900">${item.price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-gray-900">${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Total */}
      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
          <span className="text-2xl font-bold text-teal-600">${orderData.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Download Button */}
      <div className="flex justify-center">
        <button
          onClick={onDownload}
          className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>Download Receipt</span>
        </button>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>Thank you for choosing PharmaCare!</p>
        <p>For any queries, contact us at support@pharmacare.com or call +1-234-567-8900</p>
      </div>
    </div>
  );
};

export default OrderReceipt;