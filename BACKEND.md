# Backend guide — Rebel Fashion kaftan marketplace

Hi! 👋 This document is for the backend developer who will connect a real server to this frontend.
The frontend is finished and runs today on **demo data stored in the browser**. Your job is to build
a REST API that returns the same JSON shapes, then flip one environment variable.

You don't need to touch any React component. Everything goes through one file.

---

## 1. How the frontend is organised

```
src/lib/
├── config.ts          ← SITE_NAME, PLATFORM_COMMISSION_PERCENT (10), shipping rates, env switches
├── types.ts           ← every domain type (Product, Seller, Order, …). Your JSON must match these.
├── seed-data.ts       ← demo kaftans, demo sellers, demo orders (delete when you go live)
├── commission.ts      ← how a line is split between seller and platform
└── api/
    ├── contract.ts    ← the DataApi interface: the full list of operations
    ├── index.ts       ← picks mock or http and re-exports every function
    ├── mock.ts        ← demo implementation (localStorage + seed)
    └── http.ts        ← real implementation: fetch() calls to YOUR endpoints (already written)
```

Components only ever do `import { getProducts } from "@/lib/api"`. They never call `fetch` or
`localStorage` for domain data. So when you build the endpoints below, the whole UI just works.

### Switching from mock to real

Set these environment variables (locally in `.env.local`, and in Vercel → Project → Settings → Environment Variables):

```bash
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com/api/v1   # no trailing slash
```

That's it. `src/lib/api/index.ts` will start using `http.ts` instead of `mock.ts`.

> Tip: you can build the backend as a separate service **or** inside this same Next.js app as
> Route Handlers (e.g. `src/app/api/v1/products/route.ts`). In the second case use
> `NEXT_PUBLIC_API_BASE_URL=/api/v1`.

---

## 2. General rules

- **JSON everywhere.** `Content-Type: application/json`, except image upload (multipart).
- **Money is whole Naira** (integers, e.g. `48000` = ₦48,000). Convert to kobo (`× 100`) only when talking to Paystack.
- **Dates** are ISO 8601 strings (`"2026-10-29T14:03:00.000Z"`).
- **IDs** are strings. Any format is fine (UUID, cuid, …).
- **Errors:** return a non-2xx status with `{ "error": "Human readable message" }`. The message is shown to the user as-is.
  - `400` validation, `401` not logged in / bad token, `403` not allowed, `404` not found, `409` conflict (email taken, price changed).
- **CORS:** if the API is on another domain, allow the frontend origin and the `Authorization` header.
- **Never trust the browser** for prices, totals, commission or listing status. Always recompute from your database.

### Authentication

| Who | How they log in | What the frontend sends afterwards |
|-----|-----------------|------------------------------------|
| Seller | `POST /sellers/login` or `POST /sellers/signup` → `{ token, seller }` | `Authorization: Bearer <token>` |
| Admin | `POST /admin/login` → `{ token, email, name }` | `Authorization: Bearer <token>` |
| Shopper | No account (guest checkout) | nothing |

- The token can be a JWT or an opaque session id — the frontend only stores it (in `localStorage`) and sends it back.
- Seller tokens must **never** work on `/admin/*` routes. Keep a `role` claim (`seller` / `admin`).
- When a token is expired/invalid, return **401**; the frontend clears it and sends the user to the login page.
- Hash passwords with bcrypt/argon2. Rate-limit the login routes.
- The demo admin login in `config.ts` (`ADMIN_DEMO_CREDENTIALS`) is **only** used by the mock. Create real admin users in your database.

---

## 3. Endpoint reference

Base URL = `NEXT_PUBLIC_API_BASE_URL`. "Auth" column: — = public, **S** = seller token, **A** = admin token.

| # | Method | Path | Auth | Request body | Response | Frontend function |
|---|--------|------|------|--------------|----------|-------------------|
| 1 | GET | `/styles` | — | – | `KaftanStyle[]` | `getStyles` |
| 2 | GET | `/products?gender=&style=&search=&seller=&ids=` | — | – | `Product[]` (**approved only**) | `getProducts` |
| 3 | GET | `/products/:slugOrId` | — | – | `Product` or 404 (approved only) | `getProduct` |
| 4 | POST | `/sellers/signup` | — | `SellerSignupInput` | `{ token, seller: Seller }` | `createSeller` |
| 5 | POST | `/sellers/login` | — | `{ email, password }` | `{ token, seller: Seller }` | `loginSeller` |
| 6 | POST | `/sellers/logout` | S | – | `{ ok: true }` | `logoutSeller` |
| 7 | GET | `/sellers/me` | S | – | `Seller` | `getCurrentSeller` |
| 8 | GET | `/sellers/me/listings` | S | – | `Product[]` (all statuses, newest first) | `getSellerListings` |
| 9 | POST | `/sellers/me/listings` | S | `NewListingInput` | `Product` with `status: "pending"` | `createListing` |
| 10 | POST | `/uploads` | S | multipart, field `file` | `{ url: string }` | `uploadListingImage` |
| 11 | GET | `/sellers/me/orders` | S | – | `SellerOrderView[]` | `getSellerOrders` |
| 12 | POST | `/admin/login` | — | `{ email, password }` | `AdminSession` (`{ token, email, name }`) | `loginAdmin` |
| 13 | GET | `/admin/me` | A | – | `AdminSession` | `getAdminSession` |
| 14 | GET | `/admin/listings?status=pending` | A | – | `Product[]` | `getPendingListings` |
| 15 | GET | `/admin/products` | A | – | `Product[]` (all statuses) | `getAllProducts` |
| 16 | POST | `/admin/listings/:id/approve` | A | – | `Product` (approved) | `approveListing` |
| 17 | POST | `/admin/listings/:id/reject` | A | `{ reason }` | `Product` (rejected) | `rejectListing` |
| 18 | GET | `/admin/sellers` | A | – | `Seller[]` | `getSellers` |
| 19 | GET | `/admin/orders` | A | – | `Order[]` (newest first) | `getOrders` |
| 20 | PATCH | `/admin/orders/:id` | A | `{ status: OrderStatus }` | `Order` | `updateOrderStatus` |
| 21 | GET | `/admin/overview` | A | – | `AdminOverview` | `getAdminOverview` |
| 22 | POST | `/orders` | — | `CreateOrderInput` | `{ order: Order, checkoutUrl }` | `createOrder` |
| 23 | GET | `/orders/:reference` | — | – | `Order` or 404 | `getOrderByReference` |
| 24 | POST | `/payments/paystack/webhook` | Paystack signature | Paystack event | `200` | *(backend only)* |

All TypeScript shapes are in `src/lib/types.ts`. Examples below.

### Examples

**`Product`** (responses #2, #3, #8, #9, #14–#17)

```json
{
  "id": "prd_8f2k1",
  "slug": "classic-senator-set",
  "name": "Classic Senator Set",
  "description": "The everyday native essential…",
  "category": "kaftan",
  "style": "senator",
  "gender": "men",
  "price": 48000,
  "compareAtPrice": 55000,
  "badge": "Core",
  "featured": true,
  "images": ["https://cdn.example.com/p/senator-1.jpg"],
  "colors": [
    { "name": "Mustard", "hex": "#C9A227", "image": "https://cdn.example.com/p/senator-mustard.jpg" },
    { "name": "Charcoal", "hex": "#3A3A3A" }
  ],
  "sizes": ["S", "M", "L", "XL"],
  "stock": 40,
  "material": "Senator wool-blend",
  "fit": "Tailored regular fit",
  "care": "Machine wash cold",
  "sellerId": "sel_arewa",
  "sellerName": "Arewa Threads",
  "status": "approved",
  "rejectionReason": null,
  "createdAt": "2026-10-01T09:00:00.000Z",
  "updatedAt": "2026-10-02T10:00:00.000Z"
}
```

- `category` is one of `kaftan | agbada | abaya | jalabiya | caps-accessories | other-clothing`.
- `style` is a `KaftanStyle.slug`: `agbada | senator | jalabiya | embroidered | moroccan | abaya-kaftan | modern | kids` (you can serve your own list from `/styles`).
- `gender` is `men | women | kids | unisex`. For `?gender=men`, also return `unisex` items.
- The platform's own products use `sellerId: "platform"` and `sellerName: "Rebel Fashion"` (`PLATFORM_SELLER_ID` in `config.ts`).
- `sellerName` should be denormalised (or joined) so product cards can show "Sold by …".

**`KaftanStyle`** (#1)

```json
{ "slug": "agbada", "name": "Agbada-Style", "description": "Flowing three-piece grand robes…", "image": "https://…", "gender": "men" }
```

**`SellerSignupInput`** (#4 request)

```json
{
  "businessName": "Arewa Threads",
  "ownerName": "Musa Abdullahi",
  "phone": "08030000001",
  "email": "arewa@example.com",
  "password": "at-least-8-chars",
  "bank": { "bankName": "Guaranty Trust Bank", "accountNumber": "0123456789", "accountName": "Arewa Threads Ventures" }
}
```

**`Seller`** (#4, #5, #7, #18) — never return the password or hash

```json
{
  "id": "sel_arewa",
  "businessName": "Arewa Threads",
  "ownerName": "Musa Abdullahi",
  "email": "arewa@example.com",
  "phone": "08030000001",
  "bank": { "bankName": "Guaranty Trust Bank", "accountNumber": "0123456789", "accountName": "Arewa Threads Ventures" },
  "paystackSubaccountCode": "ACCT_8f4s1eq7ml6rlzj",
  "status": "active",
  "createdAt": "2026-09-12T10:00:00.000Z"
}
```

**`NewListingInput`** (#9 request). The listing must be saved with `status: "pending"`, `sellerId` taken from the token (never from the body).

```json
{
  "name": "Embroidered Senator Kaftan",
  "description": "Cashmere senator with chest embroidery, comes with cap.",
  "category": "kaftan",
  "style": "senator",
  "gender": "men",
  "sizes": ["M", "L", "XL"],
  "colors": [{ "name": "Royal Wine", "hex": "#7B1E2B", "image": "https://cdn.example.com/u/wine.jpg" }],
  "images": ["https://cdn.example.com/u/front.jpg", "https://cdn.example.com/u/back.jpg"],
  "price": 45000,
  "stock": 10,
  "material": "Cashmere senator"
}
```

**`SellerOrderView`** (#11) — only the seller's own lines

```json
{
  "orderId": "ord_123",
  "reference": "RF-261024-AB12C",
  "status": "shipped",
  "createdAt": "2026-10-24T11:20:00.000Z",
  "customerName": "Aisha Yusuf",
  "city": "Kaduna",
  "state": "Kaduna",
  "items": [ /* OrderItem[] */ ],
  "grossAmount": 240000,
  "commissionAmount": 24000,
  "sellerAmount": 216000
}
```

**`CreateOrderInput`** (#22 request — sent by the checkout page)

```json
{
  "customer": { "fullName": "Aisha Yusuf", "email": "aisha@example.com", "phone": "08031234567", "address": "12 Ahmadu Bello Way", "city": "Kaduna", "state": "Kaduna" },
  "deliveryLocation": { "latitude": 10.52, "longitude": 7.43 },
  "items": [
    { "productId": "aso-oke-striped-agbada", "slug": "aso-oke-striped-agbada", "name": "Aso-Oke Striped Agbada", "image": "https://…", "color": "Emerald Stripe", "size": "XL", "quantity": 1, "unitPrice": 240000, "sellerId": "sel_arewa", "sellerName": "Arewa Threads" }
  ],
  "shippingMethod": "standard",
  "paymentMethod": "card",
  "displayedSubtotal": 240000,
  "displayedShipping": 3500,
  "displayedTotal": 243500
}
```

Backend must: look up each product (must be `approved` and in stock), use **its** price, compute
shipping (`standard` 3500 / `priority` 6500, see `SHIPPING_RATES`), compare with `displayedTotal`
and return **409** `{ "error": "Prices have changed. Please review your bag." }` if they differ.

**`CreateOrderResult`** (#22 response)

```json
{
  "order": { /* Order, status "pending" until Paystack confirms */ },
  "checkoutUrl": "https://checkout.paystack.com/0peioxfhpn"
}
```

The frontend redirects the shopper to `checkoutUrl`. Set the Paystack `callback_url` to
`https://<frontend>/checkout/success?ref=<reference>`.

**`Order`** (#19, #20, #22, #23)

```json
{
  "id": "ord_123",
  "reference": "RF-261024-AB12C",
  "customer": { "fullName": "Aisha Yusuf", "email": "aisha@example.com", "phone": "08031234567", "address": "12 Ahmadu Bello Way", "city": "Kaduna", "state": "Kaduna" },
  "items": [
    {
      "productId": "aso-oke-striped-agbada", "slug": "aso-oke-striped-agbada", "name": "Aso-Oke Striped Agbada",
      "image": "https://…", "color": "Emerald Stripe", "size": "XL", "quantity": 1,
      "unitPrice": 240000, "lineTotal": 240000,
      "sellerId": "sel_arewa", "sellerName": "Arewa Threads",
      "commissionPercent": 10, "commissionAmount": 24000, "sellerAmount": 216000
    },
    {
      "productId": "classic-white-jalabiya", "slug": "classic-white-jalabiya", "name": "Classic Jalabiya (Thobe)",
      "image": "https://…", "color": "White", "size": "L", "quantity": 2,
      "unitPrice": 28000, "lineTotal": 56000,
      "sellerId": "platform", "sellerName": "Rebel Fashion",
      "commissionPercent": 0, "commissionAmount": 0, "sellerAmount": 56000
    }
  ],
  "subtotal": 296000,
  "shippingCost": 3500,
  "total": 299500,
  "commissionTotal": 24000,
  "sellerSplits": [
    { "sellerId": "sel_arewa", "sellerName": "Arewa Threads", "grossAmount": 240000, "commissionAmount": 24000, "sellerAmount": 216000 },
    { "sellerId": "platform", "sellerName": "Rebel Fashion", "grossAmount": 56000, "commissionAmount": 0, "sellerAmount": 56000 }
  ],
  "shippingMethod": "standard",
  "paymentMethod": "card",
  "status": "paid",
  "createdAt": "2026-10-24T11:20:00.000Z",
  "updatedAt": "2026-10-24T11:22:00.000Z"
}
```

`OrderStatus` = `pending | paid | shipped | delivered | cancelled`.

**Commission rule** (same as `src/lib/commission.ts`):

```
lineTotal        = unitPrice × quantity
commissionPercent = 0 if sellerId == "platform" else PLATFORM_COMMISSION_PERCENT (10)
commissionAmount  = round(lineTotal × commissionPercent / 100)
sellerAmount      = lineTotal − commissionAmount
```

Shipping goes to the platform (it is not part of any seller's split) unless you decide otherwise.

**`AdminOverview`** (#21)

```json
{
  "productCounts": { "approved": 20, "pending": 2, "rejected": 1, "total": 23 },
  "sellerCount": 3,
  "orderCount": 3,
  "gmv": 514000,
  "commissionEarned": 45800,
  "ownStoreRevenue": 56000,
  "sellerPayouts": 412200,
  "ordersByStatus": { "pending": 0, "paid": 1, "shipped": 1, "delivered": 1, "cancelled": 0 }
}
```

GMV = sum of order subtotals; all money figures exclude cancelled orders.

### Image uploads (#10)

The "New listing" form uploads each photo **one at a time** before submitting the listing:

- `POST /uploads` with `multipart/form-data`, field name **`file`**, seller token required.
- Accept `image/jpeg`, `image/png`, `image/webp`; limit size (e.g. 8 MB); resize/compress server-side.
- Store in S3 / Cloudinary / Supabase Storage / Vercel Blob and return a public HTTPS URL: `{ "url": "https://cdn.example.com/u/abc.jpg" }`.
- The listing body (#9) then contains those URLs in `images` and `colors[].image`.
- Add your storage domain to `images.remotePatterns` in `next.config.ts` so `next/image` can display it.
- (In mock mode the browser compresses photos and stores them as data URLs — that's why demo uploads are small.)

---

## 4. Payments with Paystack (split payments)

Goal: when a customer pays, each seller's share goes **straight to the seller's bank account**,
and the platform keeps its commission automatically. Paystack does this with **subaccounts** and **splits**.

Docs:
- Split payments overview: https://paystack.com/docs/payments/split-payments/
- Multi-split: https://paystack.com/docs/payments/multi-split-payments/
- Subaccount API: https://paystack.com/docs/api/subaccount/
- Transaction Split API: https://paystack.com/docs/api/split/
- Initialize transaction: https://paystack.com/docs/api/transaction/#initialize
- Verify transaction: https://paystack.com/docs/api/transaction/#verify
- Webhooks: https://paystack.com/docs/payments/webhooks/
- Banks list / account resolve: https://paystack.com/docs/api/miscellaneous/#bank and https://paystack.com/docs/api/verification/#resolve-account

### 🔐 Keys

- `PAYSTACK_SECRET_KEY` (`sk_test_…` / `sk_live_…`) lives **only on the backend** (server env var).
  **Never** put it in the frontend, in `NEXT_PUBLIC_*` variables, or in git.
- The frontend doesn't need any Paystack key for the redirect flow.

### Step 1 — Create a subaccount for each seller

Do this when an admin approves a seller's **first** listing (that's what the mock does), or when you
verify the seller — your choice. Store the returned `subaccount_code` on the seller as `paystackSubaccountCode`.

1. Get the bank code: `GET https://api.paystack.co/bank?country=nigeria` and match the seller's `bank.bankName`
   (better: store the bank code at signup).
2. Optionally verify the account: `GET https://api.paystack.co/bank/resolve?account_number=0123456789&bank_code=058`.
3. Create the subaccount:

```http
POST https://api.paystack.co/subaccount
Authorization: Bearer PAYSTACK_SECRET_KEY
Content-Type: application/json

{
  "business_name": "Arewa Threads",
  "settlement_bank": "058",
  "account_number": "0123456789",
  "percentage_charge": 10,
  "primary_contact_email": "arewa@example.com",
  "primary_contact_name": "Musa Abdullahi",
  "primary_contact_phone": "08030000001"
}
```

`percentage_charge` is **the platform's share** = `PLATFORM_COMMISSION_PERCENT` (10). Response contains
`data.subaccount_code` (e.g. `ACCT_8f4s1eq7ml6rlzj`).

### Step 2 — Initialise the payment when the shopper checks out (`POST /orders`)

Create the order in your DB with status `pending`, then:

**a) Bag with items from one seller** — use the subaccount directly:

```http
POST https://api.paystack.co/transaction/initialize
Authorization: Bearer PAYSTACK_SECRET_KEY

{
  "email": "aisha@example.com",
  "amount": 24350000,
  "reference": "RF-261024-AB12C",
  "callback_url": "https://rebelfashion.ng/checkout/success?ref=RF-261024-AB12C",
  "subaccount": "ACCT_8f4s1eq7ml6rlzj",
  "transaction_charge": 2750000,
  "bearer": "account",
  "metadata": { "orderId": "ord_123" }
}
```

(`amount` and `transaction_charge` are in **kobo**. `transaction_charge` = commission + shipping you keep,
overriding the subaccount's percentage when you need an exact amount.)

**b) Bag with items from several sellers (and/or the platform's own kaftans)** — use a **multi-split**.
Create a split (or reuse one) with each seller's exact share, then pass `split_code`:

```http
POST https://api.paystack.co/split
{
  "name": "Order RF-261024-AB12C",
  "type": "flat",
  "currency": "NGN",
  "subaccounts": [
    { "subaccount": "ACCT_arewa…", "share": 21600000 },
    { "subaccount": "ACCT_luxe…",  "share": 6840000 }
  ],
  "bearer_type": "account"
}
```

```http
POST https://api.paystack.co/transaction/initialize
{ "email": "…", "amount": 29950000, "reference": "RF-…", "callback_url": "…", "split_code": "SPL_xxxx" }
```

Each `share` = that seller's `sellerAmount` × 100 (from `order.sellerSplits`). Everything that is not
shared out (commission + platform's own items + shipping) stays with the main (platform) account.

Return `data.authorization_url` as `checkoutUrl`.

### Step 3 — Confirm the payment (never trust the redirect)

- Handle the webhook at `POST /payments/paystack/webhook`. Verify the `x-paystack-signature` header
  (HMAC SHA512 of the raw body with your secret key). On `charge.success`, look up the order by `reference`,
  check the amount, then set `status: "paid"`, decrement stock and notify sellers.
- Optionally also call `GET https://api.paystack.co/transaction/verify/:reference` from `/checkout/success`.
- Make the webhook idempotent (Paystack can send the same event more than once).

### Bank transfer option

The checkout offers "card" and "transfer". Paystack's checkout page supports bank transfer as a channel,
so both can use the same `initialize` flow (optionally pass `channels: ["card"]` or `["bank_transfer"]`).

---

## 5. What the mock route `/api/checkout` is

`src/app/api/checkout/route.ts` is a **demo payment route** (enabled with `MOCK_PAYMENTS=true`). It validates
the bag, recalculates totals and the seller split, and returns a fake `checkoutUrl` (the success page).
It's only used by `mock.ts`. With the real backend, `POST /orders` (#22) replaces it — you can delete it
or turn it into a proxy to your backend.

Note: in demo mode, listings created by sellers only exist in the visitor's browser, so this mock route
has to accept the price sent for those items. **Your backend must always read prices from the database.**

---

## 6. Suggested database tables

- `sellers` (id, business_name, owner_name, email unique, phone, password_hash, bank_name, bank_code, account_number, account_name, paystack_subaccount_code, status, created_at)
- `admins` (id, email, name, password_hash)
- `styles` (slug, name, description, image, gender)
- `products` (id, slug unique, seller_id → sellers or "platform", name, description, category, style, gender, price, compare_at_price, badge, featured, images jsonb, colors jsonb, sizes jsonb, stock, material, fit, care, status, rejection_reason, created_at, updated_at)
- `orders` (id, reference unique, customer jsonb, subtotal, shipping_cost, total, commission_total, shipping_method, payment_method, status, paystack_reference, created_at, updated_at)
- `order_items` (id, order_id, product_id, seller_id, name, image, color, size, quantity, unit_price, line_total, commission_percent, commission_amount, seller_amount)

---

## 7. Checklist before going live

- [ ] All endpoints in section 3 implemented and returning the shapes in `src/lib/types.ts`
- [ ] Passwords hashed, tokens expire, admin and seller roles separated
- [ ] Prices/totals/commission recomputed server-side; only `approved` products purchasable
- [ ] Paystack subaccount created per seller; split payments tested in **test mode**
- [ ] Webhook signature verified; orders marked `paid` only from webhook/verify
- [ ] `PAYSTACK_SECRET_KEY` only on the server
- [ ] Upload storage domain added to `next.config.ts` → `images.remotePatterns`
- [ ] `NEXT_PUBLIC_USE_MOCK_API=false` and `NEXT_PUBLIC_API_BASE_URL` set in Vercel
- [ ] Demo data removed from `src/lib/seed-data.ts` (or kept only for local development)
