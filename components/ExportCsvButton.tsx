"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";

type ExportType = "products" | "customers" | "sales";

function escapeCsvValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);
  const escapedValue = stringValue.replace(/"/g, '""');

  if (
    escapedValue.includes(",") ||
    escapedValue.includes('"') ||
    escapedValue.includes("\n")
  ) {
    return `"${escapedValue}"`;
  }

  return escapedValue;
}

function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    alert("No data to export.");
    return;
  }

  const headers = Object.keys(rows[0]);

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => escapeCsvValue(row[header])).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

export default function ExportCsvButton({
  type,
  label,
}: {
  type: ExportType;
  label: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);

    if (type === "products") {
      const { data, error } = await supabase
        .from("products")
        .select(
          "name, category, cost_price, selling_price, stock_quantity, low_stock_threshold, created_at"
        )
        .order("created_at", { ascending: false });

      setLoading(false);

      if (error) {
        alert(error.message);
        return;
      }

      downloadCsv("oneshelf-products.csv", data || []);
      return;
    }

    if (type === "customers") {
      const { data, error } = await supabase
        .from("customers")
        .select("name, phone, balance_owed, last_purchase_at, created_at")
        .order("created_at", { ascending: false });

      setLoading(false);

      if (error) {
        alert(error.message);
        return;
      }

      downloadCsv("oneshelf-customers.csv", data || []);
      return;
    }

    if (type === "sales") {
      const { data: sales, error: salesError } = await supabase
        .from("sales")
        .select(
          "id, customer_name, total_amount, amount_paid, balance_owed, payment_method, notes, created_at"
        )
        .order("created_at", { ascending: false });

      const { data: saleItems, error: itemsError } = await supabase
        .from("sale_items")
        .select("sale_id, product_name, quantity, unit_price, total_price")
        .order("created_at", { ascending: false });

      setLoading(false);

      if (salesError || itemsError) {
        alert(salesError?.message || itemsError?.message || "Export failed.");
        return;
      }

      const rows = (sales || []).map((sale) => {
        const matchingItems = (saleItems || []).filter(
          (item) => item.sale_id === sale.id
        );

        return {
          created_at: sale.created_at,
          customer_name: sale.customer_name,
          items: matchingItems
            .map((item) => `${item.product_name} x ${item.quantity}`)
            .join("; "),
          total_amount: sale.total_amount,
          amount_paid: sale.amount_paid,
          balance_owed: sale.balance_owed,
          payment_method: sale.payment_method,
          notes: sale.notes || "",
        };
      });

      downloadCsv("oneshelf-sales.csv", rows);
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Exporting..." : label}
    </button>
  );
}