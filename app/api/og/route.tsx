import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export const GET = (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "Shelvitas";

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#14181c",
        color: "#ededed",
      }}
    >
      <div
        style={{
          fontSize: 60,
          fontWeight: 700,
          textAlign: "center",
          padding: "0 40px",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 24,
          marginTop: 20,
          color: "#89929b",
        }}
      >
        Track books you&apos;ve read. Discover what to read next.
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
};
