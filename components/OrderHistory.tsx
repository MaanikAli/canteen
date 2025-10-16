import React, { useState, useMemo } from 'react';
import { Order } from '../types';
import { apiService } from '../services/apiService';

interface OrderHistoryProps {
  orders: Order[];
  onOrderDeleted?: () => void;
}

type SortOption = 'newest' | 'oldest' | 'status' | 'price-high' | 'price-low';

const OrderHistory: React.FC<OrderHistoryProps> = ({ orders, onOrderDeleted }) => {
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleDeleteOrder = (orderId: string) => {
    setOrderToDelete(orderId);
    setShowDeleteModal(true);
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;

    setDeletingOrderId(orderToDelete);
    setShowDeleteModal(false);
    try {
      await apiService.deleteOrder(orderToDelete);
      setSuccessMessage('Successfully deleted 1 order.');
      setShowSuccessModal(true);
      if (onOrderDeleted) {
        onOrderDeleted();
      }
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order. Please try again.');
    } finally {
      setDeletingOrderId(null);
      setOrderToDelete(null);
    }
  };

  const handleBulkDelete = () => {
    const completedSelected = Array.from(selectedOrders).filter(orderId =>
      orders.find(o => o.id === orderId)?.status === 'Completed'
    );

    if (completedSelected.length === 0) {
      alert('Please select completed orders to delete.');
      return;
    }

    setShowBulkDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
    const completedSelected = Array.from(selectedOrders).filter(orderId =>
      orders.find(o => o.id === orderId)?.status === 'Completed'
    );

    setDeletingOrderId('bulk');
    setShowBulkDeleteModal(false);
    try {
      const results = await Promise.allSettled(completedSelected.map(orderId => apiService.deleteOrder(orderId as string)));
      const successfulDeletes = results.filter(result => result.status === 'fulfilled').length;
      const failedDeletes = results.filter(result => result.status === 'rejected').length;

      if (successfulDeletes > 0) {
        // Clear selections for successfully deleted orders
        const successfulOrderIds = completedSelected.filter((_, index) => results[index].status === 'fulfilled');
        setSelectedOrders(prev => {
          const newSet = new Set(prev);
          successfulOrderIds.forEach(id => newSet.delete(id));
          return newSet;
        });
        if (onOrderDeleted) {
          onOrderDeleted();
        }
      }

      if (failedDeletes > 0) {
        console.error('Failed to delete some orders:', results.filter(r => r.status === 'rejected'));
        setSuccessMessage(`Successfully deleted ${successfulDeletes} order(s). Failed to delete ${failedDeletes} order(s). Please try again for the failed ones.`);
        setShowSuccessModal(true);
      } else {
        setSuccessMessage(`Successfully deleted ${successfulDeletes} order(s).`);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Unexpected error during bulk delete:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleSelectAll = () => {
    const completedOrders = orders.filter(o => o.status === 'Completed');
    if (selectedOrders.size === completedOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(completedOrders.map(o => o.id)));
    }
  };

  const sortedOrders = useMemo(() => {
    const sorted = [...orders];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.timestamp || a.createdAt).getTime() - new Date(b.timestamp || b.createdAt).getTime());
      case 'status':
        return sorted.sort((a, b) => a.status.localeCompare(b.status));
      case 'price-high':
        return sorted.sort((a, b) => b.totalPrice - a.totalPrice);
      case 'price-low':
        return sorted.sort((a, b) => a.totalPrice - b.totalPrice);
      default:
        return sorted;
    }
  }, [orders, sortBy]);
  const formatOrderId = (id: string) => {
    // Generate a more readable order ID like "GUB-12345678"
    const shortId = id.slice(-8).toUpperCase();
    return `GUB-${shortId}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      case 'Preparing': return 'text-blue-600 bg-blue-100';
      case 'Ready for Pickup': return 'text-green-600 bg-green-100';
      case 'Completed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const completedOrdersCount = orders.filter(o => o.status === 'Completed').length;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 bg-light min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">Your Order History</h1>

        {/* Controls */}
        {orders.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div>
                  <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">Sort by:</label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="status">Status</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="price-low">Price: Low to High</option>
                  </select>
                </div>

                {completedOrdersCount > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSelectAll}
                      className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      {selectedOrders.size === completedOrdersCount ? 'Deselect All' : 'Select All Completed'}
                    </button>
                    {selectedOrders.size > 0 && (
                      <button
                        onClick={handleBulkDelete}
                        disabled={deletingOrderId === 'bulk'}
                        className="px-3 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors disabled:opacity-50"
                      >
                        {deletingOrderId === 'bulk' ? 'Deleting...' : `Delete Selected (${selectedOrders.size})`}
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-600">
                {orders.length} order{orders.length !== 1 ? 's' : ''} • {completedOrdersCount} completed
              </div>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 sm:h-24 w-16 sm:w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No orders yet</h2>
            <p className="text-sm sm:text-base text-gray-500 px-4">Your order history will appear here once you place your first order.</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {sortedOrders.map(order => {
              const { date, time } = formatDateTime(order.timestamp || order.createdAt);
              return (
                <div key={order.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                    <div className="flex items-start gap-3">
                      {order.status === 'Completed' && (
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                          className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                      )}
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-800">
                          Order #{formatOrderId(order.id)}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {date} at {time}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xl sm:text-2xl font-bold text-primary">৳{order.totalPrice.toFixed(2)}</p>
                      <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium mt-1 ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      {order.status === 'Completed' && (
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          disabled={deletingOrderId === order.id}
                          className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 disabled:opacity-50"
                        >
                          {deletingOrderId === order.id ? 'Deleting...' : 'Delete Order'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-3 sm:pt-4">
                    <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Order Items:</h4>
                    <div className="space-y-1 sm:space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0 text-sm sm:text-base">
                          <div className="flex-1 min-w-0">
                            <span className="font-medium truncate">{item.name}</span>
                            <span className="text-gray-500 ml-2">x{item.quantity}</span>
                          </div>
                          <span className="font-semibold whitespace-nowrap">৳{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Delete Order</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this completed order? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteOrder}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Delete Confirmation Modal */}
        {showBulkDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Delete Selected Orders</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete {Array.from(selectedOrders).filter(orderId =>
                  orders.find(o => o.id === orderId)?.status === 'Completed'
                ).length} completed order(s)? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowBulkDeleteModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBulkDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Success</h3>
              <p className="text-gray-600 mb-6">
                {successMessage}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
