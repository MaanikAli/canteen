import React, { useState, useMemo } from 'react';
import { User, UserRole, Order, MenuItem, MenuCategory } from '../types';
import { getAiRecommendation } from '../services/geminiService';
import { apiService } from '../services/apiService';
import Notification from './Notification';

// --- Sub-components for each tab ---

const UserManagementTab: React.FC<{
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ users, setUsers, showNotification }) => {
    const [isAddFormVisible, setAddFormVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const handleDeleteUser = async (userId: string) => {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                if (!apiService.getToken()) {
                    showNotification('Please log in to perform this action', 'error');
                    return;
                }
                await apiService.deleteUser(userId);
                setUsers(prev => prev.filter(u => u.id !== userId));
                showNotification('User deleted successfully', 'success');
            } catch (error: any) {
                showNotification('Failed to delete user: ' + error.message, 'error');
            }
        }
    };

    const handleAddUser = async (newUser: User) => {
        setLoading(true);
        try {
            if (!apiService.getToken()) {
                showNotification('Please log in to perform this action', 'error');
                return;
            }
            await apiService.register({
                email: newUser.email,
                password: newUser.password,
                role: newUser.role,
                name: newUser.name
            });
            // Refresh the user list
            const updatedUsers = await apiService.getUsers();
            setUsers(updatedUsers);
            setAddFormVisible(false);
            showNotification('User created successfully', 'success');
        } catch (error: any) {
            showNotification('Failed to create user: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = async (userData: { name: string; email: string; password?: string }) => {
        if (!editingUser) return;
        setLoading(true);
        try {
            if (!apiService.getToken()) {
                showNotification('Please log in to perform this action', 'error');
                return;
            }
            await apiService.updateUser(editingUser.id, userData);
            // Refresh the user list
            const updatedUsers = await apiService.getUsers();
            setUsers(updatedUsers);
            setEditingUser(null);
            showNotification('User updated successfully', 'success');
        } catch (error: any) {
            showNotification('Failed to update user: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setAddFormVisible(false);
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">User List</h3>
                <button onClick={() => { setAddFormVisible(!isAddFormVisible); setEditingUser(null); }} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                    {isAddFormVisible ? 'Cancel' : '+ Add Kitchen Staff'}
                </button>
            </div>

            {isAddFormVisible && <div className="mb-4"><AddKitchenStaffForm onAddUser={handleAddUser} loading={loading} showNotification={showNotification} /></div>}
            {editingUser && <div className="mb-4"><EditUserForm user={editingUser} onEditUser={handleEditUser} onCancel={handleCancelEdit} loading={loading} showNotification={showNotification} /></div>}

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === UserRole.Admin ? 'bg-red-100 text-red-800' : user.role === UserRole.Kitchen ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    {user.role !== UserRole.Admin && (
                                        <>
                                            <button onClick={() => handleEditClick(user)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                            <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AddKitchenStaffForm: React.FC<{ onAddUser: (user: User) => void; loading: boolean; showNotification: (message: string, type?: 'success' | 'error' | 'info') => void }> = ({ onAddUser, loading, showNotification }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password) {
            showNotification('All fields are required.', 'error');
            return;
        }
        await onAddUser({ id: Date.now(), name, email, password, role: UserRole.Kitchen });
        setName(''); setEmail(''); setPassword('');
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg space-y-3 border border-gray-200">
            <h4 className="font-semibold text-lg">Create Kitchen Staff Account</h4>
            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required/>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" required/>
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded" required/>
            <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors">
                {loading ? 'Creating...' : 'Add Staff'}
            </button>
        </form>
    );
};

const EditUserForm: React.FC<{ user: User; onEditUser: (userData: { name: string; email: string; password?: string }) => void; onCancel: () => void; loading: boolean; showNotification: (message: string, type?: 'success' | 'error' | 'info') => void }> = ({ user, onEditUser, onCancel, loading, showNotification }) => {
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email) {
            showNotification('Name and email are required.', 'error');
            return;
        }
        await onEditUser({ name, email, password: password || undefined });
        setPassword('');
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg space-y-3 border border-gray-200">
            <h4 className="font-semibold text-lg">Edit User</h4>
            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required/>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" required/>
            <input type="password" placeholder="New Password (leave blank to keep current)" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded"/>
            <div className="flex gap-4">
                <button type="submit" disabled={loading} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors">
                    {loading ? 'Updating...' : 'Update User'}
                </button>
                <button type="button" onClick={onCancel} className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition-colors">Cancel</button>
            </div>
        </form>
    );
};


const OrderManagementTab: React.FC<{
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>
}> = ({ orders, setOrders }) => {

    const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      };

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4">All Customer Orders</h3>
            <div className="space-y-4">
                {orders.length > 0 ? orders.map(order => (
                    <div key={order.id} className="bg-white p-4 rounded-lg shadow-md">
                        <div className="flex justify-between items-start flex-wrap">
                            <div>
                                <p className="font-bold text-lg">{order.id}</p>
                                <p className="text-sm text-gray-600">By: {order.userName} on {new Date(order.timestamp).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg">৳{order.totalPrice.toFixed(2)}</p>
                                <p className="text-sm font-semibold capitalize" style={{color: order.status === 'Pending' ? '#f59e0b' : order.status === 'Preparing' ? '#3b82f6' : '#22c55e'}}>{order.status}</p>
                            </div>
                        </div>
                        <div className="mt-4 border-t pt-2">
                           <p className="font-semibold">Items:</p>
                           <ul className="text-sm list-disc list-inside">
                                {order.items.map(item => <li key={item.id}>{item.name} x {item.quantity}</li>)}
                           </ul>
                        </div>
                        <div className="mt-4 flex gap-2 flex-wrap">
                            {order.status === 'Pending' && <button onClick={() => updateOrderStatus(order.id, 'Preparing')} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600">Start Preparing</button>}
                            {order.status === 'Preparing' && <button onClick={() => updateOrderStatus(order.id, 'Ready for Pickup')} className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">Mark as Ready</button>}
                            {order.status === 'Ready for Pickup' && <button onClick={() => updateOrderStatus(order.id, 'Completed')} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">Complete Order</button>}
                        </div>
                    </div>
                )) : <p>No orders have been placed yet.</p>}
            </div>
        </div>
    );
};

const MenuManagementTab: React.FC<{
    menu: MenuItem[];
    setMenu: React.Dispatch<React.SetStateAction<MenuItem[]>>;
    showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ menu, setMenu, showNotification }) => {
    const [isFormVisible, setFormVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSaveItem = async (itemToSave: MenuItem) => {
        setLoading(true);
        try {
            if (!apiService.getToken()) {
                showNotification('Please log in to perform this action', 'error');
                return;
            }
            if (editingItem) {
                await apiService.updateMenuItem(editingItem._id || editingItem.id, itemToSave);
            } else {
                await apiService.createMenuItem(itemToSave);
            }
            // Refresh menu list
            const updatedMenu = await apiService.getMenuItems();
            setMenu(updatedMenu);
            setEditingItem(null);
            setFormVisible(false);
            showNotification('Menu item saved successfully', 'success');
        } catch (error: any) {
            showNotification('Failed to save menu item: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (itemId: string) => {
        if (confirm("Are you sure you want to delete this menu item?")) {
            try {
                if (!apiService.getToken()) {
                    showNotification('Please log in to perform this action', 'error');
                    return;
                }
                await apiService.deleteMenuItem(itemId);
                setMenu(prev => prev.filter(item => item.id !== itemId));
                showNotification('Menu item deleted successfully', 'success');
            } catch (error: any) {
                showNotification('Failed to delete menu item: ' + error.message, 'error');
            }
        }
    };

    const handleEditClick = (item: MenuItem) => {
        setEditingItem(item);
        setFormVisible(true);
    };

    const handleCancel = () => {
        setEditingItem(null);
        setFormVisible(false);
    }

    return (
        <div>
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Menu Items</h3>
                <button onClick={() => { setEditingItem(null); setFormVisible(!isFormVisible); }} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                    {isFormVisible && !editingItem ? "Cancel" : "+ Add New Item"}
                </button>
            </div>

            {isFormVisible && <MenuItemForm item={editingItem} onSave={handleSaveItem} onCancel={handleCancel} loading={loading} />}

            <div className="bg-white shadow-md rounded-lg overflow-x-auto mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {menu.map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">৳{item.price.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.stockQuantity || 0}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.discountPercent || 0}%</td>
                                <td className="px-6 py-4 whitespace-nowrap">{item.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    <button onClick={() => handleEditClick(item)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                    <button onClick={() => handleDeleteItem(item.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const MenuItemForm: React.FC<{
    item: MenuItem | null;
    onSave: (item: MenuItem) => void;
    onCancel: () => void;
    loading?: boolean;
}> = ({ item, onSave, onCancel, loading = false }) => {
    const [formData, setFormData] = useState<Omit<MenuItem, 'id'>>({
        name: item?.name || '',
        description: item?.description || '',
        price: item?.price || 0,
        category: item?.category || MenuCategory.Snacks,
        imageUrl: item?.imageUrl || 'https://picsum.photos/400/300',
        isSpecial: item?.isSpecial || false,
        stockQuantity: item?.stockQuantity || 0,
        discountPercent: item?.discountPercent || 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({...prev, [name]: type === 'number' ? parseFloat(value) : value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: item?.id || '', ...formData });
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg space-y-3 border border-gray-200">
            <h4 className="font-semibold text-lg">{item ? 'Edit Menu Item' : 'Add New Menu Item'}</h4>
            <input name="name" type="text" placeholder="Name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required/>
            <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded" required />
            <input name="price" type="number" placeholder="Price" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded" required/>
            <input name="stockQuantity" type="number" placeholder="Stock Quantity" value={formData.stockQuantity} onChange={handleChange} className="w-full p-2 border rounded" min="0"/>
            <input name="discountPercent" type="number" placeholder="Discount Percent" value={formData.discountPercent} onChange={handleChange} className="w-full p-2 border rounded" min="0" max="100"/>
            <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded">
                {Object.values(MenuCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input name="imageUrl" type="text" placeholder="Image URL" value={formData.imageUrl} onChange={handleChange} className="w-full p-2 border rounded" required/>
            <div className="flex items-center gap-2">
                <input name="isSpecial" id="isSpecial" type="checkbox" checked={formData.isSpecial} onChange={handleChange} className="h-4 w-4 rounded"/>
                <label htmlFor="isSpecial">Is Special Offer?</label>
            </div>
            <div className="flex gap-4">
                <button type="submit" disabled={loading} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors">
                    {loading ? "Saving..." : "Save Item"}
                </button>
                <button type="button" onClick={onCancel} className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition-colors">Cancel</button>
            </div>
        </form>
    );
};

const AnalyticsTab: React.FC<{ orders: Order[]; menu: MenuItem[] }> = ({ orders, menu }) => {
    const stats = useMemo(() => {
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        const totalOrders = orders.length;

        const itemSales = new Map<string, number>();
        orders.forEach(order => {
            order.items.forEach(item => {
                itemSales.set(item.name, (itemSales.get(item.name) || 0) + item.quantity);
            });
        });

        const popularItems = Array.from(itemSales.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return { totalRevenue, totalOrders, popularItems };
    }, [orders]);

    return (
        <div>
             <h3 className="text-xl font-semibold mb-4">Canteen Analytics</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h4 className="text-gray-500 text-sm font-medium">Total Revenue</h4>
                    <p className="text-3xl font-bold">৳{stats.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h4 className="text-gray-500 text-sm font-medium">Total Orders</h4>
                    <p className="text-3xl font-bold">{stats.totalOrders}</p>
                </div>
             </div>
             <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                <h4 className="text-lg font-semibold mb-2">Most Popular Items</h4>
                {stats.popularItems.length > 0 ? (
                    <ol className="list-decimal list-inside">
                        {stats.popularItems.map(([name, quantity]) => <li key={name}>{name}: <span className="font-semibold">{quantity}</span> sold</li>)}
                    </ol>
                ) : <p>No sales data yet.</p>}
             </div>
        </div>
    );
};

const AIInsightsTab: React.FC<{ orders: Order[]; menu: MenuItem[] }> = ({ orders, menu }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [recommendation, setRecommendation] = useState('');

    const handleGetRecommendation = async () => {
        setIsLoading(true);
        setRecommendation('');

        const salesData = orders.flatMap(o => o.items).reduce((acc, item) => {
            acc[item.name] = (acc[item.name] || 0) + item.quantity;
            return acc;
        }, {} as Record<string, number>);

        const prompt = `
            As an expert consultant for a university canteen in Bangladesh, analyze the following data and provide a strategic recommendation.

            MENU:
            ${JSON.stringify(menu, null, 2)}

            SALES DATA (Item Name: Quantity Sold):
            ${JSON.stringify(salesData, null, 2)}

            REQUEST:
            Based on the menu and sales data, recommend ONE specific item to feature as a "Special Offer" for the next week. Your goal is to increase overall student footfall and sales. Justify your choice with a brief, data-driven explanation.
        `;

        const result = await getAiRecommendation(prompt);
        setRecommendation(result);
        setIsLoading(false);
    };

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4">AI-Powered Insights</h3>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h4 className="text-lg font-semibold">Get a Strategic Recommendation</h4>
                <p className="text-gray-600 mb-4">Let our AI analyze your sales data and menu to suggest the next best move to boost your sales.</p>
                <button onClick={handleGetRecommendation} disabled={isLoading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400">
                    {isLoading ? 'Analyzing...' : 'Generate Recommendation'}
                </button>

                {isLoading && <p className="mt-4">Getting recommendation from AI, please wait...</p>}
                {recommendation && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                         <h5 className="font-bold mb-2">AI Recommendation:</h5>
                         <p className="whitespace-pre-wrap">{recommendation}</p>
                    </div>
                )}
            </div>
        </div>
    );
};


const SettingsTab: React.FC<{
    canteenName: string;
    setCanteenName: React.Dispatch<React.SetStateAction<string>>;
    showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}> = ({ canteenName, setCanteenName, showNotification }) => {
    const [name, setName] = useState(canteenName);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setCanteenName(name);
        showNotification('Settings saved successfully!', 'success');
    };

    return (
        <div>
            <h3 className="text-xl font-semibold mb-4">Canteen Settings</h3>
             <div className="bg-white p-6 rounded-lg shadow-md">
                <form onSubmit={handleSave}>
                    <label htmlFor="canteenName" className="block text-sm font-medium text-gray-700">Canteen Name</label>
                    <input type="text" id="canteenName" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full max-w-md px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    <button type="submit" className="mt-4 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark">Save Settings</button>
                </form>
             </div>
        </div>
    )
};

// --- Main Dashboard Component ---

interface AdminDashboardProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    menu: MenuItem[];
    setMenu: React.Dispatch<React.SetStateAction<MenuItem[]>>;
    canteenName: string;
    setCanteenName: React.Dispatch<React.SetStateAction<string>>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  // Load users and menu items from API on component mount
  React.useEffect(() => {
    const loadUsers = async () => {
      try {
        if (!apiService.getToken()) {
          showNotification('Please log in to access admin features', 'error');
          return;
        }
        const users = await apiService.getUsers();
        props.setUsers(users);
      } catch (error) {
        console.error('Failed to load users:', error);
        showNotification('Failed to load users: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
      }
    };

    const loadMenuItems = async () => {
      try {
        if (!apiService.getToken()) {
          return;
        }
        const menuItems = await apiService.getMenuItems();
        props.setMenu(menuItems);
      } catch (error) {
        console.error('Failed to load menu items:', error);
        showNotification('Failed to load menu items: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
      }
    };

    loadUsers();
    loadMenuItems();
  }, []);

  const tabs = {
    analytics: { label: 'Analytics', component: <AnalyticsTab orders={props.orders} menu={props.menu} />},
    users: { label: 'User Management', component: <UserManagementTab users={props.users} setUsers={props.setUsers} showNotification={showNotification} /> },
    orders: { label: 'Order Management', component: <OrderManagementTab orders={props.orders} setOrders={props.setOrders} /> },
    menu: { label: 'Menu Management', component: <MenuManagementTab menu={props.menu} setMenu={props.setMenu} showNotification={showNotification} /> },
    ai: { label: 'AI Insights', component: <AIInsightsTab orders={props.orders} menu={props.menu} /> },
    settings: { label: 'Settings', component: <SettingsTab canteenName={props.canteenName} setCanteenName={props.setCanteenName} showNotification={showNotification} /> }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-light min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
          {Object.entries(tabs).map(([key, { label }]) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {tabs[activeTab as keyof typeof tabs].component}
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}

    </div>
  );
};

export default AdminDashboard;
