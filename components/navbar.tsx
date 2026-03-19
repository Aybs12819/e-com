"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ShoppingCart, Package, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

export function Navbar() {
  const [cartItemCount, setCartItemCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Debounce function
  const debounce = (func: Function, delay: number) => {
    let timeout: NodeJS.Timeout;
    return function(...args: any[]) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length > 0) { // Fetch suggestions if query has at least 1 character
        const { data, error } = await supabase
          .from("products")
          .select("id, name, slug, image_urls")
          .ilike("name", `%${searchQuery}%`)
          .limit(5);

        if (error) {
          console.error("Error fetching suggestions:", error);
          setSuggestions([]);
        } else {
          setSuggestions(data || []);
          setShowSuggestions(true);
        }
      }
    };

    const debouncedFetchSuggestions = debounce(fetchSuggestions, 200); // Reduced debounce time for faster response
    debouncedFetchSuggestions();
  }, [searchQuery]);

  // Fetch all products when search bar is focused and empty
  const fetchAllProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, image_urls")
      .limit(10);

    if (error) {
      console.error("Error fetching all products:", error);
      setSuggestions([]);
    } else {
      setSuggestions(data || []);
      setShowSuggestions(true);
    }
  };

  useEffect(() => {
    const fetchCartCount = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { count, error } = await supabase
          .from("cart_items")
          .select("*", { count: "exact" })
          .eq("user_id", session.user.id);

        if (error) {
          console.error("Error fetching cart count:", error);
        } else {
          setCartItemCount(count || 0);
        }
      }
    };

    fetchCartCount();
  }, []);

  useEffect(() => {
    // Set search query from URL when component mounts
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  const handleLogout = () => {
    router.push("/auth");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
    router.push(`/products/${suggestion.slug}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true); // Always show suggestions when typing
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4">
        {/* Main Nav */}
        <div className="flex items-center justify-between gap-4 py-4">
          <Link
            href="/customer/dashboard"
            className="flex items-center gap-2 text-2xl font-bold tracking-tight transition-transform hover:scale-105"
          >
            <div className="rounded-md px-2 py-1 bg-white">
              <Image 
                src="/e-com.png" 
                alt="E-COM Logo" 
                width={48} 
                height={48}
                className="object-contain"
              />
            </div>
              </Link>

          <div className="relative flex-1 max-w-xl">
            <form onSubmit={handleSearch}>
              <Input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={() => {
                  if (searchQuery.length === 0) {
                    fetchAllProducts();
                  } else {
                    setShowSuggestions(true);
                  }
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="h-10 bg-primary-foreground pr-12 text-foreground placeholder:text-muted-foreground border-0 focus-visible:ring-accent"
                placeholder="Search for heritage products..."
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-3 py-2 text-left text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-3"
                  >
                    <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={suggestion.image_urls?.[0] || "/placeholder.jpg"}
                        alt={suggestion.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium">{suggestion.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <TooltipProvider>
            <nav className="flex items-center gap-2">
              {/* Cart Icon */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/cart">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative text-primary-foreground hover:bg-primary-foreground/10 transition-transform hover:scale-110"
                    >
                      <ShoppingCart className="h-8 w-8" />
                      {cartItemCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground animate-pulse">
                          {cartItemCount}
                        </span>
                      )}
                      <span className="sr-only">Cart</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Cart ({cartItemCount} items)</p>
                </TooltipContent>
              </Tooltip>

              {/* Purchase History Icon */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/orders">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-primary-foreground hover:bg-primary-foreground/10 transition-transform hover:scale-110"
                    >
                      <Package className="h-8 w-8" />
                      <span className="sr-only">Purchase History</span>
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Purchase History</p>
                </TooltipContent>
              </Tooltip>

              {/* Logout Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-primary-foreground hover:bg-primary-foreground/10 transition-transform hover:scale-110"
                  >
                    <LogOut className="h-8 w-8" />
                    <span className="sr-only">Logout</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </nav>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}
