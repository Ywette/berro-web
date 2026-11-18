import { staffApiGuard } from "@/lib/auth/session";
import { getCompanyDocumentById } from "@/lib/documents/store";
import { createCompanyDocumentSignedUrl } from "@/lib/documents/upload";

export async function GET(request: Request) {
  const denied = await staffApiGuard();
  if (denied) return denied;

  const id = new URL(request.url).searchParams.get("id")?.trim() ?? "";
  if (!id) {
    return Response.json({ ok: false, error: "Missing document id" }, { status: 400 });
  }

  const document = await getCompanyDocumentById(id);
  if (!document) {
    return Response.json({ ok: false, error: "Document not found" }, { status: 404 });
  }

  const url = await createCompanyDocumentSignedUrl(document.filePath);
  if (!url) {
    return Response.json({ ok: false, error: "Could not open document" }, { status: 500 });
  }

  return Response.redirect(url, 302);
}
