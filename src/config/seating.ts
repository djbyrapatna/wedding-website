// Colors used to distinguish guest-list sides in the seating chart.
export const SIDE_COLOR: Record<string, string> = {
  Sager: "#7F9DB5", // dusty blue
  Hicks: "#D4B85C", // calm yellow
  Mutual: "#C8D8E4", // soft blue
};
export function sideColor(side: string | null): string {
  return (side && SIDE_COLOR[side]) || "#B9B2A8"; // warm gray fallback
}
