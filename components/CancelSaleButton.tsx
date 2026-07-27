"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Sale = {
  id: string;
  customer_id: string | null;
  customer_name: string;
  balance_owed: number;
};

type SaleItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
};

type Product = {
  id: string;
  stock_quantity: number;
};

type Customer = {
  id: string;
  balance_owed: number;
};

export default function CancelSaleButton({
  saleId,
}: {
  saleId: string;
}) {
  const router = useRouter();
  const [canceling, setCanceling] = useState(false);

  async function handleCancelSale() {
    const confirmed = window.confirm(
      "Cancel this sale? This will delete the sale, restore product stock, and adjust the customer balance. This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setCanceling(true);

    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .select("id, customer_id, customer_name, balance_owed")
      .eq("id", saleId)
      .single();

    if (saleError || !sale) {
      setCanceling(false);
      alert(saleError?.message || "Could not find sale.");
      return;
    }

    const { data: saleItems, error: itemsError } = await supabase
      .from("sale_items")
      .select("id, product_id, product_name, quantity")
      .eq("sale_id", saleId);

    if (itemsError) {
      setCanceling(false);
      alert(itemsError.message);
      return;
    }

    const typedSale = sale as Sale;
    const typedSaleItems = (saleItems || []) as SaleItem[];

    for (const item of typedSaleItems) {
      if (!item.product_id) {
        continue;
      }

      const { data: product, error: productReadError } = await supabase
        .from("products")
        .select("id, stock_quantity")
        .eq("id", item.product_id)
        .single();

      if (productReadError || !product) {
        setCanceling(false);
        alert(productReadError?.message || `Could not read ${item.product_name}.`);
        return;
      }

      const typedProduct = product as Product;

      const { error: productUpdateError } = await supabase
        .from("products")
        .update({
          stock_quantity:
            Number(typedProduct.stock_quantity || 0) + Number(item.quantity || 0),
        })
        .eq("id", item.product_id);

      if (productUpdateError) {
        setCanceling(false);
        alert(productUpdateError.message);
        return;
      }
    }

    if (typedSale.customer_id && Number(typedSale.balance_owed || 0) > 0) {
      const { data: customer, error: customerReadError } = await supabase
        .from("customers")
        .select("id, balance_owed")
        .eq("id", typedSale.customer_id)
        .single();

      if (customerReadError || !customer) {
        setCanceling(false);
        alert(customerReadError?.message || "Could not read customer balance.");
        return;
      }

      const typedCustomer = customer as Customer;

      const newBalance = Math.max(
        Number(typedCustomer.balance_owed || 0) -
          Number(typedSale.balance_owed || 0),
        0
      );

      const { error: customerUpdateError } = await supabase
        .from("customers")
        .update({
          balance_owed: newBalance,
        })
        .eq("id", typedSale.customer_id);

      if (customerUpdateError) {
        setCanceling(false);
        alert(customerUpdateError.message);
        return;
      }
    }

    const { error: deleteError } = await supabase
      .from("sales")
      .delete()
      .eq("id", saleId);

    setCanceling(false);

    if (deleteError) {
      alert(deleteError.message);
      return;
    }

    router.push("/sales");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleCancelSale}
      disabled={canceling}
      className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-red-950"
    >
      {canceling ? "Canceling..." : "Cancel sale"}
    </button>
  );
}