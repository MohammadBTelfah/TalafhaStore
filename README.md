# 🛒 TalafhaStore

TalafhaStore is a full-featured e-commerce web application built with **React.js, Node.js, Express, and MongoDB**, styled with **Material-UI** and **CSS** 
The project took me a full month of continuous work (from late July until the end of August 2025).

---

## 📆 Development Timeline

| Date        | Task Completed                                                                 |
|-------------|---------------------------------------------------------------------------------|
| 30/07/2025  | Built the **Backend** (server setup, database models, and REST APIs).           |
| 04/08/2025  | Implemented **Login / Register** system with password hashing.                  |
| 07/08/2025  | Designed **Dashboard** pages with Dark Mode support.                            |
| 10/08/2025  | Created the **Contact Us** page with full Dark Mode support.                    |
| 12/08/2025  | Created the **About Us** page with full Dark Mode support.                      |
| 16/08/2025  | Designed the **Home** page with full Dark Mode support.                         |
| 17/08/2025  | Added **Products** module (create, edit, delete categories & items).             |
| 23/08/2025  | Built the **Checkout** flow with 3 steps (Cart → Payment → Summary).            |
| 23/08/2025  | Implemented **Dashboard Stats** (users, orders, revenue, top products).         |
| 30/08/2025  | Final touches: UI enhancements, bug fixes, and deployment preparation.          |

---

## 🚀 Features

### 🔐 Secure Login
- JWT-based authentication with short-lived access tokens and refresh flow.  
- Passwords hashed with bcrypt (salted); no plaintext storage.  
- Input validation and sanitized requests to prevent injection attacks.  
- Basic rate limiting and error handling to reduce brute-force attempts.  

### 🎨 UI Design — Fully Responsive & Dark Mode
- Responsive layout across mobile, tablet, and desktop using Material-UI grid and flex utilities.  
- Adaptive typography and spacing; components scale smoothly on all breakpoints.  
- One-click Dark/Light theme toggle with saved user preference.  
- Accessible color contrast and focus states for better usability.  

### 💳 Secure Payment (Integration-Ready)
- Checkout flow ready to integrate with payment providers (e.g., Stripe/PayPal).  
- Card data never touches the server; handled securely by provider SDKs.  
- Server-side verification of payment sessions with idempotency for safe retries.  
- Webhook-ready to confirm payments and update order status automatically.  

### 🛍️ E-Commerce Essentials
- **Product browsing** with categories, filters, and search.  
- **Shopping cart** with quantity management and automatic totals.  
- **Order tracking** (Pending → Processing → Shipped → Completed → Cancelled).  
- **Informational pages**: Home, About Us, Contact Us, Products.  

---

## 👨‍💻 Author

All rights reserved © **Mohammed Telfah**  

🔗 Connect with me:  
- [GitHub](https://github.com/MohammadBTelfah)  
- [LinkedIn](https://www.linkedin.com/in/mohammed-telfah-3ba1a7261/)  
