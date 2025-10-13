
import React from 'react';
import { Order } from '../types';

interface KitchenDashboardProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const KitchenDashboard: React.FC<KitchenDashboardProps> = ({ orders, setOrders }) => {
  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const columns: Order['status'][] = ['Pending', 'Preparing', 'Ready for Pickup'];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Kitchen Order Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(status => (
          <div key={status} className="bg-gray-100 rounded-lg p-4">
            <h2 className="text-lg font-bold mb-4 text-center border-b-2 border-primary pb-2">{status}</h2>
            <div className="space-y-4 h-[70vh] overflow-y-auto">
              {orders
                .filter(order => order.status === status)
                .map(order => (
                  <div key={order.id} className="bg-white p-4 rounded-lg shadow-md">
                    <p className="font-bold">{order.id}</p>
                    <p className="text-sm text-gray-500">By: {order.userName}</p>
                    <ul className="list-disc list-inside my-2 text-sm">
                      {order.items.map(item => (
                        <li key={item.id}>
                          {item.name} <span className="font-semibold">x{item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex flex-col space-y-2">
                      {status === 'Pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Preparing')}
                          className="w-full bg-yellow-500 text-white p-2 rounded text-sm hover:bg-yellow-600"
                        >
                          Start Preparing
                        </button>
                      )}
                      {status === 'Preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Ready for Pickup')}
                          className="w-full bg-green-500 text-white p-2 rounded text-sm hover:bg-green-600"
                        >
                          Mark as Ready
                        </button>
                      )}
                       {status === 'Ready for Pickup' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'Completed')}
                          className="w-full bg-blue-500 text-white p-2 rounded text-sm hover:bg-blue-600"
                        >
                          Complete Order
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KitchenDashboard;
