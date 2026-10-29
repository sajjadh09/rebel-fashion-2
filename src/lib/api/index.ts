/**
 * THE single entry point for data in the frontend.
 *
 * Components import from "@/lib/api" and never talk to localStorage or fetch()
 * for domain data directly. Which implementation runs is decided by
 * NEXT_PUBLIC_USE_MOCK_API (see src/lib/config.ts and BACKEND.md):
 *   - mock.ts  -> demo data stored in the browser (default)
 *   - http.ts  -> real REST backend at NEXT_PUBLIC_API_BASE_URL
 */
import { USE_MOCK_API } from "@/lib/config";
import type { DataApi } from "./contract";
import { httpApi } from "./http";
import { mockApi } from "./mock";

export const api: DataApi = USE_MOCK_API ? mockApi : httpApi;

export { ApiError } from "./contract";
export type { DataApi } from "./contract";

export const getStyles: DataApi["getStyles"] = (...args) => api.getStyles(...args);
export const getProducts: DataApi["getProducts"] = (...args) => api.getProducts(...args);
export const getProduct: DataApi["getProduct"] = (...args) => api.getProduct(...args);

export const createSeller: DataApi["createSeller"] = (...args) => api.createSeller(...args);
export const loginSeller: DataApi["loginSeller"] = (...args) => api.loginSeller(...args);
export const logoutSeller: DataApi["logoutSeller"] = (...args) => api.logoutSeller(...args);
export const getCurrentSeller: DataApi["getCurrentSeller"] = (...args) => api.getCurrentSeller(...args);
export const getSellerListings: DataApi["getSellerListings"] = (...args) => api.getSellerListings(...args);
export const createListing: DataApi["createListing"] = (...args) => api.createListing(...args);
export const uploadListingImage: DataApi["uploadListingImage"] = (...args) => api.uploadListingImage(...args);
export const getSellerOrders: DataApi["getSellerOrders"] = (...args) => api.getSellerOrders(...args);

export const loginAdmin: DataApi["loginAdmin"] = (...args) => api.loginAdmin(...args);
export const logoutAdmin: DataApi["logoutAdmin"] = (...args) => api.logoutAdmin(...args);
export const getAdminSession: DataApi["getAdminSession"] = (...args) => api.getAdminSession(...args);
export const getPendingListings: DataApi["getPendingListings"] = (...args) => api.getPendingListings(...args);
export const getAllProducts: DataApi["getAllProducts"] = (...args) => api.getAllProducts(...args);
export const approveListing: DataApi["approveListing"] = (...args) => api.approveListing(...args);
export const rejectListing: DataApi["rejectListing"] = (...args) => api.rejectListing(...args);
export const getSellers: DataApi["getSellers"] = (...args) => api.getSellers(...args);
export const getOrders: DataApi["getOrders"] = (...args) => api.getOrders(...args);
export const updateOrderStatus: DataApi["updateOrderStatus"] = (...args) => api.updateOrderStatus(...args);
export const getAdminOverview: DataApi["getAdminOverview"] = (...args) => api.getAdminOverview(...args);

export const createOrder: DataApi["createOrder"] = (...args) => api.createOrder(...args);
export const getOrderByReference: DataApi["getOrderByReference"] = (...args) => api.getOrderByReference(...args);
