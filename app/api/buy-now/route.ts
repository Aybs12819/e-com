import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { getShippingFee, shippingFees } from "@/lib/shipping";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Ensure the user has a customer account
  const { data: customerAccount, error: customerAccountError } = await supabase
    .from('customer_accounts')
    .select('id, address')
    .eq('id', user.id)
    .single();

  if (customerAccountError && customerAccountError.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error('Error fetching customer account:', customerAccountError);
    return NextResponse.json({ error: 'Failed to fetch user customer account' }, { status: 500 });
  }

  if (!customerAccount) {
    // If no customer account exists, create one
    const { error: insertCustomerAccountError } = await supabase
      .from('customer_accounts')
      .insert({ 
        id: user.id, 
        first_name: user.user_metadata?.full_name || 'New',
        last_name: 'User',
        email: user.email,
      });

    if (insertCustomerAccountError) {
      console.error('Error creating customer account:', insertCustomerAccountError);
      return NextResponse.json({ error: 'Failed to create user customer account' }, { status: 500 });
    }
  }

  const { productId, quantity, selectedCombinationString } = await request.json();

  if (!productId || !quantity) {
    return NextResponse.json({ error: 'Product ID and quantity are required' }, { status: 400 });
  }

  let itemPrice: number;
  let variationIdToStore: string | null = null;
  let calculatedShippingFee = 0;

  try {
      // Fetch product details to get the base price or variant combination price
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('base_price, variant_combinations, product_variations(*)') // Fetch product_variations
        .eq('id', productId)
        .single();

      if (productError) {
        if (productError.code === 'PGRST116') { // Supabase error code for "no rows found"
          return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }
        console.error('Error fetching product details:', productError);
        return NextResponse.json({ error: 'Failed to fetch product details' }, { status: 500 });
      }

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      if (selectedCombinationString) {
        const selectedCombination = product.variant_combinations.find(
          (combination: any) => combination.combination === selectedCombinationString
        );

        if (!selectedCombination) {
          return NextResponse.json({ error: 'Product variation not found' }, { status: 404 });
        }
        itemPrice = selectedCombination.price;

        // Derive variationIdToStore from product.product_variations based on the first variant value
        const selectedVariantValues = selectedCombinationString.split(" - ");
        if (selectedVariantValues.length > 0) {
          const firstSelectedVariantValue = selectedVariantValues[0].split(": ")[1]; // Extract value after "Type: "
          const matchingProductVariation = product.product_variations.find(
            (pv: any) => pv.variation_value === firstSelectedVariantValue
          );
          if (matchingProductVariation) {
            variationIdToStore = matchingProductVariation.id;
          }
        }
      } else {
        itemPrice = product.base_price;
      }

    // Calculate shipping fee
    if (customerAccount?.address) {
      const userAddress = customerAccount.address;
      const addressParts = userAddress.split(",").map((part: string) => part.trim());
      let foundMunicipality: string | undefined;
      let foundRegionKey: string | undefined;

      for (const part of addressParts) {
        for (const regionKey in shippingFees) {
          if (shippingFees[regionKey].municipalities[part]) {
            foundMunicipality = part;
            foundRegionKey = regionKey;
            break;
          }
        }
        if (foundMunicipality) break;
      }

      if (foundRegionKey && foundMunicipality) {
        const fee = getShippingFee(foundRegionKey, foundMunicipality);
        if (fee !== undefined) {
          calculatedShippingFee = fee;
        }
      }
    }

    const subtotal = itemPrice * quantity;
    const totalAmount = subtotal + calculatedShippingFee;

    console.log('Attempting to create order with customer_id:', user.id);
    if (customerAccount) {
      console.log('Customer account ID:', customerAccount.id);
    }
    console.log('User object before RPC call:', user);
    console.log('User ID before RPC call:', user.id);

    // Set the role to 'authenticated' for the current session to ensure RLS policies are correctly evaluated
    const { error: rpcError } = await supabase.rpc('set_auth_user_id', { user_id: user.id });
    if (rpcError) {
      console.error('Error setting auth user ID:', rpcError);
      return NextResponse.json({ error: 'Failed to set auth user ID', details: rpcError }, { status: 500 });
    }

    // Decrement stock in variant_combinations if a specific combination was selected
    if (selectedCombinationString && product.variant_combinations) {
      const selectedCombination = product.variant_combinations.find(
        (combination: any) => combination.combination === selectedCombinationString
      );

      if (!selectedCombination) {
        return NextResponse.json({ error: 'Product variation not found for stock update' }, { status: 404 });
      }

      if (selectedCombination.stock < quantity) {
        return NextResponse.json({ error: 'Insufficient stock for selected variation' }, { status: 400 });
      }

      const updatedVariantCombinations = product.variant_combinations.map((combination: any) => {
        if (combination.combination === selectedCombinationString) {
          return { ...combination, stock: combination.stock - quantity };
        }
        return combination;
      });

      const adminSupabase = createAdminClient();
      const { error: updateStockError } = await adminSupabase
        .from('products')
        .update({ variant_combinations: updatedVariantCombinations })
        .eq('id', productId);

      if (updateStockError) {
        console.error('Error updating product stock:', updateStockError);
        return NextResponse.json({ error: 'Failed to update product stock' }, { status: 500 });
      }
    }

    // Revert temporary hardcoded UUID and console.log
    // Create a new order using the create_order RPC
    const shippingAddress = customerAccount?.address || {
      street: "Default Street",
      city: "Default City",
      zip: "00000",
      country: "Default Country"
    };

    // For buy-now, we simulate a single cart item for the RPC
    // This assumes the create_order RPC can handle a single item in cart_item_ids
    // In a real scenario, you might want to create a temporary cart item in the database
    // or modify the RPC to accept product_id, quantity, etc. directly.
    // For now, we'll pass a dummy cart_item_id as the RPC expects an array of UUIDs.
    // This will require the `create_order` RPC to be updated to handle this.
    // For a direct fix, we'll assume the RPC can handle a single item.

    // First, let's create a dummy cart item to pass to the RPC.
    // This is a temporary workaround. A more robust solution would involve
    // modifying the `create_order` RPC to accept product details directly.
    const { data: dummyCartItem, error: dummyCartItemError } = await supabase
      .from('cart_items')
      .insert({
        user_id: user.id,
        product_id: productId,
        quantity: quantity,
        price: itemPrice,
        ...(variationIdToStore && { variation_id: variationIdToStore }),
      })
      .select('id')
      .single();

    if (dummyCartItemError || !dummyCartItem) {
      console.error('Error creating dummy cart item:', dummyCartItemError);
      return NextResponse.json({ error: 'Failed to create dummy cart item', details: dummyCartItemError }, { status: 500 });
    }

    const { data: order, error: orderError } = await supabase.rpc("create_order", {
      customer_id: user.id,
      cart_item_ids: [dummyCartItem.id],
      shipping_address: shippingAddress,
      total_amount: totalAmount,
      p_shipping_fee: calculatedShippingFee,
    });

    if (orderError || !order) {
      console.error('Error creating order:', orderError);
      return NextResponse.json({ error: 'Failed to create order', details: orderError }, { status: 500 });
    }

    // The RPC returns the order ID directly, not an object with an 'id' property.
    const orderId = order;
    
    return NextResponse.json({ message: 'Order created successfully', orderId: orderId }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error during buy now:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}