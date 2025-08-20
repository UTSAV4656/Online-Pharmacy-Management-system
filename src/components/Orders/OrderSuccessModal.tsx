import React from 'react';
import { X, CheckCircle, Download, Eye } from 'lucide-react';
import OrderReceipt from './OrderReceipt';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: any;
}

const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ isOpen, onClose, orderData }) => {
  const downloadReceipt = () => {
    // Create a new window with the receipt content
    const receiptWindow = window.open('', '_blank');
    if (receiptWindow) {
      receiptWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Order Receipt - ${orderData.orderId}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #0d9488; }
            .order-info { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .items-table th { background-color: #f9fafb; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
            .success-badge { background-color: #dcfce7; color: #166534; padding: 10px; border-radius: 8px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">PharmaCare</div>
            <div>
              <h2>Order Receipt</h2>
              <p>#${orderData.orderId}</p>
            </div>
          </div>
          
          <div class="success-badge">
            ✓ Order Placed Successfully! Your order has been confirmed and will be processed shortly.
          </div>
          
          <div class="order-info">
            <h3>Order Information</h3>
            <p><strong>Order ID:</strong> ${orderData.orderId}</p>
            <p><strong>Date:</strong> ${new Date(orderData.orderDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${orderData.status}</p>
          </div>
          
          <div class="order-info">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${orderData.customerInfo.fullName}</p>
            <p><strong>Email:</strong> ${orderData.customerInfo.email}</p>
            <p><strong>Phone:</strong> ${orderData.customerInfo.phone}</p>
            <p><strong>Address:</strong> ${orderData.customerInfo.address}, ${orderData.customerInfo.city}, ${orderData.customerInfo.zipCode}</p>
          </div>
          
          <h3>Order Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${orderData.items.map((item: any) => `
                <tr>
                  <td>${item.name} (${item.brand})</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>$${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">
            Total Amount: $${orderData.total.toFixed(2)}
          </div>
          
          <div style="margin-top: 40px; text-align: center; color: #666;">
            <p>Thank you for choosing PharmaCare!</p>
            <p>For any queries, contact us at support@pharmacare.com</p>
          </div>
        </body>
        </html>
      `);
      receiptWindow.document.close();
      receiptWindow.print();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Order Successful!</h2>
              <p className="text-green-100 text-sm">Your order has been placed successfully</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <OrderReceipt orderData={orderData} onDownload={downloadReceipt} />
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessModal;