"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import { AdminSidebar } from "@/components/admin/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, X } from "lucide-react"
import Image from "next/image"
import { uploadProductImage } from "@/utils/supabase/storage"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface Category {
  id: string;
  name: string;
}

interface CustomProduct {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  base_price: number | null;
  images: string[];
  status: string;
  created_at: string;
  updated_at: string;
  categories?: { id: string; name: string } | null;
}

interface NewCustomProductState {
  name: string;
  description: string;
  category_id: string;
  image_urls: string[]; // mapped to DB 'images'
  base_price: number | null;
  slug: string;
}

export default function AdminCustomProductsPage() {
  const { toast } = useToast();

  const [customProducts, setCustomProducts] = useState<CustomProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentProductToEdit, setCurrentProductToEdit] = useState<CustomProduct | null>(null);
  const [newProduct, setNewProduct] = useState<NewCustomProductState>({
    name: "",
    description: "",
    category_id: "",
    image_urls: [],
    base_price: 0,
    slug: "",
  });
  const [editProduct, setEditProduct] = useState<NewCustomProductState>({
    name: "",
    description: "",
    category_id: "",
    image_urls: [],
    base_price: 0,
    slug: "",
  });

  const fetchCustomProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("custom_products")
        .select("*, categories(id, name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      const mapped: CustomProduct[] = (data || []).map((cp: any) => ({
        ...cp,
        images: cp.images || [],
        categories: cp.categories || null,
      }));
      setCustomProducts(mapped);
    } catch (error: any) {
      toast({
        title: "Error fetching custom products",
        description: error.message,
        variant: "destructive",
      });
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
  }, [toast]);

  useEffect(() => {
    fetchCustomProducts();
    fetchCategories();
  }, [fetchCustomProducts, fetchCategories]);

  const handleAddCustomProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    const generatedSlug = newProduct.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-*|-*$/g, "");

    try {
      const payload = {
        name: newProduct.name,
        description: newProduct.description,
        category_id: newProduct.category_id,
        image_urls: newProduct.image_urls,
        slug: generatedSlug,
        base_price: Number(newProduct.base_price),
        status: "Confirmed Order",
      };

      const response = await fetch("/api/admin/custom-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to add custom product");
      }

      toast({ title: "Custom product added", description: `${newProduct.name} created.` });
      setShowAddForm(false);
      setNewProduct({ name: "", description: "", category_id: "", image_urls: [], base_price: 0, slug: "" });
      fetchCustomProducts();
    } catch (error: any) {
      toast({ title: "Error adding custom product", description: error.message, variant: "destructive" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateCustomProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProductToEdit) return;

    setIsSubmitting(true);

    const generatedSlug = editProduct.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-*|-*$/g, "");

    try {
      const payload = {
        customProductId: currentProductToEdit.id,
        customProductData: {
          name: editProduct.name,
          description: editProduct.description,
          category_id: editProduct.category_id,
          image_urls: editProduct.image_urls,
          slug: generatedSlug,
          base_price: Number(editProduct.base_price),
          status: currentProductToEdit.status || "Confirmed Order",
        },
      };

      const response = await fetch(`/api/admin/custom-products`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update custom product");
      }

      toast({ title: "Custom product updated", description: `${editProduct.name} has been updated.` });
      setShowEditForm(false);
      fetchCustomProducts();
    } catch (error: any) {
      toast({ title: "Error updating custom product", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomProduct = async (productId: string) => {
    if (!confirm("Delete this custom product?")) return;
    try {
      const response = await fetch(`/api/admin/custom-products?id=${productId}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to delete custom product");
      }
      toast({ title: "Custom product deleted", description: "The product has been removed." });
      fetchCustomProducts();
    } catch (error: any) {
      toast({ title: "Error deleting custom product", description: error.message, variant: "destructive" });
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    isEditForm: boolean = false
  ) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const uploadedImageUrls: string[] = [];
    for (const file of files) {
      const { publicUrl, error } = await uploadProductImage(file);
      if (error) {
        toast({ title: "Image upload failed", description: error.message, variant: "destructive" });
        continue;
      }
      uploadedImageUrls.push(publicUrl);
    }

    if (isEditForm) {
      setEditProduct((prev) => ({ ...prev, image_urls: [...prev.image_urls, ...uploadedImageUrls].slice(0, 3) }));
    } else {
      setNewProduct((prev) => ({ ...prev, image_urls: [...prev.image_urls, ...uploadedImageUrls].slice(0, 3) }));
    }
  };

  const handleRemoveImage = (index: number, isEditForm: boolean = false) => {
    if (isEditForm) {
      const newImageUrls = editProduct.image_urls.filter((_: string, i: number) => i !== index);
      setEditProduct((prev) => ({ ...prev, image_urls: newImageUrls }));
    } else {
      const newImageUrls = newProduct.image_urls.filter((_: string, i: number) => i !== index);
      setNewProduct((prev) => ({ ...prev, image_urls: newImageUrls }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    isEditForm: boolean = false
  ) => {
    const { name, value, type } = e.target;
    const setter = isEditForm ? setEditProduct : setNewProduct;
    if (type === "number") {
      setter((prev) => ({ ...prev, [name]: value === "" ? null : parseFloat(value) }));
    } else if (name === "image_urls") {
      setter((prev) => ({ ...prev, [name]: value.split(",").map((url: string) => url.trim()) }));
    } else {
      setter((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEditProduct = (productId: string) => {
    const product = customProducts.find((p) => p.id === productId);
    if (!product) return;
    setCurrentProductToEdit(product);
    setEditProduct({
      name: product.name,
      description: product.description || "",
      category_id: product.category_id || "",
      image_urls: product.images || [],
      base_price: product.base_price,
      slug: product.slug,
    });
    setShowEditForm(true);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <AdminSidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Custom Products</h1>
            <p className="text-sm text-muted-foreground">Manage custom product orders (isolated from regular products)</p>
          </div>
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Custom Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Add Custom Product</DialogTitle>
              </DialogHeader>
              <CardContent>
                <form onSubmit={handleAddCustomProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="mb-2">Product Name</Label>
                      <Input id="name" name="name" value={newProduct.name} onChange={(e) => handleChange(e, false)} required />
                    </div>
                    <div>
                      <Label htmlFor="category" className="mb-2">Category</Label>
                      <Select onValueChange={(value: string) => setNewProduct((prev) => ({ ...prev, category_id: value }))} value={newProduct.category_id}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="block mb-2">Status</Label>
                      <Badge>Confirmed Order</Badge>
                    </div>
                    <div>
                      <Label htmlFor="base_price" className="block mb-2">Base Price</Label>
                      <InputGroup>
                        <InputGroupAddon>₱</InputGroupAddon>
                        <InputGroupInput id="base_price" name="base_price" type="number" step="0.01" placeholder="0" value={newProduct.base_price ?? ""} onChange={(e) => handleChange(e, false)} />
                      </InputGroup>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="mb-2">Description</Label>
                    <Textarea id="description" name="description" value={newProduct.description} onChange={(e) => handleChange(e, false)} />
                  </div>

                  <div>
                    <Label htmlFor="imageFiles" className="mb-2">Product Images</Label>
                    <div className="flex items-center gap-2">
                      {newProduct.image_urls.map((imageUrl: string, index: number) => (
                        <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden">
                          <Image src={imageUrl} alt={`Product Image ${index + 1}`} fill className="object-cover" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => handleRemoveImage(index, false)}
                          >
                            <X className="h-4 w-4" />
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

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isAdding}>{isAdding ? "Adding..." : "Add Custom Product"}</Button>
                  </div>
                </form>
              </CardContent>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="flex items-center gap-3">
                    {product.images?.[0] && (
                      <div className="relative h-10 w-10">
                        <Image src={product.images[0]} alt={product.name} fill className="rounded object-cover" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.slug}</div>
                    </div>
                  </TableCell>
                  <TableCell>{product.categories?.name || "Uncategorized"}</TableCell>
                  <TableCell>{product.base_price != null ? `₱${Number(product.base_price).toFixed(2)}` : "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.status || "Confirmed Order"}</Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Dialog open={showEditForm && currentProductToEdit?.id === product.id} onOpenChange={(open) => setShowEditForm(open)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleEditProduct(product.id)}>
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>Edit Custom Product</DialogTitle>
                        </DialogHeader>
                        <CardContent>
                          <form onSubmit={handleUpdateCustomProduct} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="edit_name" className="mb-2">Product Name</Label>
                                <Input id="edit_name" name="name" value={editProduct.name} onChange={(e) => handleChange(e, true)} required />
                              </div>
                              <div>
                                <Label htmlFor="edit_category" className="mb-2">Category</Label>
                                <Select onValueChange={(value: string) => setEditProduct((prev) => ({ ...prev, category_id: value }))} value={editProduct.category_id}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Category" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categories.map((category) => (
                                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div>
                              <Label htmlFor="edit_description" className="mb-2">Description</Label>
                              <Textarea id="edit_description" name="description" value={editProduct.description} onChange={(e) => handleChange(e, true)} />
                            </div>

                            <div>
                              <Label htmlFor="edit_base_price" className="block mb-2">Base Price</Label>
                              <InputGroup>
                                <InputGroupAddon>₱</InputGroupAddon>
                                <InputGroupInput id="edit_base_price" name="base_price" type="number" step="0.01" placeholder="0" value={editProduct.base_price ?? ""} onChange={(e) => handleChange(e, true)} />
                              </InputGroup>
                            </div>

                            <div>
                              <Label className="mb-2">Images</Label>
                              <Input type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e, true)} />
                              <div className="mt-2 flex gap-2">
                                {editProduct.image_urls.map((url, idx) => (
                                  <div key={idx} className="relative w-20 h-20">
                                    <Image src={url} alt={`Image ${idx + 1}`} fill className="rounded object-cover" />
                                    <Button type="button" variant="destructive" size="sm" className="absolute -top-2 -right-2" onClick={() => handleRemoveImage(idx, true)}>Remove</Button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label className="block mb-2">Status</Label>
                              <Badge>Confirmed Order</Badge>
                            </div>

                            <div className="flex justify-end">
                              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
                            </div>
                          </form>
                        </CardContent>
                      </DialogContent>
                    </Dialog>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteCustomProduct(product.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!customProducts.length && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No custom products found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}