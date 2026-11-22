import { requireUser } from "@/lib/auth/session";
import { getCompanyDocumentById } from "@/lib/documents/store";
import { listManagedExcursions } from "@/lib/data/managed-excursions";
import { createCompanyDocumentSignedUrl } from "@/lib/documents/upload";

export async function GET(request: Request) {
  await requireUser();

  const params = new URL(request.url).searchParams;
  const id = params.get("id")?.trim();
  const excursionId = params.get("excursionId")?.trim();
  if (!id && !excursionId) {
    return Response.json({ ok: false, error: "Missing document id" }, { status: 400 });
  }

  const document = id
    ? await getCompanyDocumentById(id)
    : (await listManagedExcursions()).find((item) => item.id === excursionId)?.descriptionDocument;
  if (!document) {
    return Response.json({ ok: false, error: "Document not found" }, { status: 404 });
  }

  const url = await createCompanyDocumentSignedUrl(document.filePath);
  if (!url) {
    return Response.json({ ok: false, error: "Could not open document" }, { status: 500 });
  }

  return new Response(null, {
    status: 302,
    headers: { Location: new URL(url, request.url).href, "Cache-Control": "private, no-store" },
  });
}
