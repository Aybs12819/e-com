import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface CustomProductDataPayload {
  name: string;
  description: string;
  category_id: string;
  image_urls: string[];
  slug: string;
  base_price: number | null;
  status: string; // Custom products will have a status
  customer_id?: string | null; // Optional customer ID
}

export async function POST(req: Request) {
  try {
    const customProductData: CustomProductDataPayload = await req.json();
    const adminSupabase = createAdminClient();

    const { data: customProduct, error: customProductError } =
      await adminSupabase
        .from("custom_products")
        .insert([
          {
            name: customProductData.name,
            description: customProductData.description,
            category_id: customProductData.category_id,
            images: customProductData.image_urls,
            slug: customProductData.slug,
            base_price: customProductData.base_price,
            status: "Confirmed Order", // Default status for new custom products
            customer_id: customProductData.customer_id === "" ? null : customProductData.customer_id,
          },
        ])
        .select("id");

    if (customProductError) {
      console.error("Custom Product insertion error:", customProductError);
      return NextResponse.json(
        { error: customProductError.message },
        { status: 500 }
      );
    }

    if (!customProduct || customProduct.length === 0) {
      return NextResponse.json(
        { error: "Failed to retrieve custom product after insertion." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Custom Product added successfully!" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { customProductId, customProductData } = await req.json();
    const adminSupabase = createAdminClient();

    // Build update object with only provided fields
    const updateData: any = {};

    if (customProductData.name !== undefined)
      updateData.name = customProductData.name;
    if (customProductData.description !== undefined)
      updateData.description = customProductData.description;
    if (customProductData.category_id !== undefined)
      updateData.category_id = customProductData.category_id;
    if (customProductData.image_urls !== undefined)
      updateData.images = customProductData.image_urls;
    if (customProductData.slug !== undefined)
      updateData.slug = customProductData.slug;
    if (customProductData.base_price !== undefined)
      updateData.base_price = customProductData.base_price;
    if (customProductData.status !== undefined)
      updateData.status = customProductData.status;
    if (customProductData.customer_id !== undefined)
      updateData.customer_id = customProductData.customer_id;
    if (customProductData.rider_id !== undefined)
      updateData.rider_id = customProductData.rider_id;

    const { error: customProductUpdateError } = await adminSupabase
      .from("custom_products")
      .update(updateData)
      .eq("id", customProductId);

    if (customProductUpdateError) {
      console.error("Custom Product update error:", customProductUpdateError);
      return NextResponse.json(
        { error: customProductUpdateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Custom Product updated successfully!" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customProductId = searchParams.get("id");

    if (!customProductId) {
      return NextResponse.json(
        { error: "Custom Product ID is required" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    const { error: deleteCustomProductError } = await adminSupabase
      .from("custom_products")
      .delete()
      .eq("id", customProductId);

    if (deleteCustomProductError) {
      console.error("Error deleting custom product:", deleteCustomProductError);
      return NextResponse.json(
        { error: deleteCustomProductError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Custom Product deleted successfully!" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const adminSupabase = createAdminClient();

    const { data: customProducts, error: customProductsError } =
      await adminSupabase.from("custom_products").select("*");

    if (customProductsError) {
      console.error("Error fetching custom products:", customProductsError);
      return NextResponse.json({ error: customProductsError.message }, { status: 500 });
    }

    return NextResponse.json(customProducts);
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
