"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RecordCustomerPaymentButton({
  customerId,
  customerName,
  currentBalance,
}: {
  customerId: string;
  customerName: string;
  currentBalance: number;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleRecordPayment() {
    const rawAmount = window.prompt(
      `${customerName} owes $${Number(currentBalance || 0).toLocaleString()}.\n\nEnter payment amount:`
    );

    if (!rawAmount) {
      return;
    }

    const amount = Number(rawAmount);

    if (!amount || amount <= 0) {
      alert("Payment amount must be greater than 0.");
      return;
    }

    if (amount > Number(currentBalance || 0)) {
      const confirmed = window.confirm(
        `This payment is bigger than the balance owed.\n\nBalance: $${Number(
          currentBalance || 0
        ).toLocaleString()}\nPayment: $${amount.toLocaleString()}\n\nContinue and set balance to $0?`
      );

      if (!confirmed) {
        return;
      }
    }

    const notes = window.prompt("Optional note for this payment:") || "";

    setSaving(true);

    const newBalance = Math.max(Number(currentBalance || 0) - amount, 0);

    const { error: paymentError } = await supabase
      .from("customer_payments")
      .insert({
        customer_id: customerId,
        customer_name: customerName,
        amount,
        notes: notes || null,
      });

    if (paymentError) {
      setSaving(false);
      alert(paymentError.message);
      return;
    }

    const { error: customerError } = await supabase
      .from("customers")
      .update({
        balance_owed: newBalance,
      })
      .eq("id", customerId);

    setSaving(false);

    if (customerError) {
      alert(customerError.message);
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleRecordPayment}
      disabled={saving || Number(currentBalance || 0) <= 0}
      className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-900 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-emerald-950"
    >
      {saving ? "Saving..." : "Record payment"}
    </button>
  );
}