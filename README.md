# Synra Market 🛒

A production-ready, Amazon-like e-commerce platform built with **Next.js 14**, **MongoDB**, **Stripe**, and **Nodemailer**.

---

## ✨ Features

- 🛍️ Product listing, search & pagination (100k items)
- 👤 JWT-based Authentication (register / login)
- ❤️ Wishlist system
- ⭐ Product reviews & ratings
- 🛒 Cart with Stripe Checkout (INR)
- 📦 Order tracking with visual timeline
- 🚫 Order cancellation
- 📧 Email notifications (order confirmed, status updated)
- 🔐 Admin Dashboard (manage products, orders, analytics)
- 📊 Real-time analytics (revenue, top products, 7-day chart)
- 🔒 Security headers on all routes

---

## 🚀 Getting Started (Local Development)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/synra-market.git
cd synra-market
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
# Then edit .env.local with your actual values
```

### 4. Seed the database

```bash
node seed-massive.mjs
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deployment (Vercel + MongoDB Atlas)

### Step 1: Set up MongoDB Atlas (Free)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create a free account
2. Create a new **Free (M0)** cluster
3. Create a database user (username + password)
4. Whitelist IP: `0.0.0.0/0` (allow all — required for Vercel)
5. Get your connection string:
   ```
   mongodb+srv://<user>:<password>@cluster.mongodb.net/synra_market
   ```

### Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/synra-market.git
git push -u origin main
```

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → Import your GitHub repository
2. Add all environment variables in Vercel → Project Settings → Environment Variables:

| Variable | Value |
|---------|-------|
| `MONGODB_URI` | Your Atlas connection string |
| `JWT_SECRET` | A strong random secret (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
| `STRIPE_SECRET_KEY` | `sk_live_...` (or `sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` (or `pk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | From Stripe Dashboard → Webhooks (step 4) |
| `EMAIL_FROM` | Your Gmail address |
| `EMAIL_APP_PASSWORD` | Your Gmail App Password |
| `NEXT_PUBLIC_BASE_URL` | `https://your-app.vercel.app` |

3. Click **Deploy**

### Step 4: Set up Stripe Webhook (Production)

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. URL: `https://your-app.vercel.app/api/webhook`
4. Select event: `checkout.session.completed`
5. Copy the **Signing secret** → paste into `STRIPE_WEBHOOK_SECRET` on Vercel

---

## 📧 Email Setup (Gmail App Password)

1. Enable 2-Step Verification on your Google Account
2. Go to Google Account → Security → [App Passwords](https://myaccount.google.com/apppasswords)
3. Create an app password for "Mail" + "Other device"
4. Copy the 16-character password → paste into `EMAIL_APP_PASSWORD`

---

## 🧪 Testing

### Test Stripe Webhook Locally

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/webhook
```

In a second terminal:
```bash
stripe trigger checkout.session.completed
```

### Test Email Sending

After setting `EMAIL_FROM` and `EMAIL_APP_PASSWORD` in `.env.local`, complete a checkout. You should receive a confirmation email at the customer's email address.

### Test Admin Analytics

1. Create an admin user (set `role: 'admin'` in your MongoDB User document)
2. Log in and go to `/admin`
3. The dashboard shows live data from MongoDB

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.js              # Root layout
│   ├── page.js                # Homepage
│   ├── explore/               # Product browsing
│   ├── product/[id]/          # Product detail page
│   ├── wishlist/              # User wishlist
│   ├── orders/
│   │   ├── page.js            # Order history
│   │   └── [id]/page.js       # Order tracking + cancel
│   ├── checkout/
│   │   ├── page.js            # Checkout form
│   │   ├── success/           # Payment success
│   │   └── cancel/            # Payment cancelled
│   ├── login/ & register/     # Auth pages
│   ├── admin/
│   │   ├── page.js            # Analytics dashboard ← NEW
│   │   ├── orders/            # Order management
│   │   └── products/          # Product management
│   └── api/
│       ├── webhook/route.js   # Stripe webhook ← NEW
│       ├── auth/              # login, logout, register, me
│       ├── products/          # Product listing + search
│       ├── orders/[id]/       # User order fetch + cancel
│       ├── reviews/           # Product reviews
│       ├── wishlist/          # Wishlist CRUD
│       ├── checkout_sessions/ # Stripe session creation
│       └── admin/
│           ├── analytics/     # Real-time stats ← NEW
│           ├── orders/        # Admin order management
│           └── products/      # Admin product management
├── components/                # Navbar, Cart, ProductCard…
├── context/                   # AuthContext, CartContext
├── lib/
│   ├── mongodb.js
│   ├── auth.js
│   └── email.js               # Nodemailer utility ← NEW
└── models/                    # Order, Product, Review, User, Wishlist
```

---

## 🔒 Security Features

- All admin routes protected with `requireAdmin` middleware
- Users can only view/cancel their own orders
- Stripe webhook signature verified on every request
- HTTP security headers on all responses (X-Frame-Options, CORS, XSS protection)
- JWT stored in httpOnly cookies

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 App Router, React 18 |
| Styling | Vanilla CSS + Google Fonts |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcryptjs |
| Payments | Stripe Checkout |
| Email | Nodemailer + Gmail SMTP |
| Deployment | Vercel |
| Icons | Lucide React |
