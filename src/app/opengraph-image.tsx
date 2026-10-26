import { PAGE_COPY } from "@/config/page-copy";
import { ImageResponse } from "next/og";
import { WEDDING } from "@/lib/constants";

// Auto-detected by Next.js — generates the og:image used in iMessage,
// Slack, Facebook, etc. when the root URL is shared. Typography-forward
// editorial card matching the site's aesthetic (no photo, so we don't
// have to fetch one inside the edge runtime).

// Must run on the Edge runtime — `ImageResponse` from next/og uses
// WASM internals that crash with "Invalid URL" under the default Node
// runtime during static prerender. This is what broke the last few
// Vercel builds.
export const runtime = "edge";

export const alt = `${WEDDING.coupleName} · ${WEDDING.dateDisplay}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage:
            "radial-gradient(circle at 50% 35%, #2C2C2C 0%, #161616 70%, #0A0A0A 100%)",
          color: "#FFFFFF",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "#FFFFFF",
            opacity: 0.85,
            marginBottom: 36,
            fontFamily: "sans-serif",
            fontWeight: 600,
          }}
        >{PAGE_COPY.app_opengraph_image.the_wedding_of}</div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            lineHeight: 1,
          }}
        >
          <div
            style={{
              fontSize: 132,
              color: "#D4B85C",
              fontWeight: 400,
              letterSpacing: "0.02em",
            }}
          >
            {WEDDING.brideFirstName}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 28,
              margin: "18px 0",
            }}
          >
            <div style={{ width: 80, height: 1, background: "#FFFFFF", opacity: 0.7 }} />
            <div style={{ fontSize: 56, fontStyle: "italic", color: "#FFFFFF" }}>{PAGE_COPY.app_opengraph_image.text}</div>
            <div style={{ width: 80, height: 1, background: "#FFFFFF", opacity: 0.7 }} />
          </div>

          <div
            style={{
              fontSize: 132,
              color: "#D4B85C",
              fontWeight: 400,
              letterSpacing: "0.02em",
            }}
          >
            {WEDDING.groomFirstName}
          </div>
        </div>

        <div
          style={{
            marginTop: 56,
            fontSize: 34,
            fontStyle: "italic",
            color: "#FFFFFF",
            opacity: 0.92,
          }}
        >
          {WEDDING.dateDisplay}{PAGE_COPY.app_opengraph_image.text_1}{WEDDING.location}
        </div>
      </div>
    ),
    size,
  );
}
