import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { VariantCombination } from "@/components/admin/VariantPriceStockModal";

interface ProductDataPayload {
  name: string;
  description: string;
  // price: number | null; // Removed as per user's instruction
  // stock: number | null; // Removed as per user's instruction
  category_id: string;
  image_urls: string[];
  variantCombinations: VariantCombination[];
  is_active: boolean;
  slug: string;
}

interface PostRequestBody {
  productData: ProductDataPayload;
  variants: any[];
}

export async function POST(req: Request) {
  try {
    const { productData, variants }: PostRequestBody = await req.json();
    const adminSupabase = createAdminClient();

    let basePrice: number | null = null;

    if (productData.variantCombinations && productData.variantCombinations.length > 0) {
      const prices = productData.variantCombinations
        .map((vc: VariantCombination) => Number(vc.price))
        .filter((p: number) => !isNaN(p));

      if (prices.length > 0) {
        basePrice = Math.min(...prices);
      }
    }

    const { data: product, error: productError } = await adminSupabase
      .from("products")
      .insert([{
        name: productData.name,
        description: productData.description,
        category_id: productData.category_id,
        image_urls: productData.image_urls,
        is_active: productData.is_active,
        slug: productData.slug,
        base_price: basePrice,
        variant_combinations: productData.variantCombinations, // ✅ ADD THIS
      }])
      .select("id");

    if (productError) {
      console.error("Product insertion error:", productError);
      return NextResponse.json({ error: productError.message }, { status: 500 });
    }

    if (!product || product.length === 0) {
      return NextResponse.json({ error: "Failed to retrieve product after insertion." }, { status: 500 });
    }

    if (variants && variants.length > 0) {
      const product_id = product[0].id;
      const variantData = variants.flatMap((variant: any) =>
        variant.value ? variant.value.map((val: string, idx: number) => ({
          product_id,
          type: variant.type,
          variation_name: variant.type,
          variation_value: val,
          stock_quantity: variant.stock[idx],
        })) : []
      );

      const { error: variantError } = await adminSupabase
        .from("product_variations")
        .insert(variantData);

      if (variantError) {
        console.error("Variant insertion error:", variantError);
        return NextResponse.json({ error: variantError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ message: "Product added successfully!" }, { status: 200 });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { productId, productData, variants } = await req.json();
    const adminSupabase = createAdminClient();

    const { variantCombinations, ...restOfProductData } = productData;

    let basePrice: number | null = null;

    if (variantCombinations && variantCombinations.length > 0) {
      const prices = variantCombinations
        .map((vc: VariantCombination) => Number(vc.price))
        .filter((p: number) => !isNaN(p));

      if (prices.length > 0) {
        basePrice = Math.min(...prices);
      }
    }

    const { data, error: productUpdateError } = await adminSupabase
      .from("products")
      .update({
        ...restOfProductData,
        base_price: basePrice,
        variant_combinations: variantCombinations,
      })
      .eq("id", productId);

    if (productUpdateError) {
      console.error("Product update error:", productUpdateError);
      return NextResponse.json({ error: productUpdateError.message }, { status: 500 });
    }

    // Delete existing variants for the product
    const { error: deleteError } = await adminSupabase
      .from("product_variations")
      .delete()
      .eq("product_id", productId);

    if (deleteError) {
      console.error("Variant deletion error:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Insert new variants
    if (variants && variants.length > 0) {
      const variantData = variants.flatMap((variant: any) =>
        variant.value ? variant.value.map((val: string, idx: number) => ({
          product_id: productId,
          type: variant.type,
          variation_name: variant.type,
          variation_value: val,
          stock_quantity: variant.stock[idx],
        })) : []
      );

      const { error: variantInsertError } = await adminSupabase
        .from("product_variations")
        .insert(variantData);

      if (variantInsertError) {
        console.error("Variant insertion error:", variantInsertError);
        return NextResponse.json({ error: variantInsertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ message: "Product updated successfully!" }, { status: 200 });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // Delete associated product variations first
    const { error: deleteVariationsError } = await adminSupabase
      .from("product_variations")
      .delete()
      .eq("product_id", productId);

    if (deleteVariationsError) {
      console.error("Error deleting product variations:", deleteVariationsError);
      return NextResponse.json({ error: deleteVariationsError.message }, { status: 500 });
    }

    // Then delete the product
    const { error: deleteProductError } = await adminSupabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (deleteProductError) {
      console.error("Error deleting product:", deleteProductError);
      return NextResponse.json({ error: deleteProductError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Product deleted successfully!" }, { status: 200 });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}