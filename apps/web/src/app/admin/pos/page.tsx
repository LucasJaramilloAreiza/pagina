"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@finopenpos/ui/components/card";
import { Combobox } from "@finopenpos/ui/components/combobox";
import { Button } from "@finopenpos/ui/components/button";
import { Input } from "@finopenpos/ui/components/input";
import { Loader2Icon, MinusIcon, PlusIcon, ReceiptTextIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { Skeleton } from "@finopenpos/ui/components/skeleton";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { RouterOutputs } from "@/lib/trpc/router";
import { useTranslations, useLocale } from "next-intl";
import { formatCurrency } from "@/lib/utils";

type Product = RouterOutputs["products"]["list"][number];
type POSProduct = Pick<Product, "id" | "name" | "price" | "in_stock"> & { category: string; quantity: number };

const QUICK_PAYMENT_AMOUNTS = [1000000, 2000000, 5000000, 10000000];

export default function POSPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: products = [], isLoading: loadingProducts } = useQuery(trpc.products.list.queryOptions());
  const { data: customers = [], isLoading: loadingCustomers } = useQuery(trpc.customers.list.queryOptions());
  const { data: paymentMethods = [], isLoading: loadingMethods } = useQuery(trpc.paymentMethods.list.queryOptions());
  const t = useTranslations("pos");
  const tc = useTranslations("common");
  const tOrders = useTranslations("orders");
  const locale = useLocale();

  const loading = loadingProducts || loadingCustomers || loadingMethods;

  const createOrderMutation = useMutation(trpc.orders.create.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries(trpc.orders.list.queryOptions());
      queryClient.invalidateQueries(trpc.products.list.queryOptions());
      toast.success(tOrders("createdSuccessfully"));
      setSelectedProducts([]);
      setSelectedCustomer(null);
      setPaymentMethod(null);
      setCashTendered(null);
    },
    onError: (err) => toast.error(err.message || tOrders("createError")),
  }));

  const [selectedProducts, setSelectedProducts] = useState<POSProduct[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<{ id: number; name: string } | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: number; name: string } | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [emitNfce, setEmitNfce] = useState(false);
  const [cashTendered, setCashTendered] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const barcodeBufferRef = useRef("");

  useEffect(() => {
    searchInputRef.current?.focus();
  }, [productSearch, selectedProducts.length]);

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        const barcode = barcodeBufferRef.current.trim();
        if (barcode) {
          const product = products.find((item) => item.codigo_barras === barcode);
          if (product) {
            handleSelectProduct(product.id);
          } else {
            toast.error(t("notFound"));
          }
          barcodeBufferRef.current = "";
        }
        return;
      }

      if (/^[A-Za-z0-9\-._/\s]$/.test(event.key)) {
        barcodeBufferRef.current += event.key;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [products, t]);

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.category ?? "").toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  const handleSelectProduct = (productId: number | string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    if (product.in_stock <= 0) {
      toast.error(t("outOfStock", { name: product.name }));
      return;
    }
    const existing = selectedProducts.find((p) => p.id === productId);
    if (existing && existing.quantity >= product.in_stock) {
      toast.error(t("limitedStock", { count: product.in_stock, name: product.name }));
      return;
    }
    if (existing) {
      setSelectedProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, quantity: p.quantity + 1 } : p))
      );
    } else {
      setSelectedProducts((prev) => [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          in_stock: product.in_stock,
          category: product.category ?? "",
          quantity: 1,
        },
      ]);
    }
    setProductSearch("");
  };

  const handleSelectCustomer = (customerId: number | string) => {
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      return;
    }
    setSelectedCustomer(null);
  };

  const handleSelectPaymentMethod = (paymentMethodId: number | string) => {
    const method = paymentMethods.find((pm) => pm.id === paymentMethodId);
    if (method) {
      setPaymentMethod(method);
      return;
    }
    setPaymentMethod(null);
  };

  const handleQuantityChange = (productId: number, delta: number) => {
    const product = products.find((p) => p.id === productId);
    setSelectedProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const newQty = p.quantity + delta;
        if (newQty <= 0) return p;
        if (product && newQty > product.in_stock) {
          toast.error(t("limitedUnits", { count: product.in_stock }));
          return p;
        }
        return { ...p, quantity: newQty };
      })
    );
  };

  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const total = selectedProducts.reduce((sum, product) => sum + product.price * product.quantity, 0);
  const selectedCustomerName = selectedCustomer?.name ?? "";
  const selectedPaymentMethodName = paymentMethod?.name ?? "";
  const canCreate = selectedProducts.length > 0 && Boolean(selectedCustomerName) && Boolean(selectedPaymentMethodName);
  const activeTenderedAmount = cashTendered ?? (customAmount ? Number(customAmount) : null);
  const changeAmount = activeTenderedAmount !== null ? Math.max(activeTenderedAmount - total, 0) : 0;
  const missingAmount = total > 0 && activeTenderedAmount !== null && activeTenderedAmount < total ? total - activeTenderedAmount : 0;

  const handleCreateOrder = () => {
    if (!canCreate) return;
    createOrderMutation.mutate({
      customerId: selectedCustomer!.id,
      paymentMethodId: paymentMethod!.id,
      products: selectedProducts.map((p) => ({
        id: p.id,
        quantity: p.quantity,
        price: p.price,
      })),
      total,
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 p-4 md:p-6">
        <Card className="rounded-2xl border border-slate-200 shadow-sm">
          <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
          <CardContent className="flex gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-slate-200 shadow-sm">
          <CardHeader><Skeleton className="h-6 w-24" /></CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-12 w-full" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 md:p-6">
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold text-slate-900">{t("saleDetails")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-sm font-semibold text-slate-700">Cliente</p>
            <Combobox items={customers} placeholder={t("selectCustomer")} onSelect={handleSelectCustomer} />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-sm font-semibold text-slate-700">Pago</p>
            <Combobox items={paymentMethods} placeholder={t("selectPaymentMethod")} onSelect={handleSelectPaymentMethod} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900">{t("products")}</CardTitle>
            <div className="relative mt-3">
              <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <Input
                ref={searchInputRef}
                type="text"
                autoFocus
                placeholder={t("searchPlaceholder")}
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="h-12 rounded-2xl border-slate-300 pl-10 text-base shadow-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                {t("selectProducts")}
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelectProduct(product.id)}
                    disabled={product.in_stock <= 0}
                    className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-400 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{product.name}</p>
                        <p className="mt-1 text-sm font-medium text-slate-600">{formatCurrency(product.price, locale)}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.in_stock > 5 ? "bg-emerald-100 text-emerald-700" : product.in_stock > 0 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                        {product.in_stock > 0 ? `${product.in_stock} und` : "Sin stock"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900">Canasta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">
                {t("selectProducts")}
              </div>
            ) : (
              <div className="space-y-2">
                {selectedProducts.map((product) => {
                  const source = products.find((p) => p.id === product.id);
                  return (
                    <div key={product.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900">{product.name}</p>
                          <p className="text-sm text-slate-600">{formatCurrency(product.price, locale)}</p>
                        </div>
                        <button type="button" onClick={() => handleRemoveProduct(product.id)} className="rounded-full p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800">
                          <Trash2Icon className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="outline" className="h-10 w-10 rounded-xl" onClick={() => handleQuantityChange(product.id, -1)} disabled={product.quantity <= 1}>
                            <MinusIcon className="h-4 w-4" />
                          </Button>
                          <span className="min-w-8 text-center text-base font-semibold tabular-nums">{product.quantity}</span>
                          <Button size="icon" variant="outline" className="h-10 w-10 rounded-xl" onClick={() => handleQuantityChange(product.id, 1)} disabled={source ? product.quantity >= source.in_stock : false}>
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm font-semibold text-slate-900">{formatCurrency(product.quantity * product.price, locale)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-white">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>{tc("total")}</span>
                <span className="text-xl font-semibold text-white">{formatCurrency(total, locale)}</span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {QUICK_PAYMENT_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    onClick={() => setCashTendered(amount)}
                    variant={cashTendered === amount ? "default" : "outline"}
                    className={`h-14 rounded-2xl text-base font-semibold ${cashTendered === amount ? "bg-emerald-500 text-white hover:bg-emerald-600" : "border-white/30 bg-white/10 text-white hover:bg-white/20"}`}
                    disabled={total <= 0}
                  >
                    {formatCurrency(amount, locale)}
                  </Button>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-white/20 bg-white/10 p-3 text-sm">
                <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-300">Monto específico</label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  placeholder="Ej. 15000000"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    if (e.target.value) {
                      setCashTendered(null);
                    }
                  }}
                  className="h-11 rounded-2xl border-white/20 bg-white/90 text-slate-900"
                />
                <p className="mt-3 font-semibold">Vuelto: {formatCurrency(changeAmount, locale)}</p>
                {missingAmount > 0 ? <p className="mt-1 text-amber-300">Falta {formatCurrency(missingAmount, locale)}</p> : null}
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={emitNfce}
                onChange={(e) => setEmitNfce(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              <ReceiptTextIcon className="h-4 w-4" />
              <span>NFC-e</span>
            </div>

            <Button
              onClick={handleCreateOrder}
              disabled={!canCreate || createOrderMutation.isPending}
              className="h-14 w-full rounded-2xl bg-slate-900 text-base font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              {createOrderMutation.isPending && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
              {t("createOrder")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
