# Canteen Backend

Backend service for the Green University Canteen management system built with Node.js, Express, and MongoDB.

## Features

- User authentication and authorization
- Menu management
- Order processing
- Real-time updates with Socket.IO
- File uploads for menu images and settings
- Admin and kitchen staff dashboards

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **File Uploads**: Multer

## Deployment

### Vercel Deployment

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `NODE_ENV`: Set to `production`
3. **Deploy**: Vercel will automatically detect the `vercel.json` configuration

### Render Deployment

1. **Connect your repository** to Render
2. **Create a new Web Service** and select your backend folder
3. **Configure build settings**:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. **Set environment variables**:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `PORT=10000` (or any available port)
5. **Deploy**: Render will build and deploy your application

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile

### Menu Management
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create menu item (admin/kitchen)
- `PUT /api/menu/:id` - Update menu item (admin/kitchen)
- `DELETE /api/menu/:id` - Delete menu item (admin/kitchen)

### Orders
- `GET /api/orders` - Get orders (user: own orders, admin/kitchen: all orders)
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status (admin/kitchen)
- `DELETE /api/orders/:id` - Delete order (admin or completed user orders)

### Settings
- `GET /api/settings` - Get canteen settings
- `PUT /api/settings` - Update settings (admin)

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Run tests:
   ```bash
   npm test
   ```

## Project Structure

```
backend/
├── models/          # Mongoose models
├── routes/          # API route handlers
├── middleware/      # Authentication and other middleware
├── server.js        # Main server file
├── package.json
├── vercel.json      # Vercel deployment config
├── render.yaml      # Render deployment config
└── .env.example     # Environment variables template
```

## License

This project is licensed under the MIT License.
"### Render Deployment"  
""  
"1. Connect your repository to Render"  
"2. Create a new Web Service and select your repository"  
"3. Configure build settings:"  
"   - Root Directory: backend (important!)"  
"   - Build Command: npm install"  
"   - Start Command: npm start"  
"4. Set environment variables:"  
"   - MONGODB_URI"  
"   - JWT_SECRET"  
"   - NODE_ENV=production"  
"   - PORT=10000 (or any available port)"  
"5. Deploy: Render will build and deploy your application" 
"## Deployment"  
""  
"### Prerequisites"  
""  
"Before deploying, ensure you have:"  
""  
"1. **MongoDB Database**: Set up a MongoDB Atlas cluster or local MongoDB instance"  
"2. **Environment Variables**: Prepare the following:"  
"   - MONGODB_URI: Your MongoDB connection string"  
"   - JWT_SECRET: A secure random string (at least 32 characters) for JWT signing"  
""  
"### Vercel Deployment (Serverless)"  
""  
"1. **Install Vercel CLI** (if not already installed):"  
"   npm install -g vercel"  
""  
"2. **Connect your repository** to Vercel:"  
"   cd backend"  
"   vercel --prod"  
"   Or connect via Vercel dashboard by importing your GitHub repository"  
""  
"3. **Set environment variables** in Vercel dashboard or via CLI:"  
"   vercel env add MONGODB_URI"  
"   vercel env add JWT_SECRET"  
"   vercel env add NODE_ENV"  
""  
"4. **Deploy**: Vercel will automatically detect the vercel.json configuration and deploy"  
""  
"### Render Deployment (Web Service)"  
""  
"1. **Connect your repository** to Render:"  
"   - Go to Render Dashboard (https://dashboard.render.com)"  
"   - Click 'New +'  'Web Service'"  
"   - Connect your GitHub repository"  
""  
"2. **Configure the web service**:"  
"   - **Name**: canteen-backend (or your preferred name)"  
"   - **Runtime**: Node"  
"   - **Root Directory**: backend (important!)"  
"   - **Build Command**: npm install"  
"   - **Start Command**: npm start"  
""  
"3. **Set environment variables** in the Environment section:"  
"   - MONGODB_URI: Your MongoDB connection string"  
"   - JWT_SECRET: Your JWT secret key"  
"   - NODE_ENV: production"  
"   - PORT: 10000 (Render will assign this automatically, but you can specify)"  
""  
"4. **Deploy**: Click 'Create Web Service' - Render will build and deploy your application"  
""  
"### Manual Deployment (Alternative)"  
""  
"If you prefer manual deployment to other platforms:"  
""  
"1. **Clone your repository** on the target server"  
"2. **Navigate to backend directory**:"  
"   cd backend"  
"3. **Install dependencies**:"  
"   npm install"  
"4. **Set environment variables**:"  
"   export MONGODB_URI='your_mongodb_uri'"  
"   export JWT_SECRET='your_jwt_secret'"  
"   export NODE_ENV='production'"  
"   export PORT=5000"  
"5. **Start the application**:"  
"   npm start"  
""  
"### Post-Deployment Verification"  
""  
"After deployment, verify your backend is working:"  
""  
"1. **Check the deployment logs** for any errors"  
"2. **Test API endpoints** using tools like Postman or curl:"  
"   curl https://your-backend-url/api/menu"  
"3. **Update your frontend** to use the deployed backend URL instead of http://localhost:5000"  
""  
"### Troubleshooting"  
""  
"**Common Issues:**"  
""  
"- **Port conflicts**: Ensure the specified PORT is available"  
"- **MongoDB connection**: Verify your MONGODB_URI is correct and accessible"  
"- **Environment variables**: Double-check all required variables are set"  
"- **Build failures**: Check that all dependencies are listed in package.json"  
""  
"**Render-specific:**"  
"- Make sure 'Root Directory' is set to backend"  
"- If deployment fails, check the build logs for specific error messages"  
""  
"**Vercel-specific:**"  
"- Serverless functions have execution time limits (10 seconds for hobby plan)"  
"- File uploads may need special handling in serverless environments" 
