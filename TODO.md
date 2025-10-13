# Database Integration Tasks

## Backend Setup
- [x] Create backend directory
- [x] Initialize Node.js project with package.json
- [x] Install dependencies: express, mongoose, cors, dotenv, bcryptjs, jsonwebtoken
- [x] Create server.js with MongoDB connection
- [x] Set up middleware (CORS, JSON parsing)

## Database Models
- [x] Create User model (id, email, password, role, name, studentId)
- [x] Create MenuItem model (id, name, description, price, category, imageUrl, isSpecial)
- [x] Create Order model (id, userId, userName, items, totalPrice, status, timestamp)

## API Routes
- [x] User routes: login, signup, get users (admin)
- [x] Menu routes: get menu, add/edit/delete items (admin)
- [x] Order routes: place order, get orders, update status (kitchen/admin)

## Authentication
- [x] Implement JWT authentication middleware
- [x] Protect admin/kitchen routes

## Testing
- [x] Test MongoDB connection
- [x] Test API endpoints with Postman or curl
- [ ] Seed initial data if needed

## Frontend Integration (Optional)
- [ ] Update frontend to use API calls instead of local state
- [ ] Handle authentication tokens
- [ ] Update components to fetch data from backend

## Database Update Task
- [x] Update MongoDB connection URI in server.js to connect to 'greenCanteenDb'
- [x] Add code to drop the old 'test' database after establishing connection
- [x] Run backend server to verify connection and database drop
- [x] Test API endpoints to ensure operations work in the new database

## User Account System Update
- [x] Update User model to support Student, Faculty, and Others roles
- [x] Update SignUpPage to include role selector and conditional studentId field
- [x] Update AdminDashboard to display role badges for Faculty and Others
- [x] Test registration for all role types (Student, Faculty, Others)

## Menu Management Fixes
- [x] Fix createMenuItem to exclude id field from POST requests
- [x] Test menu CRUD operations (Create, Read, Update, Delete)

## Order Management Fixes
- [x] Fix order creation to include userId and userName from JWT token
- [x] Test order placement and retrieval

## User Registration Updates
- [x] Update SignUpPage with stylish horizontal radio buttons for account types
- [x] Remove Admin and Kitchen options from signup page - only show Student, Faculty, Others
- [x] Redesign SignUpPage with modern, complex UI including gradient background, icons, enhanced styling, and improved user experience
- [x] Redesign LoginPage with modern, complex UI matching the signup page design
- [x] Allow all user types (Student, Faculty, Others, Admin, Kitchen) to register publicly except Admin/Kitchen which require admin auth
- [x] Enable ordering functionality for all authenticated users including Admin and Kitchen staff

## Universal Buying Capability
- [x] Remove role restrictions for checkout - all authenticated users can place orders
- [x] Update navigation bar to show Menu/Offers links for all logged-in users
- [x] Enable cart functionality for all authenticated users (Admin, Kitchen, Faculty, Others, Student)
- [x] Fix type compatibility issues (userId as string, itemId as string)
