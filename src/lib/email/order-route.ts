import { formatRouteAddress } from "@/lib/orders/format-address";
import type { StaffOrder } from "@/types/dashboard";

export function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

export function orderEmailRoutePoints(order: StaffOrder) {
  return [order.origin, ...(order.stops ?? []).map((stop) => stop.name),
    order.destination, order.returnTo].filter((place): place is string => Boolean(place && place !== "—"))
    .map(formatRouteAddress);
}

export function orderEmailRouteTimeline(routePoints: string[]) {
  return routePoints.map((point, index) => {
    const last = index === routePoints.length - 1;
    const first = index === 0;
    const color = first ? "#8bcdae" : last ? "#922b48" : "#bd9c68";
    const marker = first
      ? '<span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:#8bcdae;color:#18382e;font-size:12px;line-height:22px;text-align:center">●</span>'
      : last
        ? '<span style="display:inline-block;width:22px;height:22px;border-radius:50%;background:#922b48;color:#ffffff;font-size:14px;line-height:22px;text-align:center">&#9873;</span>'
        : `<span style="color:${color};font-size:19px;line-height:24px">●</span>`;
    return `<tr><td width="30" align="center" valign="top" style="width:30px;padding:0;vertical-align:top">
      <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:30px"><tr>
        <td align="center" style="height:24px;line-height:24px">${marker}</td>
      </tr><tr><td align="center" style="height:${last ? "0" : "20"}px;line-height:0;font-size:0">
        ${last ? "" : '<div style="width:1px;height:20px;background:#c7b7a2;font-size:0;line-height:0">&nbsp;</div>'}
      </td></tr></table></td>
      <td valign="top" style="padding:3px 8px 16px 7px;color:#242124;font-size:14px;line-height:1.4;overflow-wrap:anywhere">${escapeHtml(point)}</td></tr>`;
  }).join("");
}
