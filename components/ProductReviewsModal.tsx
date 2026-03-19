// components/ProductReviewsModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface ProductReviewsModalProps {
  productId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Review {
  id: string;
  customer_id: string;
  rating: number;
  feedback: string;
  created_at: string;
  customer_name?: string; // To be fetched
  variation_name?: string; // To be fetched
  order_id: string; // Add order_id to the interface
  product_id: string; // Add product_id to the interface
}

export function ProductReviewsModal({ productId, isOpen, onClose }: ProductReviewsModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !productId) return;

    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch reviews and customer info
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("reviews")
          .select("*, customer:customer_id(first_name, middle_name, last_name)") // Removed order_item join
          .eq("product_id", productId);

        if (reviewsError) {
          throw reviewsError;
        }

        // Fetch variation names for each review
        // Helper function to mask a name part
        const maskName = (name: string | null | undefined) => {
          if (!name) return "";
          if (name.length <= 1) return name;
          return name.charAt(0) + "*".repeat(name.length - 2) + name.slice(-1);
        };

        const reviewsWithVariations = await Promise.all(reviewsData.map(async (review: any) => {
          let variationName = null;
          if (review.order_id && review.product_id) {
            const { data: orderItemData, error: orderItemError } = await supabase
              .from("order_items")
              .select("variation_id")
              .eq("order_id", review.order_id)
              .eq("product_id", review.product_id)
              .single();

            if (orderItemError && orderItemError.code !== 'PGRST116') { // PGRST116 means no rows found
              console.error("Error fetching order item for review:", orderItemError);
            }

            if (orderItemData?.variation_id) {
              const { data: productVariationData, error: productVariationError } = await supabase
                .from("product_variations")
                .select("variation_value")
                .eq("id", orderItemData.variation_id)
                .single();

              if (productVariationError && productVariationError.code !== 'PGRST116') {
                console.error("Error fetching product variation name:", productVariationError.message);
              }
              variationName = productVariationData?.variation_value || null;
            }
          }

          const customerFirstName = review.customer?.first_name;
          const customerMiddleName = review.customer?.middle_name;
          const customerLastName = review.customer?.last_name;

          // Mask individual name parts
          const maskedFirstName = maskName(customerFirstName);
          const maskedMiddleName = maskName(customerMiddleName);
          const maskedLastName = maskName(customerLastName);

          // Combine masked names, filtering out empty strings
          const maskedCustomerName = [maskedFirstName, maskedMiddleName, maskedLastName]
            .filter(Boolean)
            .join(' ') || 'Anonymous';

          return {
            ...review,
            customer_name: maskedCustomerName,
            variation_name: variationName,
          };
        }));

        setReviews(reviewsWithVariations);
      } catch (err: any) {
        console.error("Error fetching reviews:", err);
        setError(err.message || "Failed to fetch reviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [isOpen, productId, supabase]);

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Customer Reviews</DialogTitle>
          <DialogDescription>
            See what other customers are saying about this product.
          </DialogDescription>
        </DialogHeader>
        {loading && <p>Loading reviews...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && reviews.length === 0 && <p>No reviews yet.</p>}
        {!loading && reviews.length > 0 && (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <p className="font-semibold">{review.customer_name}</p>
                <p className="text-yellow-500">{renderStars(review.rating)}</p>
                {review.variation_name && (
                  <p className="text-sm text-gray-600">Variation: {review.variation_name}</p>
                )}
                <p className="text-sm mt-1">{review.feedback}</p>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}