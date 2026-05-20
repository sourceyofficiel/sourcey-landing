"use client";

import { useState } from "react";
import { ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RequestQuoteModal } from "./RequestQuoteModal";
import type { ProductDetail } from "@/lib/types/products";

export function RequestQuoteCTA({ product }: { product: ProductDetail }) {
  const [open, setOpen] = useState(false);
  const [initialType, setInitialType] = useState<"quote" | "sample">("quote");

  return (
    <>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={() => {
            setInitialType("quote");
            setOpen(true);
          }}
        >
          Demander un devis
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={() => {
            setInitialType("sample");
            setOpen(true);
          }}
        >
          <Package className="h-4 w-4" />
          Commander un sample
        </Button>
      </div>

      <RequestQuoteModal
        product={product}
        open={open}
        onClose={() => setOpen(false)}
        initialType={initialType}
      />
    </>
  );
}
