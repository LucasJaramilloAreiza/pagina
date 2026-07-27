"use client";

import { useState, useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";
import { Card, CardContent, CardHeader } from "@finopenpos/ui/components/card";
import { PlusCircle, FilePenIcon, TrashIcon, UsersIcon, PhoneIcon, WalletIcon } from "lucide-react";
import { Button } from "@finopenpos/ui/components/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@finopenpos/ui/components/dialog";
import { Input } from "@finopenpos/ui/components/input";
import { Label } from "@finopenpos/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@finopenpos/ui/components/select";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { Skeleton } from "@finopenpos/ui/components/skeleton";
import { useTRPC } from "@/lib/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { useCrudMutation } from "@/hooks/use-crud-mutation";
import type { RouterOutputs } from "@/lib/trpc/router";
import { useTranslations } from "next-intl";
import { SearchFilter } from "@finopenpos/ui/components/search-filter";

type Customer = RouterOutputs["customers"]["list"][number];

export default function CustomersPage() {
  const trpc = useTRPC();
  const { data: customers = [], isLoading, error } = useQuery(trpc.customers.list.queryOptions());
  const t = useTranslations("customers");
  const tc = useTranslations("common");

  const customerFormSchema = z.object({
    name: z.string().min(1, t("nameRequired")),
    email: z.string().optional().or(z.literal("")),
    phone: z.string(),
    status: z.enum(["active", "inactive"]),
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const statusFilterOptions = [
    { label: tc("all"), value: "all" },
    { label: tc("active"), value: "active", variant: "success" as const },
    { label: tc("inactive"), value: "inactive", variant: "danger" as const },
  ];

  const isEditing = editingId !== null;
  const invalidateKeys = trpc.customers.list.queryOptions().queryKey;

  const createMutation = useCrudMutation({
    mutationOptions: trpc.customers.create.mutationOptions(),
    invalidateKeys,
    successMessage: t("created"),
    errorMessage: t("createError"),
    onSuccess: () => setIsDialogOpen(false),
  });

  const updateMutation = useCrudMutation({
    mutationOptions: trpc.customers.update.mutationOptions(),
    invalidateKeys,
    successMessage: t("updated"),
    errorMessage: t("updateError"),
    onSuccess: () => setIsDialogOpen(false),
  });

  const deleteMutation = useCrudMutation({
    mutationOptions: trpc.customers.delete.mutationOptions(),
    invalidateKeys,
    successMessage: t("deleted"),
    errorMessage: t("deleteError"),
  });

  const form = useForm({
    defaultValues: { name: "", email: "", phone: "", status: "active" as "active" | "inactive" },
    validators: {
      onSubmit: customerFormSchema,
    },
    onSubmit: ({ value }) => {
      const payload = {
        name: value.name,
        email: value.email?.trim() || undefined,
        phone: value.phone || undefined,
        status: value.status,
      };
      if (isEditing) {
        updateMutation.mutate({ id: editingId, ...payload });
      } else {
        createMutation.mutate(payload);
      }
    },
  });

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      const q = searchTerm.toLowerCase();
      return c.name.toLowerCase().includes(q) || (c.phone ?? "").includes(searchTerm);
    });
  }, [customers, statusFilter, searchTerm]);

  const openCreate = () => {
    setEditingId(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditingId(c.id);
    form.reset();
    form.setFieldValue("name", c.name);
    form.setFieldValue("email", c.email);
    form.setFieldValue("phone", c.phone ?? "");
    form.setFieldValue("status", (c.status ?? "active") as "active" | "inactive");
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
      <Card className="flex flex-col gap-6 p-6">
        <CardHeader className="p-0"><div className="flex items-center justify-between"><Skeleton className="h-10 w-48" /><Skeleton className="h-9 w-32" /></div></CardHeader>
        <CardContent className="p-0 space-y-3">{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="flex items-center gap-4"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-40" /><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-16" /><Skeleton className="h-8 w-20" /></div>))}</CardContent>
      </Card>
    );
  }

  if (error) { return <Card><CardContent><p className="text-red-500">{error.message}</p></CardContent></Card>; }

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-none bg-gradient-to-br from-slate-900 to-slate-700 p-4 text-white shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-slate-300">Cuaderno digital</p>
            <h2 className="text-2xl font-semibold">Clientes y fiados</h2>
            <p className="mt-1 text-sm text-slate-300">Registro simple para atender a cada cliente sin perder el hilo del crédito.</p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Activos</p>
            <p className="text-xl font-semibold">{customers.filter((customer) => customer.status === "active").length}</p>
          </div>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-3 sm:gap-6 sm:p-6">
        <CardHeader className="p-0">
          <SearchFilter
            search={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder={t("searchPlaceholder")}
            filters={[{ options: statusFilterOptions, value: statusFilter, onChange: setStatusFilter }]}
          >
            <Button size="sm" onClick={openCreate}><PlusCircle className="w-4 h-4 mr-2" />{t("addCustomer")}</Button>
          </SearchFilter>
        </CardHeader>
        <CardContent className="p-0">
          {filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-600">
              <UsersIcon className="mb-3 h-8 w-8 text-slate-400" />
              <p>{t("noCustomers")}</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{customer.name}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${customer.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {customer.status === "active" ? tc("active") : tc("inactive")}
                    </span>
                  </div>
                  <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4 text-slate-400" />
                      <span>{customer.phone || "Sin teléfono"}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <WalletIcon className="h-4 w-4 text-slate-400" />
                      <span>Fiado: {customer.status === "active" ? "en seguimiento" : "sin crédito"}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(customer)}>
                      <FilePenIcon className="mr-2 h-4 w-4" />{tc("edit")}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setDeleteId(customer.id); setIsDeleteOpen(true); }}>
                      <TrashIcon className="mr-2 h-4 w-4" />{tc("delete")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) setIsDialogOpen(false); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{isEditing ? t("editCustomer") : t("createCustomer")}</DialogTitle></DialogHeader>
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
                    <Label htmlFor="name">{tc("name")}</Label>
                    <div className="col-span-3">
                      <Input id="name" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} onBlur={field.handleBlur} error={field.state.meta.errors.length > 0 ? field.state.meta.errors.map(e => e?.message ?? e).join(", ") : undefined} />
                    </div>
                  </div>
                )}
              </form.Field>
              <form.Field name="phone">
                {(field) => (
                  <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="phone">{tc("phone")}</Label>
                    <Input id="phone" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} className="col-span-3" />
                  </div>
                )}
              </form.Field>
              <form.Field name="status">
                {(field) => (
                  <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="status">{tc("status")}</Label>
                    <Select value={field.state.value} onValueChange={(value) => field.handleChange(value as "active" | "inactive")}>
                      <SelectTrigger id="status" className="col-span-3"><SelectValue placeholder={t("selectStatus")} /></SelectTrigger>
                      <SelectContent><SelectItem value="active">{tc("active")}</SelectItem><SelectItem value="inactive">{tc("inactive")}</SelectItem></SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>{tc("cancel")}</Button>
              <form.Subscribe selector={(state) => state.isSubmitting}>
                {(isSubmitting) => (
                  <Button type="submit" disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}>
                    {isEditing ? t("updateCustomer") : t("addCustomer")}
                  </Button>
                )}
              </form.Subscribe>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} onConfirm={handleDelete} description={t("deleteMessage")} />
    </div>
  );
}
