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
}

export function AssignRiderDialog({
  orderId,
  riders,
  isOpen,
  onClose,
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

    const { error } = await supabase
      .from("orders")
      .update({ rider_id: selectedRider, status: "delivery rider assigned" })
      .eq("id", orderId);

    if (error) {
      console.error("Error assigning rider:", error.message);
      toast({
        title: "Assignment Failed",
        description: `Failed to assign rider: ${error.message}`,
        variant: "destructive",
      });
    } else {
      // Insert into deliveries table
      const { error: deliveryError } = await supabase
        .from("deliveries")
        .insert([
          {
            order_id: orderId,
            rider_id: selectedRider,
            status: "assigned",
          },
        ]);

      if (deliveryError) {
        console.error("Error creating delivery record:", deliveryError);
        toast({
          title: "Delivery Creation Failed",
          description: `Failed to create delivery record: ${deliveryError.message}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Rider Assigned",
          description: `Order ${orderId.slice(0, 8)} assigned successfully!`,
        });
        router.refresh(); // Refresh the page to update the list of unassigned orders
        onClose();
      }
    }
    setIsAssigning(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Rider to Order {orderId.slice(0, 8)}</DialogTitle>
          <DialogDescription>
            Select a rider from the list below to assign to this order.
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
                    {rider.full_name}
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
