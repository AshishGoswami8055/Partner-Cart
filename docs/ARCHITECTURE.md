# PartnerCart — Architecture & Roadmap

This document is the source of truth for project structure, data model, API surface, frontend page map, component architecture and implementation roadmap.

---

## 1. Folder Structure

```
partner-cart/
├── server/
│   ├── src/
│   │   ├── config/             # env, db, cloudinary, razorpay, logger
│   │   ├── constants/          # roles, order status, vendor status, etc.
│   │   ├── controllers/        # request handlers (thin)
│   │   ├── middleware/         # auth, rbac, validate, error, rateLimit, upload
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # Express route definitions, versioned under /api/v1
│   │   ├── services/           # business logic (fat)
│   │   ├── sockets/            # Socket.io namespaces & handlers
│   │   ├── utils/              # ApiResponse, ApiError, asyncHandler, pagination
│   │   ├── validations/        # Zod schemas per resource
│   │   ├── seed/               # seed scripts
│   │   ├── app.js              # express app composition
│   │   └── index.js            # bootstrap (db + http + socket)
│   ├── .env.example
│   └── package.json
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/                # axios client, endpoints per resource
│   │   ├── app/                # store, providers, router root
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/             # primitive design system
│   │   │   ├── layout/         # navbars, sidebars, shells
│   │   │   ├── shared/         # reusable widgets (StatCard, ProductCard, …)
│   │   │   └── charts/
│   │   ├── features/           # feature modules (auth, cart, products, …)
│   │   ├── hooks/
│   │   ├── lib/                # utils, formatters, constants
│   │   ├── pages/              # route-level screens (public/customer/vendor/admin)
│   │   ├── routes/             # router config + protected routes
│   │   ├── store/              # Redux Toolkit slices
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
├── docs/
│   └── ARCHITECTURE.md
└── README.md
```

---

## 2. Data Model Plan

All schemas use Mongoose, soft timestamps, and indices on hot query paths.

### 2.1 Core entities

| Model              | Purpose                                                                 |
|--------------------|-------------------------------------------------------------------------|
| `User`             | All accounts (customer/vendor/admin) with role, auth, profile, refresh tokens |
| `VendorApplication`| Onboarding request submitted by a user to become a vendor               |
| `Vendor`           | Approved vendor profile (store, branding, tier, status, performance)    |
| `Category`         | Hierarchical product categories                                         |
| `Product`          | Per-vendor product with variants, inventory, ratings                    |
| `Cart`             | Per-customer multi-vendor cart                                          |
| `Wishlist`         | Per-customer favorite products                                          |
| `Order`            | Top-level order; contains one or more `OrderGroup`s split by vendor     |
| `OrderItem`        | Embedded inside `OrderGroup`                                            |
| `Review`           | Product review + rating, with moderation state                          |
| `Message` / `Conversation` | Real-time chat between customer and vendor                       |
| `Notification`     | Per-user notification with type, payload, read state                    |
| `Coupon`           | Platform-wide or vendor-scoped coupons                                  |
| `Address`          | Saved customer addresses                                                |
| `AnalyticsSnapshot`| Daily aggregate snapshots for fast dashboards                           |
| `AuditLog`         | Privileged actions trail (admin/vendor moderation)                      |

### 2.2 Key relationships

```
User (1)──(0..1) Vendor
User (1)──(0..*) Address
User (1)──(0..*) Order
Vendor (1)──(0..*) Product
Category (1)──(0..*) Product
Order (1)──(1..*) OrderGroup ──(1..*) OrderItem
Order.orderGroups[i].vendor → Vendor
Product (1)──(0..*) Review
Conversation (1)──(0..*) Message
User (1)──(0..*) Notification
```

### 2.3 Order lifecycle

`pending → confirmed → preparing → shipped → out_for_delivery → delivered`
plus terminal states `cancelled`, `returned`, `refunded`.

Each `OrderGroup` (per vendor) owns its own status, so a single customer order can have multiple vendor fulfillment timelines.

### 2.4 Vendor status & tier

- Status: `pending | verified | suspended | rejected`
- Tier: `basic | premium | verified`
- Tier and status are independent; only `verified`/`premium` may sell.

### 2.5 Commission

`Vendor.commissionRate` (percent). For each `OrderGroup`, platform takes:
`commission = subtotal * vendor.commissionRate / 100` recorded on the group.

---

## 3. API Route Plan

All routes versioned under `/api/v1`. Standardized response envelope:

```json
{
  "success": true,
  "message": "OK",
  "data": { ... },
  "meta":  { "page": 1, "limit": 20, "total": 137 }
}
```

### 3.1 Auth (`/auth`)

| Method | Path                  | Auth | Description                             |
|--------|-----------------------|------|-----------------------------------------|
| POST   | `/register`           | -    | Customer signup                         |
| POST   | `/login`              | -    | Login (returns access + sets refresh)   |
| POST   | `/refresh`            | -    | Rotate refresh token                    |
| POST   | `/logout`             | any  | Revoke current refresh token            |
| GET    | `/me`                 | any  | Current user profile                    |
| POST   | `/forgot-password`    | -    | Request reset email                     |
| POST   | `/reset-password`     | -    | Reset password with token               |
| PATCH  | `/update-password`    | any  | Change password while logged in         |

### 3.2 Users (`/users`)

| Method | Path             | Auth   | Description                       |
|--------|------------------|--------|-----------------------------------|
| GET    | `/`              | admin  | List users (filter, paginate)     |
| GET    | `/:id`           | admin  | Get any user                      |
| PATCH  | `/me`            | any    | Update own profile                |
| PATCH  | `/:id/block`     | admin  | Block/unblock                     |
| GET    | `/me/addresses`  | any    | Saved addresses                   |
| POST   | `/me/addresses`  | any    | Add address                       |
| PATCH  | `/me/addresses/:aid` | any | Update address                    |
| DELETE | `/me/addresses/:aid` | any | Delete address                    |

### 3.3 Vendors (`/vendors`)

| Method | Path                | Auth      | Description                         |
|--------|---------------------|-----------|-------------------------------------|
| POST   | `/applications`     | any       | Submit vendor application           |
| GET    | `/applications`     | admin     | List applications                   |
| PATCH  | `/applications/:id` | admin     | Approve/reject application          |
| GET    | `/`                 | -         | Public vendor directory             |
| GET    | `/:slug`            | -         | Public vendor profile               |
| GET    | `/me/store`         | vendor    | Own store                           |
| PATCH  | `/me/store`         | vendor    | Update store branding               |
| GET    | `/me/analytics`     | vendor    | Vendor analytics                    |

### 3.4 Categories (`/categories`)

CRUD by admin, public read.

### 3.5 Products (`/products`)

| Method | Path        | Auth    | Description                                    |
|--------|-------------|---------|------------------------------------------------|
| GET    | `/`         | -       | Search/filter/sort/paginate                    |
| GET    | `/:slug`    | -       | Product detail                                 |
| POST   | `/`         | vendor  | Create product (own store)                     |
| PATCH  | `/:id`      | vendor  | Update own product                             |
| DELETE | `/:id`      | vendor  | Soft-delete                                    |
| POST   | `/bulk`     | vendor  | Bulk upload                                    |
| PATCH  | `/:id/inventory` | vendor | Inventory adjustment                       |

### 3.6 Cart (`/cart`)

`GET /` · `POST /items` · `PATCH /items/:productId` · `DELETE /items/:productId` · `DELETE /` (clear)

### 3.7 Wishlist (`/wishlist`)

`GET /` · `POST /:productId` · `DELETE /:productId`

### 3.8 Orders (`/orders`)

| Method | Path                     | Auth        | Description                              |
|--------|--------------------------|-------------|------------------------------------------|
| POST   | `/`                      | customer    | Place order from cart (auto-split)       |
| GET    | `/me`                    | customer    | My orders                                |
| GET    | `/:id`                   | participant | Order detail                             |
| POST   | `/:id/cancel`            | customer    | Cancel (full or partial)                 |
| GET    | `/vendor`                | vendor      | Orders touching my store                 |
| PATCH  | `/:id/groups/:gid/status`| vendor      | Update fulfillment status                |
| POST   | `/:id/groups/:gid/return`| customer    | Request return/refund                    |
| POST   | `/:id/payments/verify`   | customer    | Verify Razorpay payment                  |

### 3.9 Reviews (`/reviews`)

CRUD with moderation (admin can hide).

### 3.10 Messages (`/messages`)

`GET /conversations` · `POST /conversations` · `GET /conversations/:id` · `POST /conversations/:id/messages`

Real-time delivery handled by Socket.io.

### 3.11 Notifications (`/notifications`)

`GET /` · `PATCH /:id/read` · `PATCH /read-all`

### 3.12 Coupons (`/coupons`)

`GET /` (public/active) · `POST /` (vendor/admin) · `PATCH /:id` · `DELETE /:id` · `POST /apply`

### 3.13 Admin (`/admin`)

`GET /stats` · `GET /vendors` · `GET /flagged` · `PATCH /users/:id/block` · `PATCH /vendors/:id/suspend` · `GET /audit-logs`

### 3.14 Analytics (`/analytics`)

`GET /vendor` · `GET /admin` · `GET /customer`

---

## 4. Frontend Page Map

### 4.1 Public

- `/` Landing
- `/about` About
- `/contact` Contact / Support
- `/marketplace` Browse marketplace
- `/products/:slug` Product detail
- `/vendors/:slug` Vendor profile
- `/auth/login` Login
- `/auth/signup` Signup
- `/auth/forgot-password`
- `/auth/reset-password`

### 4.2 Customer (role: `customer`)

- `/app` Home dashboard
- `/app/browse` Browse with filters
- `/app/cart`
- `/app/checkout`
- `/app/orders` and `/app/orders/:id`
- `/app/wishlist`
- `/app/messages`
- `/app/profile`
- `/app/settings`

### 4.3 Vendor (role: `vendor`)

- `/vendor` Dashboard
- `/vendor/products` and `/vendor/products/new`, `/vendor/products/:id/edit`
- `/vendor/orders` and `/vendor/orders/:id`
- `/vendor/inventory`
- `/vendor/earnings`
- `/vendor/messages`
- `/vendor/store` Store settings
- `/vendor/coupons`

### 4.4 Admin (role: `admin`)

- `/admin` Dashboard
- `/admin/vendors` Approvals + management
- `/admin/users`
- `/admin/products`
- `/admin/orders`
- `/admin/analytics`
- `/admin/categories`
- `/admin/settings`

---

## 5. Component Architecture

### 5.1 Design system (`components/ui`)

`Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `Badge`, `Card`, `Tabs`, `Modal`, `Drawer`, `Tooltip`, `Toast`, `Skeleton`, `Spinner`, `EmptyState`, `Avatar`, `Separator`, `Pagination`, `DropdownMenu`.

### 5.2 Layout (`components/layout`)

`PublicNavbar`, `PublicFooter`, `DashboardShell`, `AppSidebar`, `AppTopbar`, `RoleBasedLayout`.

### 5.3 Shared widgets (`components/shared`)

`ProductCard`, `VendorCard`, `CategoryChip`, `StatCard`, `OrderTimeline`, `RatingStars`, `PriceTag`, `FilterPanel`, `SearchBar`, `NotificationBell`, `CartDrawer`.

### 5.4 Charts (`components/charts`)

`RevenueChart`, `OrdersChart`, `CategoryDonut`, `VendorGrowthChart`, `TopProductsChart`.

### 5.5 Feature modules (`features/*`)

Each feature exports its slice, hooks, queries, and feature-specific components. Auth, cart, wishlist, products, vendors, orders, messages, notifications, admin.

---

## 6. State Management

- **Redux Toolkit** for cross-cutting state: `auth`, `theme`, `cart`, `notifications`.
- **TanStack Query** for server cache: products, vendors, orders, messages, analytics.
- **Local component state** for ephemeral UI (modals, filters before commit).

---

## 7. Real-time Layer

Socket.io rooms:

- `user:<userId>` — personal channel for notifications & order updates
- `conversation:<conversationId>` — chat
- `vendor:<vendorId>` — vendor-wide alerts
- `admin` — admin alerts (approvals, fraud flags)

Events: `notification:new`, `order:status`, `chat:message`, `chat:typing`, `vendor:application`, `admin:alert`.

---

## 8. Security

- Helmet + CORS allowlist
- `express-rate-limit` on auth and write paths
- `express-mongo-sanitize` for NoSQL injection
- Bcrypt 12 rounds for password hashing
- JWT access (short-lived) + refresh (httpOnly secure cookie)
- Refresh token rotation with reuse detection
- Zod request validation per route
- Role middleware: `requireRole('vendor', 'admin')`
- Resource ownership checks in services

---

## 9. Implementation Roadmap

| Phase | Theme                                           | Outcome                                |
|-------|-------------------------------------------------|----------------------------------------|
| 1     | Project scaffold, env, conventions              | Both apps boot end-to-end              |
| 2     | Auth & RBAC                                     | Signup/login/refresh, protected routes |
| 3     | Core models + product/vendor/category APIs      | Marketplace browsing                   |
| 4     | Cart + multi-vendor checkout + order splitting  | Place orders                           |
| 5     | Vendor dashboard + product CRUD + inventory     | Vendors can sell                       |
| 6     | Admin dashboard + approvals + moderation        | Platform governance                    |
| 7     | Real-time chat + notifications + order updates  | Live experience                        |
| 8     | Analytics dashboards                            | Insights                               |
| 9     | UI polish, dark mode, animations, empty states  | Premium feel                           |
| 10    | Seed, README, run instructions                  | Demoable                               |

---

## 10. Conventions

- **Errors**: throw `ApiError(status, message, details?)`; central handler returns the standard envelope.
- **Async**: every controller wrapped in `asyncHandler`.
- **Naming**: kebab-case URLs, camelCase JSON fields, PascalCase models.
- **Validation**: every write endpoint has a Zod schema in `validations/`.
- **Pagination**: `?page=&limit=&sort=&order=`. Default `limit=20`, max `100`.
- **Filtering**: documented per route; arrays as comma-separated.
- **Slugs**: vendors and products have unique URL slugs.
