"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Truck } from "lucide-react";
import { AssignRiderDialog } from "./AssignRiderDialog";
import { Rider } from "@/lib/types"; // Import the shared Rider interface

interface AssignRiderButtonProps {
  orderId: string;
  riders: Rider[];
  isCustomProduct?: boolean;
}

export function AssignRiderButton({
  orderId,
  riders,
  isCustomProduct = false,
}: AssignRiderButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAssignRider = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
      <Button size="sm" className="gap-2" onClick={handleAssignRider}>
        <Truck className="h-3 w-3" />
        Assign Rider
      </Button>
      <AssignRiderDialog
        orderId={orderId}
        riders={riders}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        isCustomProduct={isCustomProduct}
      />
    </>
  );
}
