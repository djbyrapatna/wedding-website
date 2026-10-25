import type { Metadata } from "next";
import { WEDDING } from "./wedding";

export const siteMetadata: Metadata = {
  metadataBase: new URL(WEDDING.siteUrl),
  title: {
    default: `${WEDDING.coupleName} — ${WEDDING.dateDisplay}`,
    template: `%s | ${WEDDING.coupleName} Wedding`,
  },
  description: `Join us in celebrating the wedding of ${WEDDING.coupleName}. ${WEDDING.dateDisplay} in ${WEDDING.location}.`,
  openGraph: {
    title: `${WEDDING.coupleName} — We're Getting Married!`,
    description: `${WEDDING.dateDisplay} in ${WEDDING.location}.`,
    type: "website",
  },
};

export function pageMetadata(title: string, description: string): Metadata {
  return { title, description: `${description} — ${WEDDING.coupleName}, ${WEDDING.dateDisplay}.` };
}
