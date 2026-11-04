"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useCreateAdditionalUserSeatInvoice } from "@/hooks/useCreateAdditionalUserSeatInvoice";

const schema = z.object({
  quantity: z.coerce.number().int().min(1).max(100),
  notes: z.string().max(500),
});

interface PurchaseAdditionalSeatsFormProps {
  shopId: string;
}

export function PurchaseAdditionalSeatsForm({
  shopId,
}: PurchaseAdditionalSeatsFormProps) {
  const router = useRouter();

  const { createInvoice, isLoading } =
    useCreateAdditionalUserSeatInvoice(shopId);

  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const unitPrice = 1000;
  const total = (Number(quantity) || 0) * unitPrice;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const validation = schema.safeParse({
      quantity,
      notes,
    });

    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Invalid input.");
      return;
    }

    const invoice = await createInvoice(validation.data);

    if (invoice) {
      router.push(`/invoices/${invoice.invoiceId}`);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="quantity">Number of additional seats</Label>

        <Input
          id="quantity"
          type="number"
          min={1}
          max={100}
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          required
        />

        <p className="text-sm text-muted-foreground">
          Each additional Shop User seat costs Rs. 1,000 (one-time).
        </p>
      </div>

      <div className="rounded-lg border p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Quantity</span>
          <span>{Number(quantity) || 0} seats</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Price per seat</span>
          <span>Rs. 1,000</span>
        </div>

        <div className="flex justify-between border-t pt-3 font-semibold">
          <span>Total</span>
          <span>Rs. {total.toLocaleString("en-LK")}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>

        <Textarea
          id="notes"
          placeholder="Add any relevant notes..."
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          maxLength={500}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Creating invoice..." : "Create Seat Purchase Invoice"}
      </Button>
    </form>
  );
}