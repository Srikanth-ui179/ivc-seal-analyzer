import { NextResponse } from "next/server";
import { askResearchAssistant } from "@/lib/ai/assistant-service";
import type { AssistantContext } from "@/lib/ai/research-types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message;
    const context: AssistantContext | undefined = body?.context;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "A valid non-empty 'message' string is required." },
        { status: 400 }
      );
    }

    const trimmed = message.trim().slice(0, 500); // Guard against excessively long payloads
    const result = await askResearchAssistant(trimmed, context);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[API Error] /api/research/assistant:", error);
    return NextResponse.json(
      {
        error: "An error occurred while querying the research assistant.",
        details: process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}
