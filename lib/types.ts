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
  is_active: boolean;
  categories: { name: string } | null;
  variantCombinations: VariantCombination[];
}

export interface Rider {
  id: string;
  full_name: string;
  role: string;
}

export type GroupedProductVariant = {
  type: string;
  value: string[];
  price: number[];
  stock: number[];
}