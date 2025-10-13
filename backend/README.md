# Canteen Backend API

This is the backend service for the Green University Canteen system, built with Node.js, Express, and MongoDB.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your MongoDB URI and JWT secret:
   ```
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-secret-key
   PORT=5000
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Health Check
- `GET /api/health` - Check if server is running

### Users
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users` - Get all users (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get menu item by ID
- `POST /api/menu` - Create new menu item (admin only)
- `PUT /api/menu/:id` - Update menu item (admin only)
- `DELETE /api/menu/:id` - Delete menu item (admin only)

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status

## Data Models

### User
```json
{
  "email": "string",
  "password": "string",
  "role": "student|kitchen|admin",
  "name": "string",
  "studentId": "string (optional, for students)"
}
```

### MenuItem
```json
{
  "name": "string",
  "description": "string",
  "price": "number",
  "category": "Main Course|Snacks|Dessert|Drinks",
  "imageUrl": "string",
  "isSpecial": "boolean"
}
```

### Order
```json
{
  "userId": "ObjectId",
  "userName": "string",
  "items": [
    {
      "menuItemId": "ObjectId",
      "name": "string",
      "price": "number",
      "quantity": "number"
    }
  ],
  "totalPrice": "number",
  "status": "Pending|Preparing|Ready for Pickup|Completed"
}
```

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Testing

You can test the API using tools like Postman or curl:

```bash
# Health check
curl http://localhost:5000/api/health

# Get menu
curl http://localhost:5000/api/menu

# Register user
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password","role":"student","name":"Test User","studentId":"12345"}'
