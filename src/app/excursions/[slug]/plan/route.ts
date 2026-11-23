import { getManagedExcursionBySlug } from "@/lib/data/managed-excursions";
import { createCompanyDocumentSignedUrl } from "@/lib/documents/upload";

export async function GET(_request: Request, { params }: RouteContext<"/excursions/[slug]/plan">) {
  const { slug } = await params;
  const excursion = await getManagedExcursionBySlug(slug);
  const filePath = excursion?.descriptionDocument?.filePath;
  if (!filePath || filePath.startsWith("/")) {
    return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  const url = await createCompanyDocumentSignedUrl(filePath);
  if (!url) {
    return new Response(null, { status: 502, headers: { "Cache-Control": "no-store" } });
  }

  return new Response(null, {
    status: 302,
    headers: { Location: url, "Cache-Control": "no-store" },
  });
}
