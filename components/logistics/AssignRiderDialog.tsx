"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Rider } from "@/lib/types"; // Import the shared Rider interface

interface AssignRiderDialogProps {
  orderId: string;
  riders: Rider[];
  isOpen: boolean;
  onClose: () => void;
  isCustomProduct?: boolean;
}

export function AssignRiderDialog({
  orderId,
  riders,
  isOpen,
  onClose,
  isCustomProduct = false,
}: AssignRiderDialogProps) {
  const [selectedRider, setSelectedRider] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  // const supabase = createClient(); // This line was incorrect and has been removed
  const router = useRouter();
  const { toast } = useToast();

  const handleAssign = async () => {
    if (!selectedRider) {
      toast({
        title: "No Rider Selected",
        description: "Please select a rider to assign.",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);

    try {
      if (isCustomProduct) {
        // Update custom product status via API
        const response = await fetch("/api/admin/custom-products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customProductId: orderId,
            customProductData: {
              status: "assigned",
              rider_id: selectedRider,
            },
          }),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(
            result.error || "Failed to update custom product status"
          );
        }
      } else {
        // Update order status and rider_id directly
        const { error } = await supabase
          .from("orders")
          .update({
            rider_id: selectedRider,
            status: "assigned",
          })
          .eq("id", orderId);

        if (error) {
          throw new Error(error.message);
        }
      }

      // Insert into deliveries table
      const deliveryData = isCustomProduct
        ? {
            custom_product_id: orderId,
            rider_id: selectedRider,
            status: "assigned",
          }
        : {
            order_id: orderId,
            rider_id: selectedRider,
            status: "assigned",
          };

      const { error: deliveryError } = await supabase
        .from("deliveries")
        .insert([deliveryData]);

      if (deliveryError) {
        throw new Error(
          `Failed to create delivery record: ${deliveryError.message}`
        );
      }

      toast({
        title: "Rider Assigned",
        description: `${
          isCustomProduct ? "Custom Product" : "Order"
        } ${orderId.slice(0, 8)} assigned successfully!`,
      });
      router.refresh(); // Refresh the page to update the list of unassigned orders
      onClose();
    } catch (error: any) {
      console.error("Error assigning rider:", error.message);
      toast({
        title: "Assignment Failed",
        description: `Failed to assign rider: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Assign Rider to {isCustomProduct ? "Custom Product" : "Order"}{" "}
            {orderId.slice(0, 8)}
          </DialogTitle>
          <DialogDescription>
            Select a rider from the list below to assign to this{" "}
            {isCustomProduct ? "custom product" : "order"}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rider" className="text-right">
              Rider
            </Label>
            <Select
              onValueChange={setSelectedRider}
              value={selectedRider || ""}
              disabled={isAssigning}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a rider" />
              </SelectTrigger>
              <SelectContent>
                {riders.map((rider) => (
                  <SelectItem key={rider.id} value={rider.id}>
                    {rider.full_name} - {rider.address}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isAssigning}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedRider || isAssigning}
          >
            {isAssigning ? "Assigning..." : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
