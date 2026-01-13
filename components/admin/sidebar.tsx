"use client";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  BarChart3,
  PackageOpen,
  LogOut,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
  { icon: Users, label: "User Management", href: "/admin/users" },
  { icon: Truck, label: "Logistics", href: "/admin/logistics" },
  { icon: BarChart3, label: "Sales Report", href: "/admin/sales-report" },
  { icon: PackageOpen, label: "Custom Products", href: "/admin/custom-products" },
];

export function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabaseClient = supabase;

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    router.push("/auth");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r bg-white shadow-sm">
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-xl font-bold text-primary"
        >
          <div className="rounded bg-accent p-1 text-accent-foreground">LH</div>
          <span>Admin Panel</span>
        </Link>
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100 hover:text-primary",
              pathname === item.href
                ? "bg-slate-100 text-primary"
                : "text-muted-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-4 w-full border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
