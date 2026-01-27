import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "MLB Note - Topps NOW・WBC・MLB情報まとめ";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #1565c0 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 100,
            marginBottom: 20,
          }}
        >
          ⚾
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: "bold",
            color: "white",
            marginBottom: 20,
          }}
        >
          MLB Note
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#e3f2fd",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          Topps NOW・WBC・MLB情報まとめ
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
