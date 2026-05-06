import { Suspense } from "react";
import RegisterClient from "./RegisterClient";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-50" />}>
      <RegisterClient />
    </Suspense>
  );
}
