"use client";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-900">
      <h2 className="text-lg font-bold">This section could not load.</h2>
      <p className="mt-2 text-sm">{error.message || "Please retry. If the issue remains, check the database connection and server logs."}</p>
      <Button className="mt-4" variant="outline" onClick={reset}>
        Retry
      </Button>
    </div>
  );
}
