# Academic E-commerce Backend

A production-ready Node.js backend for an academic e-commerce system.

## Tech Stack
- **Node.js & Express.js**
- **MongoDB & Mongoose**
- **JWT & Passport (Google OAuth)**
- **Cloudinary** (Image Storage)
- **PayPal** (Payments)

## Prerequisites
- Node.js installed
- MongoDB URI (already provided in `.env`)
- Cloudinary Account
- Google Cloud Console Project (for OAuth)
- PayPal Developer Account (for Sandbox)

## Setup
1. Navigate to the `backend` folder.
2. Run `npm install`.
3. Fill in the missing environment variables in `.env`:
   - `JWT_SECRET`: A random strong string.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
   - `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`.
4. Start the server:
   - `npm start` (Production)
   - `npm run dev` (Development with Nodemon)

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user (Private)
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders
- `POST /api/orders/new` - Create new order (Private)
- `GET /api/orders/me` - Get logged-in user's orders (Private)
- `GET /api/orders/:id` - Get single order (Private)
- `POST /api/orders/verify-payment` - Verify PayPal payment (Private)
- `GET /api/orders/admin/all` - Get all orders (Admin only)
- `PUT /api/orders/admin/:id` - Process order (Admin only)

## Project Structure
- `config/`: Configuration files (DB, Passport, Cloudinary)
- `controllers/`: Request handlers
- `models/`: Mongoose schemas
- `routes/`: API route definitions
- `middleware/`: Custom middleware (Auth, Error handling)
- `utils/`: Utility classes/functions
