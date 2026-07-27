"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@finopenpos/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@finopenpos/ui/components/dropdown-menu";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@finopenpos/ui/components/tooltip";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Package2Icon,
  LayoutDashboardIcon,
  ShoppingCartIcon,
  PackageIcon,
  UsersIcon,
  ReceiptTextIcon,
  MenuIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/locale-switcher";

import { logout } from "@/app/login/actions";

interface NavItem {
  href: string;
  labelKey: "dashboard" | "products" | "customers" | "pos" | "invoices";
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: "/admin", labelKey: "dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/pos", labelKey: "pos", icon: ShoppingCartIcon },
  { href: "/admin/products", labelKey: "products", icon: PackageIcon },
  { href: "/admin/customers", labelKey: "customers", icon: UsersIcon },
  { href: "/admin/fiscal", labelKey: "invoices", icon: ReceiptTextIcon },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations("nav");

  const pageNames: Record<string, string> = Object.fromEntries(
    navItems.map((item) => [item.href, t(item.labelKey)])
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-slate-200 bg-white px-3 shadow-sm sm:px-4 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden shrink-0"
          onClick={() => setMobileMenuOpen(true)}
        >
          <MenuIcon className="h-5 w-5" />
          <span className="sr-only">{t("openMenu")}</span>
        </Button>
        <Link
          href="/admin"
          className="hidden items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white sm:flex"
        >
          <Package2Icon className="h-6 w-6" />
          <span className="sr-only">{t("adminPanel")}</span>
        </Link>
        <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl">{pageNames[pathname]}</h1>
        <div className="ml-auto flex items-center gap-2">
          <LocaleSwitcher />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full shrink-0"
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/placeholder-user.jpg`}
                  width={36}
                  height={36}
                  alt="Avatar"
                  className="overflow-hidden rounded-full"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t("myAccount")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>{t("settings")}</DropdownMenuItem>
              <DropdownMenuItem>{t("support")}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>{t("logout")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav className="fixed inset-y-0 left-0 w-64 bg-background border-r p-4 flex flex-col gap-2 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <Link
                href="/admin"
                className="flex items-center gap-2 text-lg font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Package2Icon className="h-6 w-6" />
                <span>FinOpenPOS</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <XIcon className="h-5 w-5" />
              </Button>
            </div>
            {navItems.map(({ href, labelKey, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  pathname === href
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {t(labelKey)}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-16">
        <aside className="fixed inset-y-0 left-0 z-10 mt-16 hidden w-16 flex-col border-r border-slate-200 bg-white shadow-sm sm:flex">
          <nav className="flex flex-col items-center gap-3 px-2 py-4">
            <TooltipProvider>
              {navItems.map(({ href, labelKey, icon: Icon }) => (
                <Tooltip key={href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={href}
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                        pathname === href
                          ? "bg-slate-900 text-white"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      } transition-colors`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="sr-only">{t(labelKey)}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{t(labelKey)}</TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </nav>
        </aside>
        <main className="flex-1 overflow-x-hidden p-3 sm:px-6 sm:py-0">{children}</main>
      </div>
    </div>
  );
}
