# Backend guide — Rebel Fashion marketplace

Hi! 👋 This document is for the backend developer who will connect a real server to this frontend.
Rebel Fashion is a store for **all types of clothing and accessories** (the current collection is kaftans),
sold by the platform itself and by approved independent sellers. The frontend is finished and runs today on a
**mock store kept in the browser**. Your job is to connect a real backend that returns the same JSON shapes,
then flip one environment variable. Two routes are prepared:

- **Supabase** (the chosen route): write `src/lib/api/supabase.ts`. See **section 8, Connecting Supabase**.
- **Any REST server**: implement the endpoints in section 3; `src/lib/api/http.ts` already calls them.

You don't need to touch any React component. Everything goes through one file.

---

## 1. How the frontend is organised

```
src/lib/
├── config.ts          ← SITE_NAME, PLATFORM_COMMISSION_PERCENT (10), shipping rates, env switches
├── types.ts           ← every domain type (Product, Seller, Order, …). Your JSON must match these.
├── seed-data.ts       ← the platform's own 30 kaftans ("Sold by Rebel Fashion"); no demo sellers or orders
├── image-utils.ts     ← pure photo helpers (size limits, reorder, chips) — unit-tested
├── image-compress.ts  ← browser photo compression (max 1200px JPEG 0.8, HEIC-aware)
├── commission.ts      ← how a line is split between seller and platform
└── api/
    ├── contract.ts    ← the DataApi interface: the full list of operations
    ├── index.ts       ← picks the implementation from NEXT_PUBLIC_API_MODE and re-exports every function
    ├── mock.ts        ← default implementation (localStorage + seed-data.ts)
    ├── http.ts        ← REST implementation: fetch() calls to the endpoints in section 3 (already written)
    └── supabase.ts    ← NOT written yet: the backend developer adds it (section 8)
```

Components only ever do `import { getProducts } from "@/lib/api"`. They never call `fetch` or
`localStorage` for domain data. So when you build the endpoints below, the whole UI just works.

### Switching from mock to real

`NEXT_PUBLIC_API_MODE` picks the implementation (set it in `.env.local`, and in Vercel → Project → Settings → Environment Variables):

| `NEXT_PUBLIC_API_MODE` | Implementation | Notes |
|---|---|---|
| `mock` (default) | `mock.ts` | Browser-only store. Nothing is shared between visitors. |
| `http` | `http.ts` | Also set `NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com/api/v1` (no trailing slash). |
| `supabase` | `supabase.ts` | Add the file first (section 8). Until then the app logs a warning and falls back to the mock. |

Backward compatible: if `NEXT_PUBLIC_API_MODE` is not set, `NEXT_PUBLIC_USE_MOCK_API=false` still means `http`.

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
- The admin login in `config.ts` (`ADMIN_DEMO_CREDENTIALS`) is **only** used by the mock and is never shown in the UI. Create real admin users in your database (Supabase: a `profiles` row with `role = 'admin'`).

---

## 3. Endpoint reference

Base URL = `NEXT_PUBLIC_API_BASE_URL`. "Auth" column: — = public, **S** = seller token, **A** = admin token.

| # | Method | Path | Auth | Request body | Response | Frontend function |
|---|--------|------|------|--------------|----------|-------------------|
| 1 | – | *(removed: there are no categories/styles for now)* | | | | |
| 2 | GET | `/products?gender=&search=&seller=&ids=` | — | – | `Product[]` (**approved only**) | `getProducts` |
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
  "slug": "charcoal-linen-kaftan",
  "name": "Charcoal Linen Kaftan",
  "description": "A soft washed-linen kaftan with a neat band collar…",
  "productType": "Kaftan",
  "gender": "men",
  "typeOption": { "label": "Length", "values": ["Short", "Long"] },
  "price": 42000,
  "compareAtPrice": 48000,
  "badge": "New",
  "featured": true,
  "images": ["https://<project>.supabase.co/storage/v1/object/public/product-images/u/abc.jpg"],
  "colors": [
    { "name": "Charcoal", "hex": "#4A4A4A", "image": "https://…/charcoal.jpg" },
    { "name": "Stone", "hex": "#CFC6B5" }
  ],
  "sizes": ["S", "M", "L", "XL"],
  "stock": 40,
  "material": "100% washed linen",
  "fit": "Regular fit with band collar",
  "care": "Machine wash cold",
  "sellerId": "sel_arewa",
  "sellerName": "Arewa Threads",
  "status": "approved",
  "rejectionReason": null,
  "createdAt": "2026-10-01T09:00:00.000Z",
  "updatedAt": "2026-10-02T10:00:00.000Z"
}
```

- **Changed in this version:** `category`, `style` and the `KaftanStyle` type / `GET /styles` were removed. There are no categories for now.
- `productType` is **free text** typed by the seller (e.g. `"Shirt"`, `"Dress"`, `"Kaftan"`, `"Shoes"`, `"Bag"`). Display only; it is included in search.
- `gender` is `men | women | kids | unisex`; `unisex` also means "not specified" (the seller form makes gender optional). For `?gender=men`, also return `unisex` items.
- `typeOption` (optional, may be `null`) is the extra **Type** choice shoppers must make before adding to the bag, e.g. `{ "label": "Length", "values": ["Short", "Long"] }` or `{ "label": "Set", "values": ["Top only", "Top + trousers"] }`.
- Every product needs at least one colour and one size; shoppers pick **Type (if any), Colour and Size** and the bag/order line stores all three.
- The platform's own products use `sellerId: "platform"` and `sellerName: "Rebel Fashion"` (`PLATFORM_SELLER_ID` in `config.ts`).
- `sellerName` should be denormalised (or joined) so product cards can show "Sold by …".

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
  "name": "Oversized Linen Shirt",
  "description": "Relaxed linen shirt with a camp collar. True to size.",
  "productType": "Shirt",
  "gender": "men",
  "typeOption": { "label": "Sleeve", "values": ["Short", "Long"] },
  "sizes": ["M", "L", "XL", "One size"],
  "colors": [{ "name": "Navy", "hex": "#1D2840", "image": "https://cdn.example.com/u/navy.jpg" }],
  "images": ["https://cdn.example.com/u/front.jpg", "https://cdn.example.com/u/back.jpg"],
  "price": 25000,
  "stock": 10,
  "material": "100% linen"
}
```

`gender` and `typeOption` are optional (omitted gender → store `"unisex"`). `sizes` are free text chips typed by the seller.
`images` order matters: the first one is the cover (sellers can reorder before submitting).

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
    { "productId": "prd_x1", "slug": "oversized-linen-shirt", "name": "Oversized Linen Shirt", "image": "https://…", "type": "Long", "color": "Navy", "size": "XL", "quantity": 1, "unitPrice": 240000, "sellerId": "sel_arewa", "sellerName": "Arewa Threads" }
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
      "productId": "prd_x1", "slug": "oversized-linen-shirt", "name": "Oversized Linen Shirt",
      "image": "https://…", "type": "Long", "color": "Navy", "size": "XL", "quantity": 1,
      "unitPrice": 240000, "lineTotal": 240000,
      "sellerId": "sel_arewa", "sellerName": "Arewa Threads",
      "commissionPercent": 10, "commissionAmount": 24000, "sellerAmount": 216000
    },
    {
      "productId": "sand-everyday-jalabiya", "slug": "sand-everyday-jalabiya", "name": "Sand Everyday Jalabiya",
      "image": "https://…", "type": "Regular", "color": "Sand", "size": "L", "quantity": 2,
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

Order lines carry `type` (the chosen Type value, `""` when the product has none), `color` and `size`.

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

- The browser first compresses every photo to a **JPEG, max 1200px on the longest edge, quality 0.8**
  (`src/lib/image-compress.ts`, which also handles HEIC from iPhones and EXIF rotation). Uploads are therefore small (~150–400 KB).
- `POST /uploads` with `multipart/form-data`, field name **`file`**, seller token required.
- Accept `image/jpeg`, `image/png`, `image/webp`; limit size (e.g. 8 MB).
- Store in S3 / Cloudinary / Supabase Storage / Vercel Blob and return a public HTTPS URL: `{ "url": "https://cdn.example.com/u/abc.jpg" }`.
- The listing body (#9) then contains those URLs in `images` and `colors[].image`.
- Add your storage domain to `images.remotePatterns` in `next.config.ts` so `next/image` can display it.
- In mock mode the compressed photos are stored as data URLs in `localStorage`. If the browser runs out of space
  the mock shrinks the listing's photos once (800px, 0.7) and otherwise shows a friendly "not enough space" message.
- Tests for the photo pipeline: `npm run test:images` (Node's test runner, fake DOM; covers HEIC, fallbacks, sizing, reorder).

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

**b) Bag with items from several sellers (and/or the platform's own products)** — use a **multi-split**.
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

## 4.1 Payments with FairSurePay

The checkout offers **FairSurePay** as a payment method option (`paymentMethod = "fairsurepay"`).

### ⚠️ Merchant Documentation & Credentials Status

- **Status**: Verification of `https://fairsurepay.com` confirmed the merchant portal (`merchant.fairsurepay.com`). However, public REST API specifications, webhook signature specs, and test merchant credentials are not publicly available on open documentation pages.
- **Backend Requirement**: Once merchant API keys (`FAIRSUREPAY_API_KEY`, `FAIRSUREPAY_SECRET_KEY`) and documentation are supplied by the merchant:
  1. Initialize the FairSurePay order/checkout session when `paymentMethod === "fairsurepay"`.
  2. Return the authorization or payment URL in `checkoutUrl`.
  3. Register the webhook handler (e.g. `POST /payments/fairsurepay/webhook`) to handle payment confirmation events idempotently.

---

## 5. What the mock route `/api/checkout` is

`src/app/api/checkout/route.ts` is a **mock payment route** (enabled with `MOCK_PAYMENTS=true`). It validates
the bag, recalculates totals and the seller split, and returns a fake `checkoutUrl` (the success page).
It's only used by `mock.ts`. With the real backend, `POST /orders` (#22) replaces it — you can delete it
or turn it into a proxy to your backend.

Note: in mock mode, listings created by sellers only exist in the visitor's browser, so this mock route
has to accept the price sent for those items. **Your backend must always read prices from the database.**

---

## 6. Suggested database tables

Generic layout for any database. **Using Supabase? Use the exact schema in section 8 instead.**

- `sellers` (id, business_name, owner_name, email unique, phone, password_hash, bank_name, bank_code, account_number, account_name, paystack_subaccount_code, status, created_at)
- `admins` (id, email, name, password_hash)
- `products` (id, slug unique, seller_id → sellers or "platform", name, description, product_type, gender, type_option jsonb, price, compare_at_price, badge, featured, images jsonb, colors jsonb, sizes jsonb, stock, material, fit, care, status, rejection_reason, created_at, updated_at)
- `orders` (id, reference unique, customer jsonb, subtotal, shipping_cost, total, commission_total, shipping_method, payment_method, status, paystack_reference, created_at, updated_at)
- `order_items` (id, order_id, product_id, seller_id, name, image, type, color, size, quantity, unit_price, line_total, commission_percent, commission_amount, seller_amount)

---

## 7. Checklist before going live

- [ ] All endpoints in section 3 implemented and returning the shapes in `src/lib/types.ts`
- [ ] Passwords hashed, tokens expire, admin and seller roles separated
- [ ] Prices/totals/commission recomputed server-side; only `approved` products purchasable
- [ ] Paystack subaccount created per seller; split payments tested in **test mode**
- [ ] Webhook signature verified; orders marked `paid` only from webhook/verify
- [ ] `PAYSTACK_SECRET_KEY` only on the server
- [ ] Upload storage domain added to `next.config.ts` → `images.remotePatterns`
- [ ] `NEXT_PUBLIC_API_MODE` set to `supabase` (or `http` + `NEXT_PUBLIC_API_BASE_URL`) in Vercel
- [ ] The 30 platform products from `src/lib/seed-data.ts` imported into the `products` table (seller `platform`), photos uploaded to storage

---

## 8. Connecting Supabase

Decision: the backend is **Supabase** (Postgres + Auth + Storage), built by the backend developer.
The frontend keeps the **mock as the default** until `supabase.ts` exists and is switched on.

### 8.1 Add the implementation and switch it on

1. `npm i @supabase/supabase-js` (and `@supabase/ssr` if you want cookie sessions in route handlers).
2. Create **`src/lib/api/supabase.ts`** exporting `export const supabaseApi: DataApi = { … }` with **exactly the same
   functions and signatures as `mock.ts`** (the `DataApi` interface in `src/lib/api/contract.ts`). TypeScript will
   refuse to compile if one is missing or returns the wrong shape. Return the shapes in `src/lib/types.ts`
   (map snake_case columns to camelCase; map `seller_id = null` to `sellerId: "platform"`).
3. In **`src/lib/api/index.ts`** uncomment the two marked lines:
   ```ts
   import { supabaseApi } from "./supabase";
   const implementations = { mock: mockApi, http: httpApi, supabase: supabaseApi };
   ```
4. Set `NEXT_PUBLIC_API_MODE=supabase`. `mock` stays the default; `NEXT_PUBLIC_USE_MOCK_API=false` (legacy) still means `http`.
5. Add `<project-ref>.supabase.co` to `images.remotePatterns` in `next.config.ts` (path `/storage/v1/object/public/**`).
6. Throw `ApiError(message, status)` from `./contract` for failures so the UI shows the message (401 → login page).

### 8.2 Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_MODE` | browser | `supabase` |
| `NEXT_PUBLIC_SUPABASE_URL` | browser | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser | Anon key (safe in the browser **only because RLS is on**) |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Route handlers: seller signup bank details, approval, orders, webhook. Never `NEXT_PUBLIC_`. |
| `PAYSTACK_SECRET_KEY` | **server only** | Subaccounts, transaction initialize/verify, webhook signature |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | browser | Only if you use Paystack Inline/Popup instead of the redirect |

All are listed in `.env.example`.

### 8.3 Tables (suggested)

```sql
-- One row per signed-up user (Supabase Auth). role decides what they can do.
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null check (role in ('seller','admin')),
  full_name text,
  created_at timestamptz not null default now()
);

create table sellers (
  id uuid primary key references profiles on delete cascade,   -- same id as the auth user
  business_name text not null,
  owner_name text not null,
  email text not null unique,
  phone text not null,
  status text not null default 'active' check (status in ('active','suspended')),
  paystack_subaccount_code text,                               -- set on first approval (8.6)
  created_at timestamptz not null default now()
);

-- Bank details in their own table so RLS can make them admin-only.
create table seller_bank_details (
  seller_id uuid primary key references sellers on delete cascade,
  bank_name text not null,
  bank_code text,                 -- Paystack bank code (GET https://api.paystack.co/bank?country=nigeria)
  account_number text not null check (account_number ~ '^\d{10}$'),
  account_name text not null
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  seller_id uuid references sellers,         -- NULL = the platform itself ("Sold by Rebel Fashion")
  seller_name text not null,                  -- denormalised for "Sold by …"
  name text not null,
  description text not null,
  product_type text not null,                 -- free text: Shirt, Dress, Kaftan, Bag…
  gender text not null default 'unisex' check (gender in ('men','women','kids','unisex')),
  type_option jsonb,                          -- {"label":"Length","values":["Short","Long"]} or null
  price integer not null check (price > 0),   -- whole Naira
  compare_at_price integer,
  badge text,
  featured boolean not null default false,
  images text[] not null default '{}',        -- public Storage URLs, first = cover
  sizes text[] not null default '{}',
  stock integer not null default 0 check (stock >= 0),
  material text, fit text, care text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_colours (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products on delete cascade,
  name text not null,
  hex text not null,
  image text,                                 -- optional colour photo
  position integer not null default 0
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,             -- also the Paystack reference
  customer jsonb not null,                    -- Customer shape
  delivery_location jsonb,
  subtotal integer not null, shipping_cost integer not null, total integer not null,
  commission_total integer not null,
  seller_splits jsonb not null,               -- SellerSplit[]
  shipping_method text not null, payment_method text not null,
  status text not null default 'pending' check (status in ('pending','paid','shipped','delivered','cancelled')),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders on delete cascade,
  product_id uuid not null references products,
  seller_id uuid references sellers,          -- NULL = platform
  seller_name text not null,
  slug text not null, name text not null, image text,
  type text not null default '', color text not null, size text not null,
  quantity integer not null, unit_price integer not null, line_total integer not null,
  commission_percent integer not null, commission_amount integer not null, seller_amount integer not null
);
```

Import the 30 platform products from `src/lib/seed-data.ts` once (`seller_id = null`, `seller_name = 'Rebel Fashion'`,
`status = 'approved'`), uploading `public/products/*.webp` to the bucket or keeping them as `/products/...` paths.

### 8.4 Row Level Security (turn RLS on for every table)

```sql
create function is_admin() returns boolean language sql stable security definer as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$;

-- profiles: you see yourself; admin sees all. Rows are created by the signup route (service role).
create policy "own profile" on profiles for select using (id = auth.uid() or is_admin());

-- sellers: a seller reads/updates their own row (not status/subaccount: do that in a server route); admin all.
create policy "seller reads self" on sellers for select using (id = auth.uid() or is_admin());
create policy "admin manages sellers" on sellers for all using (is_admin()) with check (is_admin());

-- bank details: ADMIN ONLY (written by the signup route with the service role key).
create policy "admin bank details" on seller_bank_details for all using (is_admin()) with check (is_admin());

-- products: public reads approved; sellers manage their own; admin everything.
create policy "public approved" on products for select using (status = 'approved');
create policy "seller reads own" on products for select using (seller_id = auth.uid());
create policy "seller inserts pending" on products for insert
  with check (seller_id = auth.uid() and status = 'pending');
create policy "seller edits own pending" on products for update
  using (seller_id = auth.uid() and status <> 'approved') with check (seller_id = auth.uid() and status = 'pending');
create policy "admin products" on products for all using (is_admin()) with check (is_admin());

-- product_colours follow their product.
create policy "colours readable" on product_colours for select using (
  exists (select 1 from products p where p.id = product_id and (p.status = 'approved' or p.seller_id = auth.uid() or is_admin())));
create policy "seller writes own colours" on product_colours for insert with check (
  exists (select 1 from products p where p.id = product_id and p.seller_id = auth.uid()));
create policy "admin colours" on product_colours for all using (is_admin()) with check (is_admin());

-- orders: created/updated only by server routes (service role). Admin reads all;
-- a seller reads orders that contain their items (and only sees their own lines via order_items).
create policy "admin orders" on orders for all using (is_admin()) with check (is_admin());
create policy "seller orders" on orders for select using (
  exists (select 1 from order_items i where i.order_id = id and i.seller_id = auth.uid()));
create policy "admin items" on order_items for all using (is_admin()) with check (is_admin());
create policy "seller items" on order_items for select using (seller_id = auth.uid());
```

Guest shoppers have no account: `getOrderByReference` should go through a server route that looks the order
up by its (unguessable) reference with the service role and returns only that order.

### 8.5 Storage: bucket `product-images`

- Create a **public** bucket `product-images` (public read; uploads restricted by policy).
- Path convention: `sellers/<auth.uid()>/<uuid>.jpg` (platform photos: `platform/<file>`).
- Policy: authenticated users may `insert` only under their own folder:
  ```sql
  create policy "sellers upload own folder" on storage.objects for insert to authenticated
    with check (bucket_id = 'product-images' and (storage.foldername(name))[1] = 'sellers'
                and (storage.foldername(name))[2] = auth.uid()::text);
  create policy "sellers delete own" on storage.objects for delete to authenticated
    using (bucket_id = 'product-images' and (storage.foldername(name))[2] = auth.uid()::text);
  ```
- `uploadListingImage(file)`: compress in the browser first (reuse `compressImageToDataUrl` from
  `src/lib/image-compress.ts`, then `await (await fetch(dataUrl)).blob()`), upload with
  `contentType: "image/jpeg"`, and return `getPublicUrl(path).data.publicUrl`.

### 8.6 Paystack (replaces the mock `/api/checkout`)

All Paystack calls run in **server route handlers** with `PAYSTACK_SECRET_KEY` (never in the browser).

1. **Subaccount on seller approval.** `approveListing` calls a route (e.g. `POST /api/admin/listings/:id/approve`)
   that checks the caller is admin, sets the product to `approved`, and — if the seller has no
   `paystack_subaccount_code` — calls `POST https://api.paystack.co/subaccount` with
   `{ business_name, settlement_bank: bank_code, account_number, percentage_charge: 10 }`
   (10 = `PLATFORM_COMMISSION_PERCENT`, the platform's share) and saves the returned `subaccount_code`.
2. **Initialize the transaction.** `createOrder` calls `POST /api/orders`, which re-reads every product (must be
   `approved`, in stock) and **uses database prices**, recomputes shipping and the 10% commission
   (`src/lib/commission.ts`), returns 409 if `displayedTotal` differs, inserts the order (`pending`) and items, then calls
   `POST https://api.paystack.co/transaction/initialize` with `{ email, amount: total × 100 (kobo), reference,
   callback_url: <site>/checkout/success?ref=<reference> }` plus the split:
   - one marketplace seller → `subaccount: "ACCT_…"` and `transaction_charge: (commission + shipping) × 100`
     so the platform keeps exactly its 10% plus delivery;
   - several sellers (or seller + platform items) → `split: { type: "flat", bearer_type: "account",
     subaccounts: [{ subaccount, share: sellerAmount × 100 }, …] }` (the platform keeps the rest);
   - platform-only bag → no split.
   Return `{ order, checkoutUrl: authorization_url }`.
3. **Webhook.** `POST /api/paystack/webhook`: read the **raw body**, verify `x-paystack-signature` equals
   HMAC-SHA512(raw body, `PAYSTACK_SECRET_KEY`), handle `charge.success`: find the order by `reference`, check the
   amount, then (idempotently) set `status = 'paid'`, `paid_at`, decrement stock. Never mark paid from the redirect.
   Optionally call `GET /transaction/verify/:reference` from the success page as well.
4. Delete `src/app/api/checkout/route.ts` (or leave `MOCK_PAYMENTS` unset so it's disabled) once this works.

### 8.7 Mapping: each API function → Supabase

| `DataApi` function | Supabase |
|---|---|
| `getProducts(filters)` | `from('products').select('*, product_colours(*)').eq('status','approved')` + `.in('gender',[g,'unisex'])`, `.or('name.ilike.%q%,description.ilike.%q%,product_type.ilike.%q%')`, `.eq('seller_id',…)`, `.in('id',ids)` |
| `getProduct(slugOrId)` | same select, `.or('slug.eq.X,id.eq.X')` (id only if it's a uuid) `.eq('status','approved').maybeSingle()` |
| `createSeller(input)` | server route: `auth.admin.createUser` (or `auth.signUp`) → insert `profiles` (role seller), `sellers`, `seller_bank_details` with service role → then `auth.signInWithPassword` in the browser |
| `loginSeller(email, pw)` | `auth.signInWithPassword` → check `profiles.role = 'seller'` → return `{ token: session.access_token, seller }` |
| `logoutSeller()` / `logoutAdmin()` | `auth.signOut()` |
| `getCurrentSeller()` | `auth.getUser()` → `from('sellers').select('*').eq('id', uid).maybeSingle()` (bank details: masked, via a server route or omitted) |
| `getSellerListings()` | `from('products').select('*, product_colours(*)').eq('seller_id', uid).order('created_at',{ascending:false})` |
| `createListing(input)` | insert `products` (`status:'pending'`, `seller_id: uid`, `seller_name`, unique `slug`) then insert `product_colours` |
| `uploadListingImage(file)` | compress → `storage.from('product-images').upload('sellers/<uid>/<uuid>.jpg', blob)` → `getPublicUrl` |
| `getSellerOrders()` | `from('order_items').select('*, orders(reference,status,created_at,customer)').eq('seller_id', uid)` grouped per order into `SellerOrderView` |
| `loginAdmin(email, pw)` | `auth.signInWithPassword` → require `profiles.role = 'admin'` (else sign out + 403) |
| `getAdminSession()` | `auth.getSession()` + `profiles` role check → `{ token, email, name }` or `null` |
| `getPendingListings()` | `from('products').select('*, product_colours(*)').eq('status','pending')` (admin RLS) |
| `getAllProducts()` | `from('products').select('*, product_colours(*)').order('created_at',{ascending:false})` |
| `approveListing(id)` | server route (8.6 step 1): update status + create Paystack subaccount if missing |
| `rejectListing(id, reason)` | `from('products').update({ status:'rejected', rejection_reason: reason }).eq('id', id)` |
| `getSellers()` | `from('sellers').select('*, seller_bank_details(*)')` (admin only) |
| `getOrders()` | `from('orders').select('*, order_items(*)').order('created_at',{ascending:false})` |
| `updateOrderStatus(id, s)` | `from('orders').update({ status: s, updated_at: now }).eq('id', id).select().single()` |
| `getAdminOverview()` | a SQL function / view (`rpc('admin_overview')`) summing products by status, sellers, orders, GMV, commission, own-store revenue, payouts (excluding cancelled) |
| `createOrder(input)` | `POST /api/orders` server route (8.6 step 2) → `{ order, checkoutUrl }` |
| `getOrderByReference(ref)` | `GET /api/orders/:reference` server route (service role, returns just that order) |
