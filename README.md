# Glowing - Premium Skincare Fullstack Platform

A high-performance e-commerce ecosystem built with a focus on premium aesthetics and robust functionality. This project covers everything from a liquid-smooth frontend experience to a comprehensive management dashboard and a secure Node.js backend.

## �️ Full-Stack Overview

This project is a complete end-to-end solution featuring:
- **Client Side**: 10+ responsive pages including Shop, Collection, Blog, and a custom Checkout flow.
- **Admin Side**: A desktop-optimized dashboard for managing sales, users, and inventory.
- **Backend API**: A Node.js/Express server handling authentication, database operations, and file uploads.

---

## 🚀 Core Features

### � Frontend Excellence
- **Custom JS Systems**: Decoupled systems for `Cart`, `Wishlist`, `QuickView`, and `RecentlyViewed` to ensure high performance.
- **Responsive Navigation**: Full mobile support with a custom-built sidebar and sticky header logic.
- **Dynamic Shop**: Advanced product grid with real-time filtering (Category, Brand, Price, Rating) without page reloads.
- **UX Details**: Micro-animations, hover effects, image lazy-loading, and a preloader for a premium feel.
- **Auth Flow**: Integrated Google OAuth and traditional JWT login/signup with custom validations.

### 📊 Admin Intelligence
- **Real-time Stats**: Interactive data visualization using **Chart.js** (Revenue logs, Order status, Category performance).
- **Inventory Control**: Full CRUD interface to add, delete, and modify products with automatic sync across the site.
- **User Auditing**: Management portal to monitor customer registrations and administrative roles.
- **Order Processing**: Live order tracking system allowing admins to update shipment statuses.

### 🔐 Secure Backend
- **RESTful API**: Structured endpoints for all e-commerce operations.
- **Database**: MongoDB integration via Mongoose with optimized schemas for Orders and Users.
- **Security**: Password hashing with Bcrypt, JWT session management, and protected Admin routes.
- **Integrations**: Supports PayPal and Cash on Delivery (COD) payment modes.

---

## � Tech Stack

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+), Ionicons, Chart.js.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB, Mongoose.
- **Authentication**: JWT, Passport.js (Google OAuth 2.0).
- **Storage**: Multer for local product images.

---

## 📦 Local Setup

### Backend (Server)
1. Go to the `backend` directory: `cd backend`
2. Install packages: `npm install`
3. Configure your `.env`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_id
   GOOGLE_CLIENT_SECRET=your_google_secret
   ```
4. Run the server: `npm run dev`

### Frontend (Client)
- No build step required. Open `index.html` via Live Server or simply drag into any browser.
- Ensure the backend is running on port 5000 for full functionality.

---

## 📂 Project Structure

- `frontend/`: All client-side assets, pages, and logic.
  - `assets/css/`: Modular stylesheets.
  - `assets/js/`: Core systems (Cart, Auth, Shop).
  - `pages/`: Admin, Shop, Blog, etc.
- `backend/`: Server-side logic.
  - `models/`: Database schemas.
  - `routes/`: API controllers.
- `root/`: Project documentation and config files.

---

## � Admin Credentials
To access the Dashboard (`/frontend/pages/admin.html`):
- **Email**: `admin@test.com`
- **Password**: `admin123`

---

**Developed by Muhammad Abdul Rashid**
