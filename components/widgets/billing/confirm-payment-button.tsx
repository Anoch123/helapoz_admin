"use client";

import { useState } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useConfirmPayment } from "@/hooks/useConfirmPayment";
import { useRejectPayment } from "@/hooks/useRejectPayment";

type Props = {
  paymentId: string;
};

export function ConfirmPaymentButton({ paymentId }: Props) {
  const {
    confirmPayment,
    pending: confirming,
    error: confirmError,
  } = useConfirmPayment();

  const {
    rejectPayment,
    pending: rejecting,
    error: rejectError,
  } = useRejectPayment();

  const [showRejectInput, setShowRejectInput] = useState(false);
  const [reason, setReason] = useState("");

  async function handleConfirm() {
    const accepted = window.confirm(
      "Have you verified this bank transfer in your bank account?",
    );

    if (accepted) {
      await confirmPayment(paymentId);
    }
  }

  async function handleReject() {
    if (!reason.trim()) return;

    const accepted = window.confirm(
      "Are you sure you want to reject this payment?",
    );

    if (accepted) {
      const success = await rejectPayment(paymentId, reason);
      if (success) setShowRejectInput(false);
    }
  }

  const pending = confirming || rejecting;
  const error = confirmError ?? rejectError;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          disabled={pending}
          onClick={handleConfirm}
        >
          {confirming ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 size-4" />
          )}
          Confirm payment
        </Button>

        <Button
          size="sm"
          variant="destructive"
          disabled={pending}
          onClick={() => setShowRejectInput((value) => !value)}
        >
          <XCircle className="mr-2 size-4" />
          Reject
        </Button>
      </div>

      {showRejectInput && (
        <div className="space-y-2">
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Explain why this payment is being rejected..."
            maxLength={500}
            rows={3}
            className="w-full rounded-md border bg-background p-3 text-sm"
          />

          <Button
            size="sm"
            variant="destructive"
            disabled={pending || reason.trim().length < 5}
            onClick={handleReject}
          >
            {rejecting && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Confirm rejection
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}