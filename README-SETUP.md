# CarryCraft — Backend Setup

This is your original backend with the missing pieces filled in so the
CarryCraft frontend can actually talk to it. Here's what changed and why.

## What was fixed / added

- **`models/user-model.js`** — had a syntax error (missing commas), no unique
  email. Fixed.
- **`models/owner-model.js`** — renamed `firstname` → `fullname` to match the
  frontend and routes; added unique email.
- **`models/order-model.js`** — new. Orders didn't exist as a concept before.
- **`middlewares/auth.js`** — new. JWT verification via an httpOnly `token`
  cookie, plus an `isOwner` check for admin-only routes.
- **`config/multer-config.js`** — new. Handles product image uploads to
  `public/images/uploads`.
- **`routes/userRouter.js`** — added register/login/logout, cart
  (add/update/remove), and order placement + order history.
- **`routes/ownerRouter.js`** — added register/login/logout for the admin,
  product create/update/delete, and endpoints to view & update all orders.
- **`routes/productRouter.js`** — added public product listing (with
  `?search=&category=&minPrice=&maxPrice=` filters) and single product lookup.
- **`app.js`** — added `cors` (with `credentials: true`) so the frontend
  (running on a different port) can send/receive the auth cookie, and static
  serving for uploaded images.
- **`config/development.json`** — added `JWT_SECRET` and `ADMIN_SECRET`.
  **Change both of these before deploying anywhere real.**

## Running it

```bash
npm install
# make sure MongoDB is running locally on the default port (27017)
NODE_ENV=development npm start   # or: node app.js
```

The API will be available at `http://localhost:3000`.

## Creating the admin (owner) account

There's no public admin signup — you need the `ADMIN_SECRET` from
`config/development.json` to register an admin. In the frontend, go to
`/admin/register` and enter that secret key along with the admin's details.
After that, admins log in normally at `/admin/login`.

## API reference

### Auth
| Method | Route | Body | Notes |
|---|---|---|---|
| POST | `/user/register` | `{fullname, email, password, contact}` | Shopper signup |
| POST | `/user/login` | `{email, password}` | |
| GET | `/user/logout` | | |
| GET | `/user/me` | | requires cookie |
| POST | `/owner/register` | `{fullname, email, password, gstin, adminSecret}` | Admin signup |
| POST | `/owner/login` | `{email, password}` | |
| GET | `/owner/logout` | | |
| GET | `/owner/me` | | requires cookie + admin |

### Products
| Method | Route | Notes |
|---|---|---|
| GET | `/product?search=&category=&minPrice=&maxPrice=` | Public |
| GET | `/product/:id` | Public |
| POST | `/owner/products` | Admin only, `multipart/form-data` with `image` file |
| PUT | `/owner/products/:id` | Admin only |
| DELETE | `/owner/products/:id` | Admin only |

### Cart & Orders (shopper)
| Method | Route | Body |
|---|---|---|
| GET | `/user/cart` | |
| POST | `/user/cart/add` | `{productId, quantity}` |
| POST | `/user/cart/update` | `{productId, quantity}` |
| POST | `/user/cart/remove` | `{productId}` |
| POST | `/user/order` | `{address, contact}` — creates order from current cart |
| GET | `/user/orders` | Order history |

### Orders (admin)
| Method | Route | Body |
|---|---|---|
| GET | `/owner/orders` | All orders, newest first |
| PUT | `/owner/orders/:id/status` | `{status}` — placed / shipped / delivered / cancelled |
