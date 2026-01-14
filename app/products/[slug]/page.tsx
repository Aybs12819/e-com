"use client"


import { supabase as supabaseClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { ShoppingCart, ShieldCheck, Truck } from "lucide-react"
import { useState, useEffect, useMemo, useCallback } from "react"
import { ProductReviewsModal } from "@/components/ProductReviewsModal"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getShippingFee, shippingFees } from "@/lib/shipping";
import Script from "next/script";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetailPage() {
  const params = useParams()
  const { slug } = params
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null) // New state for selected image
  const { toast } = useToast(); // Initialize useToast here
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({}); // State for selected variants
  const [displayPrice, setDisplayPrice] = useState<number | null>(null); // State for dynamically displayed price // customerDetails and isModalOpen states were already removed.
  const [displayStock, setDisplayStock] = useState<number | null>(null); // State for dynamically displayed stock
  const [userAddress, setUserAddress] = useState<string | null>(null) // State for user address
  const [shippingFee, setShippingFee] = useState<number | null>(null);
  const [isAddressParsable, setIsAddressParsable] = useState<boolean>(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState<boolean>(true); // State for shipping fee
  const [showCalculatingShipping, setShowCalculatingShipping] = useState<boolean>(false); // New state for showing "Calculating shipping..."
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false); // State for reviews modal

  const supabase = useMemo(() => supabaseClient, [])
  const router = useRouter()

  const getUserSession = useCallback(async () => {
    setIsLoadingAddress(true); // Set loading to true
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session) {
      setUserAddress(session.user?.user_metadata?.address || null)

      // Fetch customer details
      const { data: customerData, error: customerError } = await supabase
        .from("customer_accounts")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (customerError) {
        console.error("Error fetching customer details:", customerError);
      } else if (customerData) {
        console.log("getUserSession: Fetched customer data for user ID:", session.user.id, customerData);
        // Replace [PENDING] with empty string for modal display
        const cleanedDetails = Object.fromEntries(
          Object.entries(customerData).map(([key, value]) => [
            key,
            value === "[PENDING]" ? "" : value,
          ])
        );
        console.log("getUserSession: Cleaned customer details:", cleanedDetails); // Added log

      }
    }
    setIsLoadingAddress(false); // Set loading to false after processing
  }, [supabase, setUserAddress, setIsLoadingAddress]);



  useEffect(() => {
    if (product && product.variantCombinations && Object.keys(selectedVariants).length > 0) {
      const selectedCombinationString = Object.values(selectedVariants).join(" - ");
      const matchedCombination = product.variantCombinations.find(
        (combination: any) => combination.combination === selectedCombinationString
      );
      if (matchedCombination) {
        setDisplayStock(matchedCombination.stock);
      } else {
        setDisplayStock(0); // Or some other default if no match
      }
    } else if (product && product.variantCombinations) {
      // If no variants are selected, display the total stock
      const totalStock = product.variantCombinations.reduce((total: number, combination: any) => total + combination.stock, 0);
      setDisplayStock(totalStock);
    }
  }, [selectedVariants, product]);

  useEffect(() => {
    getUserSession()
  }, [supabase, getUserSession])

  useEffect(() => {
    if (userAddress) {
      setShowCalculatingShipping(true); // Start showing "Calculating shipping..."
      const addressParts = userAddress.split(",").map((part) => part.trim());
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
          setTimeout(() => {
            setShippingFee(fee);
            setIsAddressParsable(true);
            setShowCalculatingShipping(false); // Hide after 3 seconds
          }, 3000);
        } else {
          setShippingFee(null);
          setIsAddressParsable(false);
          setShowCalculatingShipping(false); // Hide if no fee found
        }
      } else {
        setShippingFee(null);
        setIsAddressParsable(false);
        setShowCalculatingShipping(false); // Hide if address not parsable
      }
    } else {
      setShippingFee(null);
      setIsAddressParsable(false);
      setShowCalculatingShipping(false); // Hide if no user address
    }
  }, [userAddress]);

  const fetchProduct = useCallback(async () => {
    setLoading(true)
    const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*, categories(*), product_variations(*), variant_combinations")
        .eq("slug", slug)
        .single()

    if (productError) {
      setError(productError.message)
      setLoading(false)
      return
    }

    if (productData) {
      let soldCount = 0;
      const isValidProductId = productData.id && typeof productData.id === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(productData.id);

      if (isValidProductId) {
        const { data: soldCountData, error: soldCountError } = await supabase
          .rpc('get_product_sold_count', { p_product_id: productData.id });
        if (soldCountData && !soldCountError) {
          soldCount = soldCountData;
        } else if (soldCountError) {
          console.error("Error fetching sold count:", soldCountError.message);
        }

        const { data: ratingData, error: averageRatingError } = await supabase
          .rpc('get_product_average_rating', { p_product_id: productData.id });

        if (ratingData && !averageRatingError && ratingData.length > 0) {
          productData.average_rating = Number(ratingData[0].average_rating) || 0;
          productData.review_count = Number(ratingData[0].review_count) || 0;
        } else if (averageRatingError) {
          console.error("Error fetching average rating:", averageRatingError.message);
          productData.average_rating = 0;
          productData.review_count = 0;
        } else {
          productData.average_rating = 0;
          productData.review_count = 0;
        }
      } else {
        console.warn("Skipping sold count and average rating fetch due to invalid productData.id:", productData.id);
      }

      const finalProductData = {
        ...productData,
        sold_count: soldCount,
        variantCombinations: productData.variant_combinations || [], // Map snake_case to camelCase
      };
      setProduct(finalProductData);
      setSelectedImage(finalProductData.image_urls?.[0] || null);
      setDisplayPrice(finalProductData.base_price); // Initialize display price

      console.log("Fetched product:", finalProductData); // Debugging line
    } else {
      setProduct(null);
    }
    setLoading(false)
  }, [slug, supabase]);

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  useEffect(() => {
    if (product && product.product_variations?.length > 0) {
      // Initialize selectedVariants with the first value of each variation type
      const initialSelectedVariants: { [key: string]: string } = {};
      (Object.entries(
        product.product_variations.reduce((acc: { [key: string]: string[] }, variation: any) => {
          const { variation_name, variation_value } = variation;
          if (!acc[variation_name]) {
            acc[variation_name] = [];
          }
          if (!acc[variation_name].includes(variation_value)) {
            acc[variation_name].push(variation_value);
          }
          return acc;
        }, {} as { [key: string]: string[] })
      ) as [string, string[]][]).forEach(([variationType, variationValues]) => {
        if (variationValues.length > 0) {
          initialSelectedVariants[variationType] = variationValues[0];
        }
      });
      setSelectedVariants(initialSelectedVariants);
    }
  }, [product]);

  useEffect(() => {
    if (product && product.variantCombinations) {
      if (Object.keys(selectedVariants).length > 0) {
        const selectedCombinationString = Object.values(selectedVariants).join(" - ");
        const matchedCombination = product.variantCombinations.find(
          (combination: any) => combination.combination === selectedCombinationString
        );

        if (matchedCombination) {
          setDisplayStock(matchedCombination.stock);
        } else {
          setDisplayStock(0); // Or some other default if no match
        }
      } else {
        // If no variants are selected, display the total stock
        const totalStock = product.variantCombinations.reduce((total: number, combination: any) => total + combination.stock, 0);
        setDisplayStock(totalStock);
      }
    }
  }, [selectedVariants, product]);


  if (error) return <div>Error: {error}</div>
  if (!product) return null

  const handleAddToCart = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert("Please log in to add items to your cart.")
      return
    }

    // Determine the order of variant types from the first combination in product.variant_combinations
    // and map them to their corresponding variation names from product.product_variations
    const variantTypeOrder = product.variant_combinations[0]?.combination
      .split(" - ")
      .map((value: string) => {
        const matchingVariation = product.product_variations.find(
          (pv: any) => pv.variation_value === value
        );
        return matchingVariation ? matchingVariation.variation_name : null;
      })
      .filter(Boolean); // Filter out any nulls if a variation name isn't found

    const selectedCombinationString = variantTypeOrder
      .map((type: string) => selectedVariants[type])
      .join(" - ");

    console.log("product.variant_combinations:", product.variant_combinations);
    console.log("product.product_variations:", product.product_variations);
    console.log("selectedVariants:", selectedVariants);
    console.log("variantTypeOrder:", variantTypeOrder);
    console.log("selectedCombinationString:", selectedCombinationString);

    // Find the product_variation_id based on selectedVariants
    const selectedCombination = product.variant_combinations.find((combination: any) => {
      return combination.combination === selectedCombinationString;
    });

    console.log("selectedCombination:", selectedCombination);

    let variationIdToStore = null;
    if (selectedCombination) {
      const selectedVariantValues = selectedCombination.combination.split(" - ");
      if (selectedVariantValues.length > 0) {
        const firstSelectedVariantValue = selectedVariantValues[0];
        const matchingProductVariation = product.product_variations.find(
          (pv: any) => pv.variation_value === firstSelectedVariantValue
        );
        if (matchingProductVariation) {
          variationIdToStore = matchingProductVariation.id;
        }
      }
    }

    if (!selectedCombination || !variationIdToStore) {
      alert("Please select all variant options, or product variant data is incomplete.");
      return;
    }

    const { data: existingCartItem, error: fetchError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .eq("variation_id", variationIdToStore) // Match by combination ID
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error("Error fetching cart item:", fetchError)
      alert("Error adding to cart. Please try again.")
      return
    }

    if (existingCartItem) {
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: existingCartItem.quantity + 1 })
        .eq("id", existingCartItem.id)

      if (updateError) {
        console.error("Error updating cart item quantity:", updateError)
        alert("Error updating cart quantity. Please try again.")
        return
      }
    } else {
      const { error: insertError } = await supabase
        .from("cart_items")
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1,
          price: displayPrice || product.base_price, // Use displayPrice
          variation_id: variationIdToStore, // Store selected combination ID
        })

      if (insertError) {
        console.error("Error inserting cart item:", insertError)
        alert("Error adding to cart. Please try again.")
        return
      }
    }
    alert(`${product.name} added to cart!`)
  }

  const handleBuyNow = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert("Please log in to purchase items.");
      return;
    }

    // Determine the order of variant types from product.product_variations
    const variantTypeOrder = product.product_variations
      .filter((pv: any) => pv.product_id === product.id)
      .map((pv: any) => pv.variation_name)
      .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index);

    const selectedCombinationString = variantTypeOrder
      .map((type: string) => selectedVariants[type])
      .join(" - ");

    // Find the product_variation_id based on selectedVariants
    const selectedCombination = product.variant_combinations.find((combination: any) => {
      return combination.combination === selectedCombinationString;
    });

    let variationIdToStore = null;
    if (selectedCombination) {
      const selectedVariantValues = selectedCombination.combination.split(" - ");
      if (selectedVariantValues.length > 0) {
        const firstSelectedVariantValue = selectedVariantValues[0];
        const matchingProductVariation = product.product_variations.find(
          (pv: any) => pv.variation_value === firstSelectedVariantValue
        );
        if (matchingProductVariation) {
          variationIdToStore = matchingProductVariation.id;
        }
      }
    }

    if (!selectedCombination || !variationIdToStore) {
      alert("Please select all variant options, or product variant data is incomplete.");
      return;
    }

    try {
      const response = await fetch('/api/buy-now', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          price: displayPrice || product.base_price, // Use displayPrice
          selectedCombinationString: selectedCombinationString, // Send the combination string
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Order Successful!",
          description: "Redirecting to your orders...",
        });
        await fetchProduct(); // Re-fetch product data to update stock display
        setTimeout(() => {
          router.push("/orders");
        }, 1000); // 1-second delay
      } else {
        toast({
          title: "Purchase Failed",
          description: result.error || "An unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error during buy now:', error);
      toast({
        title: "Purchase Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  }



  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 bg-white p-6 rounded-lg shadow-sm">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 border">
              <img
                src={selectedImage || "/placeholder.svg"}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {product.image_urls?.map((img: string, i: number) => (
                <div
                  key={i}
                  className={`aspect-square overflow-hidden rounded border cursor-pointer ${
                    img === selectedImage ? "border-primary" : "border-gray-200"
                  }`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              {/* Removed the original rating display */}
              <div className="mt-1 text-sm text-gray-500">
                {product.sold_count || 0} Sold
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <span className="text-3xl font-bold text-primary">₱{displayPrice !== null ? displayPrice.toFixed(2) : product.base_price.toFixed(2)}</span>
            </div>

            {/* Variations */}
            {product.product_variations?.length > 0 && (
              <div className="space-y-4">
                {(Object.entries(
                  product.product_variations.reduce((acc: { [key: string]: string[] }, variation: any) => {
                    const { variation_name, variation_value } = variation;
                    if (!acc[variation_name]) {
                      acc[variation_name] = [];
                    }
                    if (!acc[variation_name].includes(variation_value)) {
                      acc[variation_name].push(variation_value);
                    }
                    return acc;
                  }, {} as { [key: string]: string[] })
                ) as [string, string[]][]).map(
                  ([variationType, variationValues]: [string, string[]]) => (
                    <div key={variationType} className="flex flex-col gap-2">
                      <p className="text-sm text-gray-500">{variationType}</p>
                      <div className="flex flex-wrap gap-2">
                        {variationValues.map((value: string) => (
                          <Button
                            key={value}
                            variant="outline"
                            className={`text-xs ${selectedVariants[variationType] === value ? "border-primary bg-primary/10" : ""}`}
                            onClick={() => {
                              setSelectedVariants((prev) => ({
                                ...prev,
                                [variationType]: value,
                              }));
                            }}
                          >
                            {value}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}

            {/* Dynamic Stock Display */}
            {displayStock !== null && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Stock: {displayStock}</span>
              </div>
            )}

            {/* Shipping */}
            <div className="flex items-center gap-2 text-sm text-black">
              <Truck className="h-4 w-4 text-green-500" />
              <span>
                Shipping Fee:{" "}
                {shippingFee !== null ? ` ₱${shippingFee.toFixed(2)}` : "Calculating..."}
              </span>
            </div>
            {product?.is_active === "pre-order" && product?.preorder_lead_time && (
              <div className="flex items-center gap-2 text-sm font-bold text-orange-500">
                <span>Pre-order (ships in {product.preorder_lead_time})</span>
              </div>
            )}
          <div className="flex gap-4 pt-6">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 gap-2 border-primary text-primary hover:bg-primary/5 bg-transparent"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="lg" className="flex-1 bg-primary hover:bg-primary/90" onClick={handleBuyNow}>
                Buy Now
              </Button>
            </div>

            <div className="border-t pt-6 flex items-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-primary" />
                LinkHabi Guarantee
              </div>
              <div>7 Days Return</div>
              <div>100% Authentic</div>
            </div>
          </div>
          </div>

        {/* Description Section */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold mb-4 uppercase tracking-wider bg-slate-50 p-3 flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">★</span> {product.average_rating?.toFixed(1) || '0.0'} Product Ratings ({product.review_count || 0})
            </div>
            <Button variant="link" className="pl-0" onClick={() => setIsReviewsModalOpen(true)}>View All</Button>
          </h2>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold mb-4 uppercase tracking-wider bg-slate-50 p-3">Product Specifications</h2>
          <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <div className="grid grid-cols-[150px_1fr] gap-4">
              <span className="text-gray-400">Category</span>
              <span className="text-primary font-medium">{product.categories?.name}</span>
            </div>
           
            <div className="grid grid-cols-[150px_1fr] gap-4">
              <span className="text-gray-400">Ships From</span>
              <span>Mapita, Aguilar, Pangasinan</span>
            </div>
            <div className="mt-8 border-t pt-8">
              <h2 className="text-lg font-bold mb-4 uppercase tracking-wider bg-slate-50 p-3">Product Description</h2>
              <p>{product.description}</p>
            </div>
          </div>
        </div>
        <script src='https://cdn.jotfor.ms/agent/embedjs/019b997bc1ef7a0c91310092ab9900534bfe/embed.js'></script>
     </main>
      {product && (
        <ProductReviewsModal
          productId={product.id}
          isOpen={isReviewsModalOpen}
          onClose={() => setIsReviewsModalOpen(false)}
        />
      )}
    </div>
  )
}
