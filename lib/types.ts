import { VariantCombination } from "@/components/admin/VariantPriceStockModal";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  category_id: string;
  slug: string;
  variants: GroupedProductVariant[];
  image_urls: string[];
  created_at: string;
  is_active: string;
  preorder_lead_time?: string; // Added preorder_lead_time
  categories: { name: string } | null;
  variantCombinations: VariantCombination[];
  average_rating?: number;
  review_count?: number;
}

export interface Rider {
  id: string;
  full_name: string;
  role: string;
  address: string;
}

export type GroupedProductVariant = {
  type: string;
  value: string[];
  price: number[];
  stock: number[];
};

export interface Order {
  idx: number;
  id: string;
  customer_id: string;
  total_amount: string;
  status: string;
  shipping_address: string;
  created_at: string;
  updated_at: string;
  shipping_fee: string;
  rider_id: string | null;
}
