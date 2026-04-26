import { Provider } from './provider.model';
import { PurchaseStatus } from './common.model';

/**
 * Purchase-related interfaces
 */

export interface PurchaseItem {
  id?: string; // Present in API responses, needed for editing
  productId: string;
  quantity: number;
  pricePerUnit: number;
  productName?: string;
}

export interface Purchase {
  id: string;
  providerId: string;
  createdById: string;
  status: PurchaseStatus;
  items: PurchaseItem[];
  totalAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseDetail extends Purchase {
  provider: Provider;
}

export interface CreatePurchaseRequest {
  providerId: string;
  createdById: string;
  items: Array<{
    productId: string;
    quantity: number;
    pricePerUnit: number;
  }>;
}

export interface UpdatePurchaseRequest {
  status?: PurchaseStatus;
}
