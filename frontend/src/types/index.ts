export type Role = "ADMIN" | "SALES" | "WAREHOUSE" | "ACCOUNTS";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export type CustomerType = "RETAIL" | "WHOLESALE" | "DISTRIBUTOR";
export type CustomerStatus = "LEAD" | "ACTIVE" | "INACTIVE";

export interface FollowUpNote {
  id: string;
  customerId: string;
  createdBy: string;
  note: string;
  followUpDate?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  businessName?: string;
  gstNumber?: string;
  customerType: CustomerType;
  address?: string;
  status: CustomerStatus;
  followUpDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  followups?: FollowUpNote[];
}

export interface CreateCustomerPayload {
  name: string;
  mobile: string;
  email?: string;
  businessName?: string;
  gstNumber?: string;
  customerType: CustomerType;
  address?: string;
  status?: CustomerStatus;
  followUpDate?: string;
  notes?: string;
}

export type UpdateCustomerPayload = Partial<CreateCustomerPayload>;

export interface AddFollowUpPayload {
  note: string;
  followUpDate?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  warehouseLocation?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductPayload {
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock?: number;
  minimumStock?: number;
  warehouseLocation?: string;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CustomersResponse {
  customers: Customer[];
  pagination: Pagination;
}

export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

export type StockMovementType = "IN" | "OUT";

export interface StockMovement {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  reason?: string;
  createdBy: string;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface StockMovementPayload {
  productId: string;
  quantity: number;
  reason?: string;
}

export type ChallanStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export interface ChallanItem {
  id?: string;
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  customer?: Customer;
  status: ChallanStatus;
  totalQuantity: number;
  createdAt: string;
  updatedAt: string;
  items?: ChallanItem[];
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateChallanPayload {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}