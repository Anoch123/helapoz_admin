"use client";

import { useState } from "react";

import { useRecordPayment } from "@/hooks/useRecordPayment";

type RecordPaymentFormProps = {
  invoiceId: string;
  outstandingBalance: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function RecordPaymentForm({
  invoiceId,
  outstandingBalance,
}: RecordPaymentFormProps) {
  const { recordPayment, isPending, error } = useRecordPayment();

  const [amount, setAmount] = useState(String(outstandingBalance));
  const [transactionReference, setTransactionReference] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(false);

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    if (parsedAmount > outstandingBalance) {
      return;
    }

    if (!paymentDate) {
      return;
    }

    const completed = await recordPayment({
      invoiceId,
      amount: parsedAmount,
      transactionReference: transactionReference.trim(),
      paymentDate,
      notes: notes.trim() || undefined,
    });

    if (completed) {
      setSuccess(true);
      setTransactionReference("");
      setNotes("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="payment-amount" className="text-sm font-medium">
          Payment amount (LKR)
        </label>

        <input
          id="payment-amount"
          type="number"
          min="0.01"
          max={outstandingBalance}
          step="0.01"
          required
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />

        <p className="text-xs text-muted-foreground">
          Outstanding: {formatCurrency(outstandingBalance)}
        </p>
      </div>

      <div className="space-y-1">
        <label
          htmlFor="transaction-reference"
          className="text-sm font-medium"
        >
          Bank transaction reference
        </label>

        <input
          id="transaction-reference"
          type="text"
          minLength={3}
          maxLength={150}
          required
          value={transactionReference}
          onChange={(event) => setTransactionReference(event.target.value)}
          placeholder="Enter the bank transfer reference"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="payment-date" className="text-sm font-medium">
          Payment date
        </label>

        <input
          id="payment-date"
          type="date"
          required
          value={paymentDate}
          onChange={(event) => setPaymentDate(event.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="payment-notes" className="text-sm font-medium">
          Notes (optional)
        </label>

        <textarea
          id="payment-notes"
          rows={3}
          maxLength={500}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Additional payment details"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-green-600">
          Payment recorded. It is now pending confirmation.
        </p>
      )}

      <button
        type="submit"
        disabled={
          isPending ||
          !amount ||
          Number(amount) <= 0 ||
          Number(amount) > outstandingBalance ||
          !paymentDate ||
          transactionReference.trim().length < 3
        }
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Recording payment..." : "Record payment"}
      </button>
    </form>
  );
}