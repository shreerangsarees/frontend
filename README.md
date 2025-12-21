# T-Mart - Full-Stack E-Commerce Platform

T-Mart is a feature-rich, full-stack e-commerce application built with the MERN stack (MongoDB, Express, React, Node.js). It includes a responsive storefront, a robust administrative dashboard for management, and real-time features.

## 🚀 Features

### **User Experience**

* **Authentication:** Multi-method login including Local (Email/Password), Google OAuth, and Facebook login.
* **Product Browsing:** Explore products by categories with a responsive UI built using Shadcn UI and Tailwind CSS.
* **Shopping Cart:** Persistent cart management and seamless checkout process.
* **Secure Payments:** Integrated with Razorpay for reliable payment processing.
* **Order Tracking:** Real-time updates on order status using Socket.io.

### **Management Dashboards**

* **Admin Dashboard:** Comprehensive tools for managing products, categories, coupons, and orders.
* **Analytics:** Visual data representation of sales and performance using Recharts.
* **Delivery Dashboard:** Dedicated interface for managing and tracking deliveries.

---

## 🛠️ Tech Stack

### **Frontend**

* **Framework:** React 18 with Vite
* **Language:** TypeScript
* **Styling:** Tailwind CSS & Shadcn UI
* **State Management:** TanStack Query (React Query)
* **Real-time:** Socket.io-client

### **Backend**

* **Environment:** Node.js & Express
* **Database:** MongoDB via Mongoose
* **Authentication:** Passport.js (Local, Google, Facebook)
* **Payment Gateway:** Razorpay
* **Communication:** Socket.io

---

## ⚙️ Getting Started

### **Prerequisites**

* Node.js (v18 or higher recommended)
* MongoDB (Local or Atlas)
* Razorpay Account (for payment keys)
* Google/Facebook Developer accounts (for OAuth)

### **Installation**

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd tmart

```


2. **Frontend Setup:**
```bash
npm install

```


3. **Backend Setup:**
```bash
cd server
npm install

```



### **Environment Configuration**

#### **Frontend (.env)**

Create a `.env` file in the root directory and add the following:

```env
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

```

#### **Backend (server/.env)**

Create a `.env` file in the `server` directory and add the following:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_random_secret_string

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
FACEBOOK_APP_ID=your_facebook_id
FACEBOOK_APP_SECRET=your_facebook_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

```

---

## 🏃 Running the Application

### **Start Backend**

From the `server` directory:

```bash
npm run dev

```

### **Start Frontend**

From the root directory in a new terminal:

```bash
npm run dev

```

### **Seed Database**

To populate the database with initial data, run from the `server` directory:

```bash
npm run seed

```

---

## 📜 Scripts

### **Root (Frontend)**

* `npm run dev`: Starts the Vite development server.
* `npm run build`: Builds the app for production.
* `npm run lint`: Runs ESLint for code quality.

### **Server**

* `npm run dev`: Starts the backend with Nodemon for auto-reloading.
* `npm start`: Runs the compiled production server.
* `npm run build`: Compiles TypeScript to JavaScript.
* `npm run seed`: Executes the database seeding script.
