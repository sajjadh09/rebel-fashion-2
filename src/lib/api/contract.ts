import type {
  AdminOverview,
  AdminSession,
  CreateOrderInput,
  CreateOrderResult,
  NewListingInput,
  Order,
  OrderStatus,
  Product,
  ProductFilters,
  Seller,
  SellerOrderView,
  SellerSession,
  SellerSignupInput,
} from "@/lib/types";

/**
 * Every data operation the frontend needs. Every implementation (mock.ts,
 * http.ts, and later e.g. supabase.ts) must provide exactly these functions,
 * so swapping the data source never touches a component.
 * Each function maps to one REST endpoint documented in BACKEND.md.
 */
export interface DataApi {
  // ── Catalogue (public) ──
  /** Approved products only. */
  getProducts(filters?: ProductFilters): Promise<Product[]>;
  /** Approved product by slug or id, or null. */
  getProduct(slugOrId: string): Promise<Product | null>;

  // ── Sellers ──
  createSeller(input: SellerSignupInput): Promise<SellerSession>;
  loginSeller(email: string, password: string): Promise<SellerSession>;
  logoutSeller(): Promise<void>;
  /** Seller for the stored session token, or null when signed out. */
  getCurrentSeller(): Promise<Seller | null>;
  /** All of the signed-in seller's listings, any status. */
  getSellerListings(): Promise<Product[]>;
  /** Submits a listing; it starts as "pending". */
  createListing(input: NewListingInput): Promise<Product>;
  /** Uploads one listing photo and returns its URL (data URL in mock mode). */
  uploadListingImage(file: File): Promise<string>;
  /** Orders that contain the signed-in seller's products (their lines only). */
  getSellerOrders(): Promise<SellerOrderView[]>;

  // ── Admin ──
  loginAdmin(email: string, password: string): Promise<AdminSession>;
  logoutAdmin(): Promise<void>;
  getAdminSession(): Promise<AdminSession | null>;
  getPendingListings(): Promise<Product[]>;
  /** Every product, any status. */
  getAllProducts(): Promise<Product[]>;
  approveListing(productId: string): Promise<Product>;
  rejectListing(productId: string, reason: string): Promise<Product>;
  getSellers(): Promise<Seller[]>;
  getOrders(): Promise<Order[]>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order>;
  getAdminOverview(): Promise<AdminOverview>;

  // ── Orders / checkout ──
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;
  getOrderByReference(reference: string): Promise<Order | null>;
}

/** Error with an HTTP-like status, thrown by both implementations. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
