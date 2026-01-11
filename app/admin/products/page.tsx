"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, MinusCircle, XIcon } from "lucide-react"
import Image from "next/image"
import { uploadProductImage } from "@/utils/supabase/storage"
import { Badge } from "@/components/ui/badge"
import { Product, GroupedProductVariant } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { useToast } from "@/hooks/use-toast"
import { ChevronRight } from "lucide-react";
import { VariantPriceStockModal, VariantCombination } from "@/components/admin/VariantPriceStockModal";

export interface NewProductState {
  name: string;
  description: string;
  price: number | null;
  stock: number | null;
  category_id: string;
  image_urls: string[];
  variantCombinations: VariantCombination[];
  is_active: boolean;
  slug: string;
}

interface Category {
  id: string;
  name: string;
}

export default function AdminProductsPage() {
  const supabaseClient = supabase;
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [showEditProductForm, setShowEditProductForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [currentProductToEdit, setCurrentProductToEdit] = useState<Product | null>(null);
  const [showVariantPriceStockModal, setShowVariantPriceStockModal] = useState(false);
  const [modalFor, setModalFor] = useState<'add' | 'edit' | null>(null);
  const [newProduct, setNewProduct] = useState<NewProductState>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category_id: "",
    image_urls: [],
    is_active: true,
    slug: "",
    variantCombinations: [],
  });
  const [editProduct, setEditProduct] = useState<NewProductState>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category_id: "",
    image_urls: [],
    is_active: true,
    slug: "",
    variantCombinations: [],
  });
  const [variants, setVariants] = useState<GroupedProductVariant[]>([{ type: "", value: [""], price: [], stock: [] }]);
  const [editVariants, setEditVariants] = useState<GroupedProductVariant[]>([{ type: "", value: [""], price: [], stock: [] }]);

interface RawProductData extends Omit<Product, 'variantCombinations'> {
  variant_combinations: VariantCombination[] | null;
}

  const fetchProducts = useCallback(async () => {
    try {
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*, categories(id, name), variant_combinations")
        .order("created_at", { ascending: false }) as { data: RawProductData[] | null, error: any };

      if (productsError) throw productsError;

      if (productsData && productsData.length > 0) {
        const productsWithMappedVariants = productsData.map(product => {
          return {
            ...product,
            variantCombinations: product.variant_combinations || [],
          };
        });

        const productIds = productsWithMappedVariants.map(p => p.id);
        const { data: variationsData, error: variationsError } = await supabase
          .from("product_variations")
          .select("*")
          .in("product_id", productIds) as { data: any[] | null, error: any };

        if (variationsError) throw variationsError;

        const groupedVariations = variationsData?.reduce((acc, variation) => {
          if (!acc[variation.product_id]) {
            acc[variation.product_id] = [];
          }
          const existingType = acc[variation.product_id].find((v: any) => v.type === variation.type);
          if (existingType) {
            existingType.value.push(variation.variation_value);
            existingType.stock.push(variation.stock_quantity);
          } else {
            acc[variation.product_id].push({
              type: variation.type,
              value: [variation.variation_value],
              stock: [variation.stock_quantity],
            });
          }
          return acc;
        }, {});

        const productsWithVariants = productsWithMappedVariants.map(product => ({
          ...product,
          variants: groupedVariations?.[product.id] || [],
        }));
        setProducts(productsWithVariants);
      } else {
        setProducts([]);
      }
    } catch (error: any) {
      toast({
        title: "Error fetching products",
        description: error.message,
        variant: "destructive",
      });
    } finally {
    }
  }, [toast]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      toast({
        title: "Error fetching categories",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  }, [supabase, toast]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProductToEdit) return;

    setIsSubmitting(true);

    const generatedSlug = editProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');

    try {
      let lowestPrice = editProduct.price;

      if (editProduct.variantCombinations && editProduct.variantCombinations.length > 0) {
        const prices = editProduct.variantCombinations.map(vc => vc.price).filter((price): price is number => price !== null);
        if (prices.length > 0) {
          lowestPrice = Math.min(...prices);
        }
      }

      const productData = {
        name: editProduct.name,
        description: editProduct.description,
        price: Number(lowestPrice), // Ensure price is a number
        stock: editProduct.stock,
        category_id: editProduct.category_id,
        image_urls: editProduct.image_urls,
        is_active: editProduct.is_active,
        slug: generatedSlug,
        variantCombinations: editProduct.variantCombinations,
      };

      const response = await fetch(`/api/admin/products?id=${currentProductToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productData, editVariants }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update product');
      } else {
        toast({
          title: "Product updated successfully!",
          description: `${editProduct.name} has been updated.`,
        });
      }

      setShowEditProductForm(false);
      setIsSubmitting(false);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error updating product",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingProduct(true);

    const generatedSlug = newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-*|-*$/g, '');

    try {
      let lowestPrice = newProduct.price; // Default to existing price

      if (newProduct.variantCombinations && newProduct.variantCombinations.length > 0) {
        const prices = newProduct.variantCombinations.map(vc => vc.price).filter((price): price is number => price !== null);
        lowestPrice = Math.min(...prices);
      }

      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        price: Number(lowestPrice), // Ensure price is a number
        stock: newProduct.stock,
        category_id: newProduct.category_id,
        image_urls: newProduct.image_urls,
        is_active: newProduct.is_active,
        slug: generatedSlug,
        variantCombinations: newProduct.variantCombinations,
      };

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productData, variants }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add product');
      } else {
        toast({
          title: "Product added successfully!",
          description: `${newProduct.name} has been added.`,
        });
      }

      setShowAddProductForm(false);
      setVariants([]); // Reset variants state
      setNewProduct({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        category_id: "",
        image_urls: [],
        is_active: true,
        slug: "",
        variantCombinations: [],
      });
      setVariants([{ type: "", value: [""], stock: [0], price: [0] }]);
      setShowAddProductForm(false);
      fetchProducts();
      } catch (error: any) {
      toast({
        title: "Error adding product",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAddingProduct(false);
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isEditForm: boolean = false) => {
    if (!e.target.files) return

    const files = Array.from(e.target.files)
    const uploadedImageUrls: string[] = []

    for (const file of files) {
      const { publicUrl, error } = await uploadProductImage(file)

      if (error) {
        toast({
          title: "Image upload failed",
          description: error.message,
          variant: "destructive",
        })
        continue
      }

      uploadedImageUrls.push(publicUrl)
    }

    if (isEditForm) {
      setEditProduct((prev) => ({
        ...prev,
        image_urls: [...prev.image_urls, ...uploadedImageUrls].slice(0, 3),
      }))
    } else {
      setNewProduct((prev) => ({
        ...prev,
        image_urls: [...prev.image_urls, ...uploadedImageUrls].slice(0, 3),
      }))
    }
  }

  const handleRemoveImage = (index: number, isEditForm: boolean = false) => {
    if (isEditForm) {
      const newImageUrls = editProduct.image_urls.filter((_: string, i: number) => i !== index);
      setEditProduct((prev) => ({ ...prev, image_urls: newImageUrls }));
    } else {
      const newImageUrls = newProduct.image_urls.filter((_: string, i: number) => i !== index);
      setNewProduct((prev) => ({ ...prev, image_urls: newImageUrls }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, isEditForm: boolean = false) => {
    const { name, value, type } = e.target;

    const setter = isEditForm ? setEditProduct : setNewProduct;

    if (name === "is_active") {
      setter((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === "image_urls") {
      setter((prev) => ({ ...prev, [name]: value.split(',').map((url: string) => url.trim()) }));
    } else if (type === "number") {
      setter((prev) => ({ ...prev, [name]: value === "" ? null : parseFloat(value) }));
    } else {
      setter((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleVariantChange = (
    variantIndex: number,
    field: keyof Pick<GroupedProductVariant, "type" | "value">,
    value: string | string[]
  ) => {
    const setter = isEditingProduct ? setEditVariants : setVariants;
    setter((prev) => {
      const newVariants = [...prev];
      if (field === "value") {
        newVariants[variantIndex].value = value as string[];
      } else if (field === "type") {
        newVariants[variantIndex].type = value as string;
      }
      return newVariants;
    });
  };

  const handleVariantCombinationChange = (
    combinationIndex: number,
    field: keyof VariantCombination,
    value: string | number
  ) => {
    const setter = isEditingProduct ? setEditProduct : setNewProduct;
    setter((prev) => {
      const newProduct = { ...prev };
      if (newProduct.variantCombinations) {
        if (field === "price" || field === "stock") {
          (newProduct.variantCombinations[combinationIndex][field] as number) =
            value as number;
        } else {
          (newProduct.variantCombinations[combinationIndex][field] as string) =
            value as string;
        }
      }
      return newProduct;
    });
  };

  const handleAddVariant = () => {
    const setter = isEditingProduct ? setEditVariants : setVariants;
    setter((prev) => [...prev, { type: "", value: [""], price: [], stock: [] }]);
  };

  const handleRemoveVariant = (idx: number) => {
    const setter = isEditingProduct ? setEditVariants : setVariants;
    setter((prev) => prev.filter((_: any, i: number) => i !== idx));
  };

  const handleVariantValueChange = (
    variantIndex: number,
    valueIndex: number,
    val: string
  ) => {
    const setter = isEditingProduct ? setEditVariants : setVariants;
    setter((prev) => {
      const newVariants = [...prev];
      newVariants[variantIndex].value[valueIndex] = val;
      return newVariants;
    });
  };

  const handleAddVariantValue = (variantIndex: number) => {
    const setter = isEditingProduct ? setEditVariants : setVariants;

    setter((prev) =>
      prev.map((variant, idx) =>
        idx === variantIndex
          ? {
              ...variant,
              value: [...variant.value, ""],
            }
          : variant
      )
    );
  };

  const handleRemoveVariantValue = (
    variantIndex: number,
    valueIndex: number
  ) => {
    const setter = isEditingProduct ? setEditVariants : setVariants;

    setter((prev) =>
      prev.map((variant, idx) =>
        idx === variantIndex
          ? {
              ...variant,
              value: variant.value.filter((_, i) => i !== valueIndex),
            }
          : variant
      )
    );
  };



  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products?id=${productId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete product");
      }

      toast({
        title: "Product deleted successfully!",
        description: "The product has been removed.",
      });
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleEditProductSubmit called");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/products`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: currentProductToEdit?.id,
          productData: {
            name: editProduct.name,
            description: editProduct.description,
            category_id: editProduct.category_id,
            image_urls: editProduct.image_urls,
            is_active: editProduct.is_active,
            slug: editProduct.slug,
            variantCombinations: editProduct.variantCombinations,
          },
          variants: editVariants,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update product");
      }

      toast({
        title: "Product updated successfully!",
        description: "The product details have been saved.",
      });
      setShowEditProductForm(false);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error updating product",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCurrentProductToEdit(product);
    setEditProduct({
        name: product.name,
        description: product.description || "",
        price: product.price,
        stock: product.stock,
        category_id: product.category_id,
        image_urls: product.image_urls || [],
        is_active: product.is_active,
        slug: product.slug,
        variantCombinations: product.variantCombinations || [],
      });
    setEditVariants(
      product.variants && product.variants.length > 0
        ? product.variants.map(variant => ({
            ...variant,
            price: variant.price || [],
            stock: variant.stock || [],
          }))
        : [{ type: "", value: [""], price: [], stock: [] }]
    );
    setIsEditingProduct(true); // Set the new state for modal editing
    setModalFor('edit');
    setShowEditProductForm(true);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AdminSidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-sm text-muted-foreground">Manage your Mapita heritage product inventory</p>
          </div>
          <Dialog open={showAddProductForm} onOpenChange={setShowAddProductForm}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <CardContent>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="mb-2">Product Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={newProduct.name}
                        onChange={(e) => handleChange(e, false)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="mb-2">Category</Label>
                      <Select onValueChange={(value: string) => setNewProduct(prev => ({ ...prev, category_id: value }))} value={newProduct.category_id}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>



                  <div>
                    <Label className="mb-2">Variants (Type + Value)</Label>
                    <div className="space-y-2">
                      {variants.map((v: GroupedProductVariant, idx: number) => (
                        <div key={idx} className="grid grid-cols-3 gap-2">
                          <Input
                            placeholder="Variant Type (e.g., Color)"
                            value={v.type}
                            onChange={(e) => handleVariantChange(idx, "type", e.target.value)}
                          />
                          <div className="col-span-2 space-y-2">
                            {v.value.map((val, valueIdx) => (
                              <div key={valueIdx} className="flex gap-2 items-center">
                                <Input
                                  placeholder="Variant Value (e.g., Red)"
                                  value={val}
                                  onChange={(e) => handleVariantValueChange(idx, valueIdx, e.target.value)}
                                />
                                {v.value.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveVariantValue(idx, valueIdx)}
                                  >
                                    <MinusCircle className="h-4 w-4 text-red-500" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddVariantValue(idx)}
                            >
                              Add Value
                            </Button>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleAddVariant()}
                        >
                          Add variant
                        </Button>
                        {variants.length > 1 && (
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => handleRemoveVariant(variants.length - 1)}
                          >
                            Remove last
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>


                  <div className="flex items-center justify-between p-4 border rounded-md mt-4 cursor-pointer" onClick={() => {
                    setModalFor('add');
                    setShowVariantPriceStockModal(true);
                  }}>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">Price/Stock</p>
                      <p className="text-sm text-gray-500">Set price and stock for variants</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  </div>



                  <div>
                    <Label htmlFor="edit-imageFiles" className="mb-2">Product Images (Max 3)</Label>
                    <div className="flex items-center gap-2">
                      {newProduct.image_urls.map((imageUrl: string, index: number) => (
                        <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden">
                          <Image src={imageUrl} alt={`Product Image ${index + 1}`} layout="fill" objectFit="cover" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => handleRemoveImage(index, false)}
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {newProduct.image_urls.length < 3 && (
                        <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <Plus className="h-6 w-6 text-gray-400" />
                          <span className="text-xs text-gray-500">Add Image</span>
                          <Input
                            id="image-upload"
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, false)}
                            multiple
                            accept="image/*"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="mb-2">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={newProduct.description}
                      onChange={(e) => handleChange(e, false)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isAddingProduct}>
                    {isAddingProduct ? "Adding..." : "Add Product"}
                  </Button>
                </form>
              </CardContent>
            </DialogContent>
          </Dialog>

          <Dialog open={showEditProductForm} onOpenChange={setShowEditProductForm}>
            <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
              </DialogHeader>
              <CardContent>
                <form onSubmit={handleEditProductSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-name" className="mb-2">Product Name</Label>
                      <Input
                        id="edit-name"
                        name="name"
                        value={editProduct.name}
                        onChange={(e) => handleChange(e, true)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-category">Category</Label>
                      <Select
                        value={editProduct.category_id}
                        onValueChange={(value) => setEditProduct({ ...editProduct, category_id: value })}
                      >
                        <SelectTrigger id="edit-category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2">Variants (Type + Value)</Label>
                    <div className="space-y-2">
                      {editVariants.map((v: GroupedProductVariant, idx: number) => (
                        <div key={idx} className="grid grid-cols-3 gap-2">
                          <Input
                            placeholder="Variant Type (e.g., Color)"
                            value={v.type}
                            onChange={(e) => handleVariantChange(idx, "type", e.target.value)}
                          />
                          <div className="col-span-2 space-y-2">
                            {v.value.map((val, valueIdx) => (
                              <div key={valueIdx} className="flex gap-2 items-center">
                                <Input
                                  placeholder="Variant Value (e.g., Red)"
                                  value={val}
                                  onChange={(e) => handleVariantValueChange(idx, valueIdx, e.target.value)}
                                />
                                {v.value.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveVariantValue(idx, valueIdx)}
                                  >
                                    <MinusCircle className="h-4 w-4 text-red-500" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddVariantValue(idx)}
                            >
                              Add Value
                            </Button>
                          </div>
                        </div>
                      ))}


                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleAddVariant()}
                        >
                          Add variant
                        </Button>
                        {editVariants.length > 1 && (
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => handleRemoveVariant(editVariants.length - 1)}
                          >
                            Remove last
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>


                  <div className="flex items-center justify-between p-4 border rounded-md mt-4 cursor-pointer" onClick={() => {
                    setModalFor('edit');
                    setShowVariantPriceStockModal(true);
                  }}>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">Price/Stock</p>
                      <p className="text-sm text-gray-500">Set price and stock for variants</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  </div>
      

                   <div>
                    <Label htmlFor="edit-imageFiles" className="mb-2">Product Images (Max 3)</Label>
                    <div className="flex items-center gap-2">
                      {editProduct.image_urls.map((imageUrl: string, index: number) => (
                        <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden">
                          <Image src={imageUrl} alt={`Product Image ${index + 1}`} layout="fill" objectFit="cover" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => handleRemoveImage(index, true)}
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {editProduct.image_urls.length < 3 && (
                        <label htmlFor="edit-image-upload" className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <Plus className="h-6 w-6 text-gray-400" />
                          <span className="text-xs text-gray-500">Add Image</span>
                          <Input
                            id="edit-image-upload"
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, true)}
                            multiple
                            accept="image/*"
                          />
                        </label>
                      )}
                    </div>
                  </div>

 <div>
                    <Label htmlFor="edit-description" className="mb-2">Description</Label>
                    <Textarea
                      id="edit-description"
                      name="description"
                      value={editProduct.description}
                      onChange={(e) => handleChange(e, true)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Product"}
                  </Button>
                </form>
              </CardContent>
            </DialogContent>
          </Dialog>
        </div>
            <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-[300px]">Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-slate-100 overflow-hidden">
                        <img
                          src={product.image_urls?.[0] || "/placeholder.svg"}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span>{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.categories?.name}
                  </TableCell>
                  <TableCell>
                    ₱{product.variantCombinations && product.variantCombinations.length > 0
                      ? Math.min(...product.variantCombinations.map(vc => vc.price).filter((price): price is number => price !== null))
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={product.is_active ? "secondary" : "outline"}
                      className={product.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditProduct(product.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!products?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No products found. Start by adding your first product.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
      <VariantPriceStockModal
        key={modalFor === 'add' ? 'new-product' : currentProductToEdit?.id || 'edit-product'}
        isOpen={showVariantPriceStockModal}
        onClose={() => setShowVariantPriceStockModal(false)}
        productVariants={modalFor === 'add' ? variants.map(v => ({ name: v.type, values: v.value })) : editVariants.map(v => ({ name: v.type, values: v.value }))}
        initialVariantCombinations={modalFor === 'add' ? newProduct.variantCombinations : editProduct.variantCombinations}
        onSave={(data) => {
          if (modalFor === 'add') {
            setNewProduct(prev => ({
              ...prev,
              variantCombinations: data,
            }));
          } else if (modalFor === 'edit') {
            setEditProduct(prev => ({
              ...prev,
              variantCombinations: data,
            }));
          }
          setShowVariantPriceStockModal(false);
        }}

      />
    </div>
  );
}
