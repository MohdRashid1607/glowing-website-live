# ✨ Glowing - Premium Skincare E-commerce Platform ✨

![Glowing Banner](https://raw.githubusercontent.com/MohdRashid1607/assignment-100-tomorrow-s-web-MohdRashid1607/main/frontend/assets/images/logo.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/database-MongoDB-green)](https://www.mongodb.com/)
[![Aesthetics](https://img.shields.io/badge/Aesthetics-Premium-gold)](https://glowing.com)

**Glowing** is a sophisticated, full-stack e-commerce application designed for premium skincare products. It features a stunning glassmorphism design, real-time data synchronization, and a powerful admin ecosystem to manage every aspect of a modern online store.

---

## 🖼️ Featured Pages

- **Home (`index.html`)**: A breathtaking landing page featuring a hero carousel, promotional cards, and newsletter integration.
- **Shop (`shop.html`)**: The core shopping experience with dynamic product loading, advanced filtering, and a seamless Quick View modal.
- **Admin Dashboard (`admin.html`)**: A high-tech control center with dark-mode analytics, user management, and order status tracking.
- **Checkout & Cart**: A streamlined, single-page checkout flow with PayPal and COD support.

---

## 🚀 Key Features

### 🛍️ Customer Experience
- **Premium Aesthetics**: Crafted with a focus on modern typography, sleek gradients, and micro-animations.
- **Smart Search**: Real-time product searching across the entire inventory.
- **Interactive Cart & Wishlist**: Persistent state management using LocalStorage and Backend sync.
- **Google OAuth**: One-tap secure login for a frictionless user experience.
- **Recently Viewed**: Context-aware product history to keep customers engaged.
- **Responsive Layouts**: Meticulously tested for mobile performance and accessibility.

### ⚙️ Admin Intelligence
- **Data Visualization**: Interactive graphs for revenue tracking and category performance.
- **Inventory Control**: Real-time stock alerts and bulk product management.
- **User Auditing**: Monitor new signups and manage administrative permissions.
- **Live Sync**: Every 60 seconds, the dashboard refreshes with the latest orders from the backend.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3 (Vanilla), JavaScript (ES6+), Ionicons, Chart.js |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Auth** | JSON Web Tokens (JWT), Passport.js (Google OAuth 2.0) |
| **Tools** | Multer (File Uploads), Dotenv, CORS, Bcrypt.js |

---

## 📦 Getting Started

### Prerequisites
- Node.js installed on your machine.
- A MongoDB database (Local or Atlas).

### 1. Clone the Repository
```bash
git clone https://github.com/MohdRashid1607/assignment-100-tomorrow-s-web-MohdRashid1607.git
cd assignment-100-tomorrow-s-web-MohdRashid1607
```

### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your credentials:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   GOOGLE_CLIENT_ID=your_id
   GOOGLE_CLIENT_SECRET=your_secret
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
Simply open `index.html` (root) or the landing page in your browser.
- Uses local storage for immediate persistence.
- Connects to `http://localhost:5000/api` for real-time operations.

---

## 📂 Project Structure

```bash
📦 glowing-ecommerce
 ┣ 📂 backend            # Node.js/Express Server
 ┃ ┣ 📂 models           # Mongoose Schemas (User, Product, Order)
 ┃ ┣ 📂 routes           # API endpoints
 ┃ ┣ 📂 middleware       # Auth and Upload handling
 ┃ ┗ 📜 server.js        # Entry point
 ┣ 📂 frontend           # Client-side files
 ┃ ┣ 📂 assets           # CSS, Images, JS Modules
 ┃ ┣ 📂 pages            # Admin, Shop, Collection, Blog
 ┃ ┗ 📜 index.html       # Homepage
 ┗ 📜 README.md          # Project Documentation
```

---

## 🔐 Admin Access
To access the Admin Panel (`/frontend/pages/admin.html`):
- **Test Email**: `admin@test.com`
- **Test Password**: `admin123`

---

## 👨‍💻 Developed By
**Muhammad Abdul Rashid**  
*Front-end & Back-end Developer*

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ for a Seamless Beauty Shopping Experience
</p>
