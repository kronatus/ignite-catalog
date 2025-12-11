import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import * as fs from "fs";
import * as path from "path";

/**
 * Helper endpoint to update Re:Invent sessions with youtubeUrl data
 * This is a one-time fix to populate onDemandUrl and hasOnDemand for recorded sessions
 */

type ReInventSession = {
  id: string;
  youtubeUrl?: string;
};

export async function GET() {
  return NextResponse.json(
    { message: "Use POST method to update Re:Invent videos" },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  try {
    // Read reinvent.json
    const candidates = ["reinvent.json", "Reinvent.json", "ReInvent.json"];
    let filePath: string | null = null;
    for (const c of candidates) {
      const p = path.join(process.cwd(), c);
      if (fs.existsSync(p)) {
        filePath = p;
        break;
      }
    }

    if (!filePath) {
      return NextResponse.json({ error: "Reinvent.json not found" }, { status: 400 });
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileContent);
    const raw = (data.catalog || data) as ReInventSession[];

    let updated = 0;

    for (const session of raw) {
      if (!session.id) continue;

      if (session.youtubeUrl) {
        // Find the session first using the composite unique key
        const existingSession = await prisma.session.findUnique({
          where: {
            eventSource_sessionId: {
              eventSource: "ReInvent",
              sessionId: session.id,
            },
          },
        });

        // If found, update by id
        if (existingSession) {
          await prisma.session.update({
            where: { id: existingSession.id },
            data: {
              onDemandUrl: session.youtubeUrl,
              hasOnDemand: true,
            },
          });
          updated++;
        }
      }
    }

    return NextResponse.json({
      message: "Updated Re:Invent sessions with YouTube URLs",
      updated,
    });
  } catch (err) {
    console.error("Error updating sessions", err);
    return NextResponse.json(
      {
        error: "Failed to update sessions",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
