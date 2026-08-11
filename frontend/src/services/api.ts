import axios from "axios";
import type {
  Customer,
  CustomersResponse,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  AddFollowUpPayload,
  FollowUpNote,
  Product,
  ProductsResponse,
  CreateProductPayload,
  UpdateProductPayload,
  StockMovement,
  StockMovementPayload,
  Challan,
  CreateChallanPayload,
} from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const customerApi = {
  getCustomers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customerType?: string;
  }) =>
    api.get<{ success: boolean; data: CustomersResponse }>("/customers", { params }),

  getCustomerById: (id: string) =>
    api.get<{ success: boolean; data: Customer }>(`/customers/${id}`),

  createCustomer: (data: CreateCustomerPayload) =>
    api.post<{ success: boolean; message: string; data: Customer }>("/customers", data),

  updateCustomer: (id: string, data: UpdateCustomerPayload) =>
    api.put<{ success: boolean; message: string; data: Customer }>(`/customers/${id}`, data),

  deleteCustomer: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/customers/${id}`),

  addFollowup: (id: string, data: AddFollowUpPayload) =>
    api.post<{ success: boolean; message: string; data: FollowUpNote }>(
      `/customers/${id}/followups`,
      data
    ),
};

export const productApi = {
  getProducts: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    lowStock?: boolean;
  }) =>
    api.get<{ success: boolean; data: ProductsResponse }>("/products", { params }),

  getProductById: (id: string) =>
    api.get<{ success: boolean; data: Product }>(`/products/${id}`),

  createProduct: (data: CreateProductPayload) =>
    api.post<{ success: boolean; message: string; data: Product }>("/products", data),

  updateProduct: (id: string, data: UpdateProductPayload) =>
    api.put<{ success: boolean; message: string; data: Product }>(`/products/${id}`, data),

  deleteProduct: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/products/${id}`),
};

export const stockApi = {
  stockIn: (data: StockMovementPayload) =>
    api.post<{ success: boolean; message: string; data: StockMovement }>("/stock/in", data),

  stockOut: (data: StockMovementPayload) =>
    api.post<{ success: boolean; message: string; data: StockMovement }>("/stock/out", data),

  getMovements: (productId?: string) =>
    api.get<{ success: boolean; data: StockMovement[] }>("/stock/movements", {
      params: { productId },
    }),
};

export const challanApi = {
  getChallans: () =>
    api.get<{ success: boolean; data: Challan[] }>("/challans"),

  getChallanById: (id: string) =>
    api.get<{ success: boolean; data: Challan }>(`/challans/${id}`),

  createChallan: (data: CreateChallanPayload) =>
    api.post<{ success: boolean; message: string; data: Challan }>("/challans", data),

  confirmChallan: (id: string) =>
    api.post<{ success: boolean; message: string; data: Challan }>(`/challans/${id}/confirm`),

  cancelChallan: (id: string) =>
    api.post<{ success: boolean; message: string; data: Challan }>(`/challans/${id}/cancel`),
};

export default api;