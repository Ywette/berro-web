import { Suspense } from "react";
import type { Metadata } from "next";
import { DocumentsBoard } from "@/components/staff/documents-board";

export const instant = false;

export const metadata: Metadata = {
  title: "Documents",
};

export default function StaffDocumentsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-mist">…</p>}>
      <DocumentsBoard />
    </Suspense>
  );
}
