# Simulasi UAS – Full-Stack E-Commerce

A role-aware e-commerce practice project that pairs a Django REST API with a React single-page app. Customers can discover products, manage carts, and run checkouts, while sellers get a dashboard to curate their own catalog. JWT authentication keeps the sessions secure and the UI switches automatically depending on the user role.

## ✨ Highlights

- **Dual personas** – a single login form branches users into customer or seller experiences based on their `role` claim.
- **JWT authentication** – login returns `access` + `refresh` tokens, persisted in `localStorage` on the client.
- **Seller cockpit** – modern dashboard with search, inventory insights, inline CRUD, and filtering to the logged-in seller only.
- **Customer journey** – product search, cart sidebar, quantity updates, checkout flow, and historical order view.
- **REST-friendly backend** – DRF viewsets for products, carts, cart items, and checkouts with sensible overrides (e.g., `carts/<user_id>/`).

## 🏗️ Architecture at a Glance

```
frontend/ecommerce-app (React 19)
        | axios
        v
http://localhost:8000/api/* (Django 5 + DRF + SimpleJWT)
        |
 SQLite (default) – replaceable via Django settings
```

| Layer      | Tech & Packages | Responsibilities |
|------------|-----------------|------------------|
| Frontend   | React 19, React Router, Axios, Tailwind utility classes | Auth screens, seller dashboard, buyer cart UI, talking to REST API |
| Backend    | Django 5.2, Django REST Framework, SimpleJWT, django-filter, django-cors-headers | User model + auth, product/catalog CRUD, cart & checkout orchestration |
| Database   | SQLite (default) | Development data store; swap via `DATABASES` in `ecommerce/settings.py` |

## 📁 Key Structure

```
Simulasi_UAS/
├── ecommerce/              # Django project (API)
│   ├── users/              # Custom user model, JWT serializers/views
│   ├── products/           # Product, cart, checkout models & endpoints
│   └── ecommerce/          # Global settings, URL routing
├── frontend/
│   └── ecommerce-app/      # React SPA (login/register, BuyerPage, SellerPage)
├── requirements.txt        # Backend Python dependencies
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ (or any version compatible with React Scripts 5)
- npm (bundled with Node)

### 1. Backend (Django + DRF)

```bash
cd ecommerce
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r ../requirements.txt
python manage.py migrate
python manage.py createsuperuser  # optional but handy for admin access
python manage.py runserver
```

> The API now listens on `http://localhost:8000/`. Adjust `ALLOWED_HOSTS`, database settings, or the secret key before production use.

### 2. Frontend (React SPA)

```bash
cd frontend/ecommerce-app
npm install
npm start
```

The development server runs on `http://localhost:3000`. The React app expects the API at `http://localhost:8000`; update the URLs in `src/services/*.js` if you host the backend elsewhere.

### 3. Logging In

1. Register via the UI (or `POST /api/users/register/`). Choose the `seller` role to access the seller dashboard.
2. Log in; the backend returns JWT tokens plus user metadata.
3. The SPA reads the `role` claim to show the Seller or Buyer experience automatically.

## 🔐 Core Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/users/register/` | Create a new `customer` or `seller`
| `POST` | `/api/users/login/` | Obtain JWT tokens and user profile
| `GET/POST` | `/api/products/` | List or create products (seller scoped in UI)
| `PATCH/DELETE` | `/api/products/<id>/` | Update or remove a product
| `GET` | `/api/carts/<user_id>/` | Retrieve latest open cart for a user
| `POST` | `/api/cart-items/` | Add/update items; auto-creates a cart if needed
| `DELETE` | `/api/carts/<cart_id>/clear/` | Remove every item from a cart
| `POST` | `/api/checkouts/` | Convert a cart into a checkout and clear it
| `GET` | `/api/checkouts/user/<user_id>/` | Retrieve purchase history

All protected routes are guarded by `JWTAuthentication` (SimpleJWT). Attach `Authorization: Bearer <access_token>` when mutating resources from external clients.

## 🧩 Feature Overview

### Seller Dashboard
- Real-time filtering so each seller only sees the products they created.
- Inventory cards with pricing, stock count, created date, and quick edit/delete actions.
- Modal form with validation for create/update operations.

### Buyer Experience
- Search-as-you-type filtering across product name and description.
- Slide-over cart with quantity adjustments, removal, and full-cart clearing.
- Checkout flow that snapshots the cart, persists checkout items, and resets the cart.
- Order history panel that expands to show individual checkout contents.

### Authentication & Authorization
- Custom `CustomUser` model with `role` field and email-based login (`USERNAME_FIELD = "email"`).
- Registration validator ensures unique email/username and E.164-ish phone numbers.
- JWT payload enriched with profile info so the frontend can render immediately after login.

## 🧪 Testing

Backend:
```bash
cd ecommerce
python manage.py test
```

Frontend:
```bash
cd frontend/ecommerce-app
npm test
```

## 🧰 Troubleshooting & Tips

- **CORS errors**: confirm the frontend origin (`localhost:3000`) is in `CORS_ALLOWED_ORIGINS`.
- **Tokens expired**: hook up `/api/users/token/refresh/` and refresh the `access` token when needed.
- **Admin data seeding**: use `python manage.py loaddata <fixture>.json` or the admin site at `/admin/`.
- **Switching databases**: edit `DATABASES` in `ecommerce/settings.py` (e.g., Postgres) and install the matching driver.

## 🧭 Roadmap Ideas

- Role-based permissions at the DRF level (currently open endpoints are secured by the client and JWT).
- File uploads for product imagery.
- Stripe/Midtrans integration for payment intents.
- Environment-based config so the React app reads API URLs from `process.env`.

Happy building! ✨
