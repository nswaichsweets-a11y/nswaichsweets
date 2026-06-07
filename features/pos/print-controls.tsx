"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export function PrintControls() {
  useEffect(() => {
    const timer = window.setTimeout(() => window.print(), 500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="no-print flex flex-wrap gap-2">
      <Button type="button" onClick={() => window.print()}>
        Print receipt
      </Button>
      <Button type="button" variant="outline" onClick={() => window.close()}>
        Close
      </Button>
    </div>
  );
}
