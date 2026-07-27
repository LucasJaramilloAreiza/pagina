"use client";

import { useState, useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";
import { Button } from "@finopenpos/ui/components/button";
import { Card, CardContent, CardHeader } from "@finopenpos/ui/components/card";
import { FilePenIcon, TrashIcon, PlusIcon, PackageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@finopenpos/ui/components/dialog";
import { Input } from "@finopenpos/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@finopenpos/ui/components/select";
import { Label } from "@finopenpos/ui/components/label";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { Skeleton } from "@finopenpos/ui/components/skeleton";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useCrudMutation } from "@/hooks/use-crud-mutation";
import { SearchFilter, type FilterOption } from "@finopenpos/ui/components/search-filter";
import type { RouterOutputs } from "@/lib/trpc/router";
import { useTranslations, useLocale } from "next-intl";
import { formatCurrency } from "@/lib/utils";

type Product = RouterOutputs["products"]["list"][number];

export default function Products() {
  const trpc = useTRPC();
  const { data: products = [], isLoading } = useQuery(trpc.products.list.queryOptions());
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const locale = useLocale();

  const productFormSchema = z.object({
    name: z.string().min(1, t("nameRequired")),
    description: z.string(),
    codigo_barras: z.string().optional().or(z.literal("")),
    price: z.number().min(0, t("priceMustBePositive")),
    in_stock: z.number().int().min(0, t("stockMustBeNonNegative")),
    category: z.string(),
  });

  const categoryFilterOptions: FilterOption[] = [
    { label: tc("all"), value: "all" },
    { label: t("groceries"), value: "abarrotes" },
    { label: t("drinks"), value: "bebidas" },
    { label: t("dairy"), value: "lacteos" },
    { label: t("meat"), value: "carnes" },
    { label: t("hygiene"), value: "higiene" },
    { label: t("bakery"), value: "panaderia" },
  ];

  const stockFilterOptions: FilterOption[] = [
    { label: t("allStock"), value: "all" },
    { label: t("inStock"), value: "in-stock", variant: "success" },
    { label: t("outOfStock"), value: "out-of-stock", variant: "danger" },
  ];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const isEditing = editingId !== null;
  const invalidateKeys = trpc.products.list.queryOptions().queryKey;

  const createMutation = useCrudMutation({
    mutationOptions: trpc.products.create.mutationOptions(),
    invalidateKeys,
    successMessage: t("created"),
    errorMessage: t("createError"),
    onSuccess: () => setIsDialogOpen(false),
  });

  const updateMutation = useCrudMutation({
    mutationOptions: trpc.products.update.mutationOptions(),
    invalidateKeys,
    successMessage: t("updated"),
    errorMessage: t("updateError"),
    onSuccess: () => setIsDialogOpen(false),
  });

  const deleteMutation = useCrudMutation({
    mutationOptions: trpc.products.delete.mutationOptions(),
    invalidateKeys,
    successMessage: t("deleted"),
    errorMessage: t("deleteError"),
  });

  const form = useForm({
    defaultValues: { name: "", description: "", codigo_barras: "", price: 0, in_stock: 0, category: "" },
    validators: {
      onSubmit: productFormSchema,
    },
    onSubmit: ({ value }) => {
      const payload = {
        name: value.name,
        description: value.description || undefined,
        price: Math.round(value.price * 100),
        in_stock: value.in_stock,
        category: value.category || undefined,
        codigo_barras: value.codigo_barras?.trim() || undefined,
      };
      if (isEditing) {
        updateMutation.mutate({ id: editingId, ...payload });
      } else {
        createMutation.mutate(payload);
      }
    },
  });

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false;
      if (stockFilter === "in-stock" && p.in_stock === 0) return false;
      if (stockFilter === "out-of-stock" && p.in_stock > 0) return false;
      return p.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [products, categoryFilter, stockFilter, searchTerm]);

  const openCreate = () => {
    setEditingId(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    form.reset();
    form.setFieldValue("name", p.name);
    form.setFieldValue("description", p.description ?? "");
    form.setFieldValue("price", p.price / 100);
    form.setFieldValue("in_stock", p.in_stock);
    form.setFieldValue("category", p.category ?? "");
    form.setFieldValue("codigo_barras", p.codigo_barras ?? "");
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    if (deleteId !== null) {
      deleteMutation.mutate({ id: deleteId });
      setIsDeleteOpen(false);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-6">
        <CardHeader className="p-0"><div className="flex items-center justify-between"><Skeleton className="h-10 w-48" /><Skeleton className="h-9 w-32" /></div></CardHeader>
        <CardContent className="p-0 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (<div key={i} className="flex items-center gap-4"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-48" /><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-12" /><Skeleton className="h-8 w-20" /></div>))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-none bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-500 p-4 text-white shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-emerald-100">Semáforo de inventario</p>
            <h2 className="text-2xl font-semibold">Productos en stock</h2>
            <p className="mt-1 text-sm text-emerald-100">Un vistazo rápido para saber qué ya está listo y qué necesita reabastecimiento.</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">Bajo stock</p>
            <p className="text-xl font-semibold">{products.filter((product) => product.in_stock <= 3).length}</p>
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-6">
        <CardHeader className="p-0">
          <SearchFilter
            search={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder={t("searchPlaceholder")}
            filters={[
              { options: categoryFilterOptions, value: categoryFilter, onChange: setCategoryFilter },
              { options: stockFilterOptions, value: stockFilter, onChange: setStockFilter },
            ]}
          >
            <Button size="sm" onClick={openCreate}>
              <PlusIcon className="w-4 h-4 mr-2" />{t("addProduct")}
            </Button>
          </SearchFilter>
        </CardHeader>
        <CardContent className="p-0">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-600">
              <PackageIcon className="mb-3 h-8 w-8 text-slate-400" />
              <p>{t("noProducts")}</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => {
                const stockLevel = product.in_stock === 0 ? "danger" : product.in_stock <= 3 ? "warning" : "success";
                const stockLabel = product.in_stock === 0 ? "Sin stock" : product.in_stock <= 3 ? "Poco stock" : "Disponible";
                const stockClass = product.in_stock === 0 ? "bg-rose-50 text-rose-700" : product.in_stock <= 3 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700";

                return (
                  <div key={product.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{product.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{product.description || "Sin descripción"}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${stockClass}`}>{stockLabel}</span>
                    </div>
                    <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                      <div className="flex items-center justify-between">
                        <span>Precio</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(product.price, locale)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span>Stock</span>
                        <span className="font-semibold text-slate-900">{product.in_stock}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(product)}>
                        <FilePenIcon className="mr-2 h-4 w-4" />{tc("edit")}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setDeleteId(product.id); setIsDeleteOpen(true); }}>
                        <TrashIcon className="mr-2 h-4 w-4" />{tc("delete")}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) setIsDialogOpen(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? t("editProduct") : t("addNewProduct")}</DialogTitle>
            <DialogDescription>{isEditing ? t("editDescription") : t("addDescription")}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div className="grid gap-4 py-4">
              <form.Field name="name">
                {(field) => (
                  <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="name" className="sm:text-right">{tc("name")}</Label>
                    <div className="col-span-3">
                      <Input
                        id="name"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        error={field.state.meta.errors.length > 0 ? field.state.meta.errors.map(e => e?.message ?? e).join(", ") : undefined}
                      />
                    </div>
                  </div>
                )}
              </form.Field>
              <form.Field name="description">
                {(field) => (
                  <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="description" className="sm:text-right">{tc("description")}</Label>
                    <Input id="description" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} className="col-span-3" />
                  </div>
                )}
              </form.Field>
              <form.Field name="codigo_barras">
                {(field) => (
                  <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="codigo_barras" className="sm:text-right">Código de barras</Label>
                    <div className="col-span-3">
                      <Input
                        id="codigo_barras"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="Ej. 7701234567890"
                      />
                    </div>
                  </div>
                )}
              </form.Field>
              <form.Field name="price">
                {(field) => (
                  <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="price" className="sm:text-right">{tc("price")}</Label>
                    <div className="col-span-3">
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        onBlur={field.handleBlur}
                        error={field.state.meta.errors.length > 0 ? field.state.meta.errors.map(e => e?.message ?? e).join(", ") : undefined}
                      />
                    </div>
                  </div>
                )}
              </form.Field>
              <form.Field name="in_stock">
                {(field) => (
                  <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="in_stock" className="sm:text-right">{t("inStock")}</Label>
                    <div className="col-span-3">
                      <Input
                        id="in_stock"
                        type="number"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        onBlur={field.handleBlur}
                        error={field.state.meta.errors.length > 0 ? field.state.meta.errors.map(e => e?.message ?? e).join(", ") : undefined}
                      />
                    </div>
                  </div>
                )}
              </form.Field>
              <form.Field name="category">
                {(field) => (
                  <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="category" className="sm:text-right">{tc("category")}</Label>
                    <Select value={field.state.value} onValueChange={(value) => field.handleChange(value)}>
                      <SelectTrigger className="col-span-3"><SelectValue placeholder={t("selectCategory")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="abarrotes">{t("groceries")}</SelectItem>
                        <SelectItem value="bebidas">{t("drinks")}</SelectItem>
                        <SelectItem value="lacteos">{t("dairy")}</SelectItem>
                        <SelectItem value="carnes">{t("meat")}</SelectItem>
                        <SelectItem value="higiene">{t("hygiene")}</SelectItem>
                        <SelectItem value="panaderia">{t("bakery")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>
            </div>
            <DialogFooter>
              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}>
                    {isEditing ? t("updateProduct") : t("addProduct")}
                  </Button>
                )}
              </form.Subscribe>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} onConfirm={handleDelete} description={t("deleteMessage")} />
    </>
  );
}
