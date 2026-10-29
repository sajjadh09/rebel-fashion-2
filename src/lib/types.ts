/**
 * Domain types shared by the UI, the mock API and the real HTTP API.
 * The backend should return JSON that matches these shapes (see BACKEND.md).
 * All money values are whole Naira (NGN), not kobo.
 */

export type Gender = "men" | "women" | "kids" | "unisex";

/** Listing moderation status. Only "approved" products are visible in the shop. */
export type ListingStatus = "pending" | "approved" | "rejected";

/**
 * The "Type" choice a shopper makes before adding to the bag, e.g.
 * { label: "Length", values: ["Short", "Long"] } or { label: "For", values: ["Men", "Women"] }.
 * Optional: products without it only ask for colour and size.
 */
export type ProductTypeOption = {
  /** Heading shown above the choices, e.g. "Length", "Fit", "For", "Set". */
  label: string;
  /** The choices, e.g. ["Short", "Long"]. */
  values: string[];
};

/** One colour option of a product. `image`/`images` are optional colour-specific photos. */
export type ColorVariant = {
  name: string;
  /** CSS colour used for the swatch, e.g. "#7B1E2B". */
  hex: string;
  /** Main photo for this colour. Falls back to the product's first image. */
  image?: string;
  /** Extra photos for this colour (gallery). */
  images?: string[];
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Free-text product type entered by the seller, e.g. "Kaftan", "Shirt", "Dress", "Bag". */
  productType: string;
  /** Controlled category option, e.g. "Kaftans & Traditional", "Shirts & Tops". */
  category?: string;
  /** "unisex" also means "not specified". */
  gender: Gender;
  /** Optional Type choice (e.g. Short/Long). Shoppers must pick one when present. */
  typeOption?: ProductTypeOption | null;
  price: number;
  compareAtPrice?: number;
  badge?: string;
  featured?: boolean;
  /** General product photos (URLs). Colour photos live on each ColorVariant. */
  images: string[];
  colors: ColorVariant[];
  sizes: string[];
  stock: number;
  material: string;
  fit: string;
  care: string;
  sellerId: string;
  sellerName: string;
  status: ListingStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
};

export type BankDetails = {
  bankName: string;
  accountNumber: string;
  accountName: string;
};

export type Seller = {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  bank: BankDetails;
  /** Paystack subaccount code (e.g. "ACCT_xxx"). Created by the backend, null until then. */
  paystackSubaccountCode: string | null;
  status: "active" | "suspended";
  createdAt: string;
};

export type SellerSignupInput = {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  password: string;
  bank: BankDetails;
};

export type SellerSession = {
  token: string;
  seller: Seller;
};

export type AdminSession = {
  token: string;
  email: string;
  name: string;
};

/** What a seller submits from the "New listing" form. */
export type NewListingInput = {
  name: string;
  description: string;
  /** Free text, e.g. "Shirt", "Dress", "Kaftan", "Shoes", "Bag". */
  productType: string;
  /** Controlled category from CONTROLLED_CATEGORIES. */
  category?: string;
  /** Optional. Omitted or "unisex" = not specified. */
  gender?: Gender;
  /** Optional Type choice shoppers pick from, e.g. { label: "Length", values: ["Short", "Long"] }. */
  typeOption?: ProductTypeOption | null;
  sizes: string[];
  colors: ColorVariant[];
  images: string[];
  price: number;
  stock: number;
  material?: string;
};

export type ProductFilters = {
  gender?: Gender | "all";
  category?: string;
  search?: string;
  sellerId?: string;
  ids?: string[];
};

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export type ShippingMethod = "standard" | "priority";
export type PaymentMethod = "card" | "transfer" | "fairsurepay";

export type Customer = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
};

export type OrderItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  /** Chosen Type value (e.g. "Long"), empty when the product has no Type option. */
  type?: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  sellerId: string;
  sellerName: string;
  /** Commission % applied to this line (0 for the platform's own products). */
  commissionPercent: number;
  /** Platform commission on this line. */
  commissionAmount: number;
  /** What the seller receives for this line (lineTotal - commissionAmount). */
  sellerAmount: number;
};

/** Money owed to one seller inside an order (sum of that seller's lines). */
export type SellerSplit = {
  sellerId: string;
  sellerName: string;
  grossAmount: number;
  commissionAmount: number;
  sellerAmount: number;
};

export type Order = {
  id: string;
  reference: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  commissionTotal: number;
  sellerSplits: SellerSplit[];
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
};

/** Line sent by the cart when creating an order. Prices are re-checked by the server. */
export type CreateOrderItemInput = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  /** Chosen Type value (e.g. "Long"), empty when the product has no Type option. */
  type?: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  sellerId: string;
  sellerName: string;
};

export type CreateOrderInput = {
  customer: Customer;
  deliveryLocation?: { latitude: number; longitude: number } | null;
  items: CreateOrderItemInput[];
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  displayedSubtotal: number;
  displayedShipping: number;
  displayedTotal: number;
};

export type CreateOrderResult = {
  order: Order;
  /** Where to send the shopper to pay (Paystack authorization_url in production). */
  checkoutUrl: string;
};

/** A seller's view of an order: only their own lines. */
export type SellerOrderView = {
  orderId: string;
  reference: string;
  status: OrderStatus;
  createdAt: string;
  customerName: string;
  city: string;
  state: string;
  items: OrderItem[];
  grossAmount: number;
  commissionAmount: number;
  sellerAmount: number;
};

export type AdminOverview = {
  productCounts: { approved: number; pending: number; rejected: number; total: number };
  sellerCount: number;
  orderCount: number;
  /** Gross merchandise value: sum of order subtotals, excluding cancelled orders. */
  gmv: number;
  /** Platform commission earned on marketplace (third-party) sales, excluding cancelled. */
  commissionEarned: number;
  /** Revenue from the platform's own products, excluding cancelled. */
  ownStoreRevenue: number;
  /** Amount owed to / paid to sellers, excluding cancelled. */
  sellerPayouts: number;
  ordersByStatus: Record<OrderStatus, number>;
};
