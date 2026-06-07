"use client";

import { Button } from "@/components/ui/button";

export function SharePrintButton() {
  return (
    <Button type="button" onClick={() => window.print()}>
      Print invoice
    </Button>
  );
}
