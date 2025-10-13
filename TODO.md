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
- [x] Fix bufferMaxEntries error in all route files
- [x] Verify server starts successfully and connects to greenCanteenDb
