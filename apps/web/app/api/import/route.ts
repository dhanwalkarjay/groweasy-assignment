import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  console.log(">>> [Next.js Route Proxy] Incoming request. Forwarding to:", `${apiBaseUrl}/api/import`);

  try {
    const contentType = request.headers.get("content-type") || "";
    const body = await request.blob();

    const response = await fetch(`${apiBaseUrl}/api/import`, {
      method: "POST",
      headers: {
        "content-type": contentType,
      },
      body: body,
    });

    console.log(">>> [Next.js Route Proxy] Backend responded with status:", response.status);
    const text = await response.text();
    return new Response(text, {
      status: response.status,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error(">>> [Next.js Route Proxy] Failed to proxy request:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Proxy failed unexpectedly"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}
