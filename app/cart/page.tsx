"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Minus, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState, useEffect, useMemo, useCallback, Suspense } from "react"
import { getShippingFee, shippingFees } from "@/lib/shipping"
import { toast } from "@/hooks/use-toast"; // Explicitly import toast
import Script from "next/script";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  base_price: number;
  image_urls: string[];
}

interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  variant_name: string;
  price: number; // Added price to CartItem interface
  products: Product;
}

function CartPageContent() {
  const supabaseClient = supabase;
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // New state for selected item IDs
  const [subtotal, setSubtotal] = useState(0);
  const [userAddress, setUserAddress] = useState<string | null>(null)
  const [shippingFee, setShippingFee] = useState<number | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState<boolean>(true);
  const [showCalculatingShipping, setShowCalculatingShipping] = useState<boolean>(false);

  const getUserSession = useCallback(async () => {
    setIsLoadingAddress(true);
    const {
      data: { session },
    } = await supabaseClient.auth.getSession()
    if (session) {
      setUserAddress(session.user?.user_metadata?.address || null)
    }
    setIsLoadingAddress(false);
  }, [supabaseClient, setUserAddress, setIsLoadingAddress]);

  useEffect(() => {
    getUserSession()
  }, [getUserSession])

  useEffect(() => {
    if (userAddress) {
      console.log("User Address:", userAddress);
      setShowCalculatingShipping(true);
      
      // Try multiple address parsing strategies
      const addressParts = userAddress.split(",").map((part) => part.trim());
      const addressWords = userAddress.toLowerCase().split(/[\s,]+/).filter(word => word.length > 2);
      console.log("Address Parts:", addressParts);
      console.log("Address Words:", addressWords);
      
      let foundMunicipality: string | undefined;
      let foundRegionKey: string | undefined;

      // Strategy 1: Exact match with address parts
      for (const regionKey in shippingFees) {
        const regionData = shippingFees[regionKey];
        for (const municipalityName in regionData.municipalities) {
          // Check if any part of the user's address includes the municipality name
          if (addressParts.some(part => part.toLowerCase() === municipalityName.toLowerCase()) ||
              addressParts.some(part => part.toLowerCase().includes(municipalityName.toLowerCase())) ||
              municipalityName.toLowerCase().includes(addressParts[0]?.toLowerCase() || "")) {
            foundMunicipality = municipalityName;
            foundRegionKey = regionKey;
            console.log(`Found exact match: ${municipalityName} in ${regionKey}`);
            break;
          }
        }
        if (foundMunicipality) break;
      }

      // Strategy 2: Word-based matching if exact match failed
      if (!foundMunicipality) {
        console.log("Trying word-based matching...");
        for (const regionKey in shippingFees) {
          const regionData = shippingFees[regionKey];
          for (const municipalityName in regionData.municipalities) {
            // Check if any word in address matches municipality
            if (addressWords.some(word => 
                municipalityName.toLowerCase().includes(word) || 
                word.includes(municipalityName.toLowerCase()))) {
              foundMunicipality = municipalityName;
              foundRegionKey = regionKey;
              console.log(`Found word match: ${municipalityName} in ${regionKey}`);
              break;
            }
          }
          if (foundMunicipality) break;
        }
      }

      // Strategy 3: Fuzzy matching for common variations
      if (!foundMunicipality) {
        console.log("Trying fuzzy matching...");
        const municipalityMap: { [key: string]: string } = {
          'dagupan': 'Dagupan City',
          'san carlos': 'San Carlos City',
          'alaminos': 'Alaminos City',
          'lingayen': 'Lingayen',
          'calasiao': 'Calasiao',
          'mangaldan': 'Mangaldan',
          'san fabian': 'San Fabian',
          'malasiqui': 'Malasiqui',
          'bayambang': 'Bayambang',
          'basista': 'Basista',
          'santa barbara': 'Santa Barbara',
          'binalonan': 'Binalonan',
          'pozorrubio': 'Pozorrubio',
          'rosales': 'Rosales',
          'villasis': 'Villasis',
          'asingan': 'Asingan',
          'tayug': 'Tayug',
          'san quintin': 'San Quintin',
          'san manuel': 'San Manuel',
          'san nicolas': 'San Nicolas',
          'umingan': 'Umingan',
          'natividad': 'Natividad',
          'laoac': 'Laoac',
          'bolinao': 'Bolinao',
          'anda': 'Anda',
          'bani': 'Bani',
          'mabini': 'Mabini',
          'dasol': 'Dasol',
          'infanta': 'Infanta',
          'burgos': 'Burgos',
          'agno': 'Agno',
          'alcala': 'Alcala',
          'balungao': 'Balungao',
          'bautista': 'Bautista',
          'mangatarem': 'Mangatarem',
          'mapandan': 'Mapandan',
          'manaoag': 'Manaoag',
          'san jacinto': 'San Jacinto',
          'santa maria': 'Santa Maria',
          'santo tomas': 'Santo Tomas',
          'sison': 'Sison',
          'sual': 'Sual',
          'urbiztondo': 'Urbiztondo'
        };

        for (const [key, value] of Object.entries(municipalityMap)) {
          if (addressWords.some(word => key.includes(word) || word.includes(key))) {
            foundMunicipality = value;
            // Find the region for this municipality
            for (const regionKey in shippingFees) {
              if (shippingFees[regionKey].municipalities[value]) {
                foundRegionKey = regionKey;
                console.log(`Found fuzzy match: ${value} in ${regionKey}`);
                break;
              }
            }
            break;
          }
        }
      }

      console.log("Final result:", { foundMunicipality, foundRegionKey });

      if (foundRegionKey && foundMunicipality) {
        const fee = getShippingFee(foundRegionKey, foundMunicipality);
        if (fee !== undefined) {
          setShippingFee(fee);
          setShowCalculatingShipping(false);
        } else {
          setShippingFee(null);
          setShowCalculatingShipping(false);
        }
      } else {
        setShippingFee(null);
        setShowCalculatingShipping(false);
      }
    } else {
      setShippingFee(null);
      setShowCalculatingShipping(false);
    }
  }, [userAddress]);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const sessionPromise = supabaseClient.auth.getSession();
        const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) =>
          setTimeout(() => resolve({ data: { session: null } }), 5000) // 5 seconds timeout
        );

        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
        setSession(session);

        if (!session) {
          console.warn("Session fetch timed out or no session found.");
          return; // Exit early if no session or timed out
        }

        const { data: cart, error } = await supabaseClient
          .from("cart_items")
          .select("*, products(*)")
          .eq("user_id", session.user.id)
          .order("id", { ascending: true });

        if (error) {
          console.error("Error fetching cart items:", error);
        } else {
          setCartItems(cart || []);
          setSelectedItems([]); // Initialize with an empty array
          const newSubtotal = cart?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
          setSubtotal(newSubtotal);
        }
      } catch (error) {
        console.error("Error in fetchCartData:", error);
      }
    };

    fetchCartData();
  }, []);



  const handleRemoveItem = async (productId: string) => {
    const { error } = await supabaseClient
      .from("cart_items")
      .delete()
      .eq("user_id", session.user.id)
      .eq("product_id", productId);

    if (error) {
      console.error("Error removing item from cart:", error);
    } else {
      // Refresh cart items after removal
      const { data: updatedCart, error: fetchError } = await supabaseClient
        .from("cart_items")
        .select("*, products(*)")
        .eq("user_id", session.user.id)
        .order("id", { ascending: true });

      if (fetchError) {
        console.error("Error fetching updated cart items:", fetchError);
      } else {
        setCartItems(updatedCart || []);
        const newSubtotal = updatedCart?.reduce((sum, item) => sum + item.price * item.qty, 0) || 0;
        setSubtotal(newSubtotal);
      }
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) return;

    const { error } = await supabaseClient
      .from("cart_items")
      .update({ quantity: newQty })
      .eq("user_id", session.user.id)
      .eq("id", itemId);

    if (error) {
      console.error("Error updating item quantity:", error);
    } else {
      // Refresh cart items after update
      const { data: updatedCart, error: fetchError } = await supabaseClient
        .from("cart_items")
        .select("*, products(*)")
        .eq("user_id", session.user.id)
        .order("id", { ascending: true });

      if (fetchError) {
        console.error("Error fetching updated cart items:", fetchError);
      } else {
        setCartItems(updatedCart || []);
        // Recalculate subtotal based on selected items
        const newSubtotal = updatedCart?.reduce((sum, item) => {
          return selectedItems.includes(item.id) ? sum + item.price * item.quantity : sum;
        }, 0) || 0;
        setSubtotal(newSubtotal);
      }
    }
  };

  const handleCheckboxChange = (itemId: string) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(itemId)
        ? prevSelectedItems.filter((id) => id !== itemId)
        : [...prevSelectedItems, itemId]
    );
  };

  const handleSelectAllChange = (checked: boolean) => {
    if (checked) {
      setSelectedItems(cartItems.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const selectedCartItems = useMemo(() => {
    return cartItems.filter((item) => selectedItems.includes(item.id));
  }, [cartItems, selectedItems]);

  const selectedItemCount = useMemo(() => {
    return selectedCartItems.length;
  }, [selectedCartItems]);

  const calculatedSubtotal = useMemo(() => {
    return selectedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [selectedCartItems]);

  const handleCheckout = async () => {
    try {
      if (!session?.user?.id) {
        toast({
          title: "Please log in to checkout",
          description: "You need to be logged in to complete your order.",
          variant: "destructive",
        });
        return;
      }

      const totalAmountToSend = calculatedSubtotal + (shippingFee || 0);
      console.log("Total amount being sent to create_order RPC:", totalAmountToSend);
      console.log("Shipping address to send:", "{\"street\": \"Some Street\", \"city\": \"Some City\", \"zip\": \"12345\"}");
      console.log("Customer ID being sent to create_order RPC:", session.user.id);
      console.log("Cart Item IDs being sent to create_order RPC:", selectedCartItems.map((item) => item.id));
      const addressParts = userAddress?.split(",").map((part) => part.trim());
      const municipality = addressParts?.[0] || "";
      const province = addressParts?.[1] || "";
      const formattedAddress = `${municipality}, ${province}`;

      const { data, error } = await supabaseClient.rpc("create_order", {
        customer_id: session.user.id,
        total_amount: totalAmountToSend,
        shipping_address: formattedAddress, // Send as a string
        cart_item_ids: selectedCartItems.map((item) => item.id),
        p_shipping_fee: shippingFee || 0,
      });

      if (error) {
        console.error("Error creating order:", error);
        alert("Failed to create order.");
      } else {
        toast({
            title: "Order created successfully!",
            description: "Redirecting to your order details.",
        });
        router.push("/orders");
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Checkout failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-6">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
          <div className="space-y-4">
            {/* Cart Header */}
            <div className="grid grid-cols-[auto_1fr_120px_120px_120px_50px] items-center gap-4 bg-white p-4 rounded shadow-sm text-sm font-medium text-gray-500">
              <Checkbox
                checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                onCheckedChange={handleSelectAllChange}
              />
              <span>Product</span>
              <span className="text-center">Unit Price</span>
              <span className="text-center">Quantity</span>
              <span className="text-center">Total Price</span>
              <span></span>
            </div>

            {/* Cart Item Placeholder */}
            {(cartItems as CartItem[]).map((item: CartItem) => (
              <div
                key={item.id}
                className="grid grid-cols-[auto_1fr_120px_120px_120px_50px] items-center gap-4 bg-white p-4 rounded shadow-sm"
              >
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={() => handleCheckboxChange(item.id)}
                />
                <div className="flex gap-3">
                  <div className="h-20 w-20 rounded border bg-gray-50 overflow-hidden">
                    <img
                      src={item.products?.image_urls?.[0] || "/placeholder.jpg"}
                      alt={item.products?.name || "Product image"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="text-sm font-medium line-clamp-2">
                      {item.products?.name}
                    </h3>
                    <span className="text-xs text-gray-400 mt-1">x{item.quantity}</span>
                  </div>
                </div>
                <div className="text-center text-sm font-medium">₱{(item.price || 0).toFixed(2)}</div>
                <div className="flex items-center justify-center border rounded h-8 w-24 mx-auto">
                  <button className="px-2 hover:bg-gray-100" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                    <Minus className="h-3 w-3" />
                  </button>
                  <input type="text" value={item.quantity} className="w-8 text-center text-sm border-x" readOnly />
                  <button className="px-2 hover:bg-gray-100" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <div className="text-center text-sm font-bold text-primary">₱{(item.price * item.quantity).toFixed(2)}</div>
                <button className="text-gray-400 hover:text-red-500 transition-colors" onClick={() => handleRemoveItem(item.product_id)}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded shadow-sm sticky top-44">
              <h2 className="font-bold border-b pb-4 mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal ({selectedItemCount} items)</span>
                  <span>₱{calculatedSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping:</span>
                  <span>
                    {showCalculatingShipping ? (
                      "Calculating shipping..."
                    ) : shippingFee !== null ? (
                      `₱${shippingFee.toFixed(2)}`
                    ) : (
                      "N/A"
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>₱{(calculatedSubtotal + (shippingFee || 0)).toFixed(2)}</span>
                </div>
              </div>
          <Button className="w-full mt-6 h-12 bg-primary hover:bg-primary/90 text-lg font-bold" onClick={handleCheckout}>
            Check Out
          </Button>
            </div>
          </div>
        </div>
     </main>
    
    {/* Footer */}
    <footer className="text-gray-600 py-6 px-8 mt-32">
      <div className="text-center text-sm">
        <p>&copy; 2026 E-COM Group. All rights reserved.</p>
        <p className="mt-2">For educational purposes only, and no copyright infringement is intended.</p>
      </div>
    </footer>
    </div>
  )
}

export default function CartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading cart...</div>}>
      <CartPageContent />
    </Suspense>
  )
}
