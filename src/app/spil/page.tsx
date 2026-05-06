import { Suspense } from "react";
import SpilClient from "./SpilClient";

export const dynamic = "force-dynamic";

export default function SpilPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b0e14]" />}>
      <SpilClient />
    </Suspense>
  );
}
