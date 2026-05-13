# PartnerCart

A production-grade multi-vendor local marketplace built with the MERN stack. PartnerCart brings local vendors online with a premium, multinational-grade experience for customers, vendors, and platform administrators.

> Three roles. One platform. Real-time, multi-vendor commerce that feels enterprise-grade end to end.

---

## Highlights

- **Multi-vendor marketplace** with automatic order splitting per vendor
- **Three role experience**: Customer, Vendor, Admin — each with a tailored dashboard
- **Vendor onboarding & verification** workflow with admin approval
- **Real-time** chat, order updates, and notifications via Socket.io
- **Email OTP security** — forgot password, change password, login alerts and
  notification emails through Nodemailer (SMTP or local console transport)
- **Premium UI** with Tailwind, custom design system, dark mode, micro-interactions
- **Scalable backend** with MVC + service layer, Mongoose, JWT + refresh tokens
- **Razorpay-ready** payment integration structure
- **Cloudinary-ready** media uploads
- **Role-based access control** end-to-end
- **Analytics dashboards** for all three roles using Recharts

---

## Repository Layout

```
partner-cart/
├── server/        Node.js + Express + MongoDB API and Socket.io gateway
├── client/        React + Vite + Tailwind premium SPA
├── docs/          Architecture, data model, API and product specs
└── README.md
```

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the full architecture, data model, API map, frontend page map, component architecture, and implementation roadmap.

---

## Quickstart

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- (Optional) Cloudinary account for media uploads
- (Optional) Razorpay test keys

### 1. Backend

```bash
cd server
cp .env.example .env   # then fill in values
npm install
npm run dev
```

The API listens on `http://localhost:5000` by default. Health check: `GET /api/v1/health`.

### 2. Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

The app runs on `http://localhost:5173` and proxies `/api` to the backend.

### 3. Google Sign-In (optional but recommended)

PartnerCart supports "Sign in with Google" out of the box via Passport. Each Google account maps to exactly one PartnerCart user — uniqueness is enforced by the `googleId` (Google's `sub`) on the `User` collection. Local email accounts and Google identities can be linked when emails match.

To enable it:

1. Visit https://console.cloud.google.com/apis/credentials and create an OAuth Client ID (type: **Web application**).
2. Add an Authorized redirect URI exactly equal to `GOOGLE_CALLBACK_URL` (default: `http://localhost:5000/api/v1/auth/google/callback`).
3. Copy the Client ID and Client Secret into `server/.env`:

   ```env
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
   OAUTH_SUCCESS_REDIRECT=http://localhost:5173/auth/callback
   OAUTH_FAILURE_REDIRECT=http://localhost:5173/auth/login?oauth=failed
   ```

4. Restart the API. The "Continue with Google" button on `/auth/login` and `/auth/signup` will be live.

If the credentials are missing, the buttons show a friendly error and email/password login keeps working unchanged.

### 4. Email & OTP (forgot/change password, login alerts)

PartnerCart sends transactional email through Nodemailer. With no SMTP config,
the API falls back to a dev "console transport" that just logs the payload, so
all flows work locally without any setup.

To send real email (Gmail, SES, Mailgun, etc.) fill these in `server/.env`:

```env
MAIL_FROM="PartnerCart <noreply@yourdomain.com>"
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=you@yourdomain.com
MAIL_PASS=your_app_password
MAIL_SECURE=false
MAIL_NOTIFY_ON_LOGIN=true
OTP_LENGTH=6
OTP_TTL_MINUTES=10
```

Endpoints worth knowing:

| Method  | Path                                    | Use                              |
|---------|-----------------------------------------|----------------------------------|
| POST    | `/auth/forgot-password`                 | Email a 6-digit reset OTP        |
| POST    | `/auth/verify-forgot-otp`               | Verify OTP, get reset token      |
| POST    | `/auth/reset-password`                  | Set new password with token      |
| POST    | `/auth/change-password/send-otp`        | Email OTP to change password     |
| PATCH   | `/auth/update-password`                 | Confirm change with current+OTP  |
| PATCH   | `/users/me/notification-prefs`          | Toggle which emails you receive  |

Login alerts: every successful sign-in (local **and** Google OAuth) emails the
user a "new sign-in detected" notification with the IP, device and time. Toggle
with `MAIL_NOTIFY_ON_LOGIN=false`.

Time-to-time notifications: order placed/shipped/delivered, vendor approval and
other system events go through a single `createAndDeliver()` pipeline that
persists the notification, pushes it via socket.io and emails the user — all
respecting their per-channel preferences.

### 5. Seed sample data (optional)

```bash
cd server
npm run seed
```

This seeds an admin user, a couple of vendors with stores, sample categories and products so you can explore every dashboard immediately.

Default credentials after seeding (`npm run seed` **wipes** users, vendors, catalog, carts, orders, and related docs — use only on a dev DB):

| Role       | Pattern / emails                                      | Password      |
|------------|--------------------------------------------------------|---------------|
| Admin      | `admin@partnercart.io`                                 | `Admin@1234`  |
| Vendors    | `vendor@` … `vendor6@partnercart.io`                   | `Vendor@1234` |
| Customers  | `customer@` plus `customer02@` … `customer20@` (same password) | `User@1234`   |

Seed also creates **six** verified vendor stores, **26** catalog products across categories, sample **addresses**, and **six** demo **orders** in mixed statuses so dashboards are not empty.

---

## Tech Stack

**Frontend**: React 18, Vite, Tailwind CSS, custom shadcn-style component library, Framer Motion, Redux Toolkit, TanStack Query, React Router, Recharts, Socket.io-client, Axios, Zod.

**Backend**: Node.js, Express, MongoDB, Mongoose, JWT (access + refresh), Bcrypt, Helmet, CORS, express-rate-limit, express-mongo-sanitize, Socket.io, Multer, Cloudinary SDK, Razorpay SDK, Zod.

---

## Scripts

### Server

| Command           | Description                              |
|-------------------|------------------------------------------|
| `npm run dev`     | Start API in watch mode (nodemon)        |
| `npm start`       | Start API in production mode             |
| `npm run seed`    | Seed sample data into MongoDB            |
| `npm run lint`    | Lint backend source                      |

### Client

| Command           | Description                              |
|-------------------|------------------------------------------|
| `npm run dev`     | Vite dev server                          |
| `npm run build`   | Production build                         |
| `npm run preview` | Preview production build                 |

---

## License

MIT — built as a portfolio-grade reference implementation.
