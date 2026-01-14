"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, Package, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

export function Navbar() {
  const [cartItemCount] = useState(3);
  const router = useRouter();

  const handleLogout = () => {
    router.push("/auth");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4">
        {/* Main Nav */}
        <div className="flex items-center justify-between gap-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-2xl font-bold tracking-tight transition-transform hover:scale-105"
          >
            <div className="rounded-md bg-accent px-2 py-1 text-accent-foreground font-black">
                LH
              </div>
              <span className="hidden sm:inline">LinkHabi</span>
          </Link>

          <div className="relative flex-1 max-w-xl">
            <Input
              className="h-10 bg-primary-foreground pr-12 text-foreground placeholder:text-muted-foreground border-0 focus-visible:ring-accent"
              placeholder="Search for heritage products..."
            />
            <Button
              size="icon"
              className="absolute right-1 top-1 h-8 w-8 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Search className="h-4 w-4" />
            </Button>
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
                  <Link href="/purchases">
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
