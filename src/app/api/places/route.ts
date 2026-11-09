import type { NextRequest } from "next/server";
import { searchPlaces } from "@/lib/places/server";

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") ?? "").slice(0, 80);
  const locale = request.nextUrl.searchParams.get("locale") === "en" ? "en" : "lv";

  return Response.json({ suggestions: await searchPlaces(query, locale) });
}
