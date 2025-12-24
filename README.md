# GLOWING-WEBSITE-LIVE

*Unleash Radiance, Elevate Skin Confidence Instantly*

![last commit](https://img.shields.io/github/last-commit/yourusername/glowing-website?label=last%20commit&color=blue)
![html](https://img.shields.io/badge/html-54.9%25-orange)
![languages](https://img.shields.io/badge/languages-3-blue)

**Built with the tools and technologies:**

![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![JSON](https://img.shields.io/badge/JSON-000000?style=flat&logo=json&logoColor=white)
![Markdown](https://img.shields.io/badge/Markdown-000000?style=flat&logo=markdown&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?style=flat&logo=npm&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat&logo=mongoose&logoColor=white)
![.ENV](https://img.shields.io/badge/.ENV-ECD53F?style=flat&logo=dotenv&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?style=flat&logo=nodemon&logoColor=white)
![Passport](https://img.shields.io/badge/Passport-34E27A?style=flat&logo=passport&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat&logo=cloudinary&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat&logo=axios&logoColor=white)

---

## Glowing – Premium Skincare Full-Stack Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/database-MongoDB-green)](https://www.mongodb.com/)
[![Aesthetics](https://img.shields.io/badge/Aesthetics-Premium-gold)](https://glowing.com)

Glowing is a full-stack e-commerce web application developed as an academic project, focused on clean architecture, modular design, and practical implementation of modern web technologies. The project demonstrates the integration of a responsive frontend with a secure Node.js backend and a MongoDB database.

## Full-Stack Overview

This project represents an end-to-end web solution consisting of:

### Client Side (Frontend)
A multi-page responsive interface including Shop, Collections, Blog, About, Contact, and Checkout flows.

### Admin Interface
A dashboard designed for managing products, users, and order-related data.

### Backend API
A Node.js and Express-based server responsible for authentication, database operations, and API handling.

## Core Features

### Frontend Features
- **Modular JavaScript architecture** for core systems such as Cart, Wishlist, Recently Viewed, and Authentication.
- **Fully responsive layout** with mobile-friendly navigation and adaptive UI components.
- **Dynamic product listing** with category-based filtering and client-side interactions.
- **User experience enhancements** including hover effects, lazy-loaded images, and smooth UI transitions.
- **Integration** with backend authentication services.

### Admin Dashboard
- **Data visualization** using Chart.js to display order and user-related information.
- **Product management interface** supporting Create, Read, Update, and Delete (CRUD) operations.
- **User monitoring functionality** to review registered users.
- **Order status management** for administrative control.

### Backend Functionality
- **RESTful API architecture** following MVC principles.
- **MongoDB database integration** using Mongoose.
- **Secure user authentication** using JWT.
- **Google OAuth 2.0 integration** via Passport.js.
- **Password hashing** using bcrypt.
- **Role-based access control** for protected admin routes.
- **Image upload handling** using Multer (local storage).

## Tech Stack

### Frontend
- HTML5
- CSS3 (Vanilla CSS)
- JavaScript (ES6+)
- Chart.js
- Ionicons

### Backend
- Node.js
- Express.js

### Database
- MongoDB
- Mongoose

### Authentication
- JSON Web Tokens (JWT)
- Passport.js (Google OAuth 2.0)

### File Handling
- Multer (local image storage)

## Local Setup

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and configure:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```
4. Run the server in development mode:
   ```bash
   npm run dev
   ```

### Frontend Setup
- No build step required.
- Open `frontend/index.html` using Live Server or directly in a browser.
- Ensure the backend server is running on port 5000 for full functionality.

## API Overview

Sample API endpoints implemented in the backend:

### Authentication
- `POST /api/auth/register` – User registration
- `POST /api/auth/login` – User login
- `GET /api/auth/logout` – User logout
- `GET /api/auth/me` – Get current user details
- `GET /api/auth/google` – Google OAuth login
- `GET /api/auth/admin/users` – Get all users (Admin only)

### Products
- `GET /api/products` – Fetch all products
- `GET /api/products/:id` – Fetch a single product
- `POST /api/products` – Add a new product (Admin only)
- `PUT /api/products/:id` – Update an existing product (Admin only)
- `DELETE /api/products/:id` – Delete a product (Admin only)

### Orders
- `POST /api/orders/new` – Place a new order
- `POST /api/orders/verify-payment` – Verify payment status
- `GET /api/orders/me` – Get currently logged-in user's orders
- `GET /api/orders/:id` – Get single order details
- `GET /api/orders/admin/all` – Get all store orders (Admin only)
- `PUT /api/orders/admin/:id` – Update order status (Admin only)

## Project Structure

```text
frontend/
 ├── assets/
 │   ├── css/
 │   └── js/
 ├── images/
 ├── pages/
 └── index.html

backend/
 ├── config/
 ├── controllers/
 ├── models/
 ├── routes/
 ├── middleware/
 ├── utils/
 └── server.js
```

## Admin Access

Administrative users are seeded in the database for demonstration purposes. Credentials can be configured directly through the database.

## Developer

Developed by **Muhammad Abdul Rashid**