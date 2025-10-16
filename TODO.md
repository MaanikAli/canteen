# TODO: Fix Frontend-Backend Connection

## Overview
Remove localStorage usage for users, orders, and canteenName. Fetch and update data from backend APIs instead.

## Steps

### 1. Update App.tsx
- [ ] Remove useLocalStorage for users, orders, canteenName
- [ ] Use useState for users, orders (menu already from backend)
- [ ] Add useEffect to fetch users and orders on app start (if logged in)
- [ ] Update handlePaymentSuccess to send order to backend via apiService.createOrder
- [ ] Remove localStorage operations for orders and users
- [ ] Keep canteenName local (no backend endpoint yet)

### 2. Update AdminDashboard.tsx
- [ ] Remove local loading of users and menu (handled in App.tsx)
- [ ] Ensure user and menu management calls backend APIs and updates state

### 3. Update KitchenDashboard.tsx
- [ ] Update updateOrderStatus to call apiService.updateOrderStatus
- [ ] Refresh orders after status update

### 4. Update OrderManagementTab in AdminDashboard
- [ ] Update updateOrderStatus to call backend API

### 5. Test the changes
- [ ] Verify login/signup works with backend
- [ ] Verify order placement sends to backend
- [ ] Verify order status updates work
- [ ] Verify admin/kitchen dashboards show backend data
