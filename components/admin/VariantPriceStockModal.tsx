import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface VariantOption {
  name: string;
  values: string[];
}

export interface VariantCombination {
  combination: string;
  price: number | null;
  stock: number | null;
}

interface VariantPriceStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  productVariants: VariantOption[]; // Renamed from 'variants' to 'productVariants'
  onSave: (data: VariantCombination[]) => void;
  initialVariantCombinations?: VariantCombination[];
}

export function VariantPriceStockModal({
  isOpen,
  onClose,
  productVariants,
  onSave,
  initialVariantCombinations,
}: VariantPriceStockModalProps) {
  const [variantCombinations, setVariantCombinations] = useState<VariantCombination[]>([]);
  const [localVariants, setLocalVariants] = useState<VariantCombination[]>(initialVariantCombinations || []);

  useEffect(() => {
    if (isOpen && productVariants.length > 0) {
      const generatedCombinations = generateVariantCombinations(productVariants);
      const newVariantCombinations = generatedCombinations.map((comboString) => {
        const existingCombination = initialVariantCombinations?.find(
          (initialCombo) => initialCombo.combination === comboString
        );
        return {
          combination: comboString,
          price: existingCombination ? existingCombination.price : 0,
          stock: existingCombination ? existingCombination.stock : 0,
        };
      });
      setVariantCombinations(newVariantCombinations);
      setLocalVariants(newVariantCombinations); // Initialize localVariants here as well
    }
  }, [isOpen, productVariants, initialVariantCombinations]);



  const generateVariantCombinations = (variants: VariantOption[]): string[] => {
    if (variants.length === 0) {
      return [];
    }

    const result: string[] = [];

    const combine = (index: number, currentCombination: string[]) => {
      if (index === variants.length) {
        result.push(currentCombination.join(" - "));
        return;
      }

      variants[index].values.forEach((value) => {
        combine(index + 1, [...currentCombination, value]);
      });
    };

    combine(0, []);
    return result;
  };

  const handlePriceChange = (index: number, value: string) => {
    const newCombinations = [...localVariants];
    newCombinations[index].price = value === "" ? null : parseFloat(value);
    setLocalVariants(newCombinations);
  };

  const handleStockChange = (index: number, value: string) => {
    const newCombinations = [...localVariants];
    newCombinations[index].stock = value === "" ? null : parseInt(value);
    setLocalVariants(newCombinations);
  };

  const handleSave = () => {
    onSave(localVariants);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Set Price and Stock for Variants</DialogTitle>
          <DialogDescription>
            Enter the price and stock for each variant combination.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
          <div className="grid grid-cols-6 items-center gap-4 mb-2">
            <div className="col-span-2"></div>
            <Label className="col-span-2 text-center">Price</Label>
            <Label className="col-span-2 text-center">Stock</Label>
          </div>
          {localVariants.map((variant, index) => (
            <div key={index} className="grid grid-cols-6 items-center gap-4">
              <Label htmlFor={`variant-combination-${index}`} className="text-left col-span-2">
                {variant.combination}
              </Label>
              <InputGroup className="col-span-2">
                <InputGroupAddon>₱</InputGroupAddon>
                <InputGroupInput
                    id={`price-${index}`}
                    placeholder="Price"
                    type="number"
                    value={variant.price === null ? "" : variant.price}
                    onChange={(e) => handlePriceChange(index, e.target.value)}
                    className="h-12 w-full"
                  />
                </InputGroup>
                <Input
                  id={`stock-${index}`}
                  placeholder="Stock"
                  className="col-span-2 h-12 w-full"
                  type="number"
                  value={variant.stock === null ? "" : variant.stock}
                  onChange={(e) => handleStockChange(index, e.target.value)}
                />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}