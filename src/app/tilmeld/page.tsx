import { Suspense } from "react";
import TilmeldClient from "./TilmeldClient";

export const dynamic = "force-dynamic";

export default function TilmeldPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <TilmeldClient />
    </Suspense>
  );
}
