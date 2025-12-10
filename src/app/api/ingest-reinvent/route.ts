import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as fs from "fs";
import * as path from "path";

type ReInventSession = {
  id: string;
  shortId?: string;
  title: string;
  abstract?: string;
  startDateTime?: string;
  endDateTime?: string;
  startTime?: string;
  endTime?: string;
  speakers?: Array<{
    id?: string;
    displayName?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    company?: string;
  }>;
  venueRoomName?: string;
  venue?: { id?: string; displayName?: string };
  day?: string;
  type?: { id?: string; displayName?: string };
  level?: { id?: string; displayValue?: string; displayName?: string; value?: number };
  services?: Array<{ id?: string; displayName?: string }>;
  topics?: Array<{ id?: string; displayValue?: string; displayName?: string }>;
  areaOfInterest?: Array<{ id?: string; displayValue?: string; displayName?: string }>;
  industry?: Array<{ id?: string; displayValue?: string; displayName?: string }>;
  segment?: { id?: string; displayValue?: string; displayName?: string };
  role?: Array<{ id?: string; displayValue?: string; displayName?: string }>;
};

export async function GET() {
  return NextResponse.json(
    {
      message: "Use POST method to ingest Re:Invent sessions",
      example: "curl -X POST http://localhost:3000/api/ingest-reinvent",
    },
    { status: 405 },
  );
}

export async function POST() {
  try {
    // Read reinvent.json from project root (try common casings)
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
      return NextResponse.json(
        { error: "reinvent.json not found in project root (tried reinvent.json/Reinvent.json)" },
        { status: 400 },
      );
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileContent);
    const raw = (data.catalog || data) as ReInventSession[];

    if (!Array.isArray(raw)) {
      return NextResponse.json(
        { error: "Invalid reinvent.json format: expected array or object with 'catalog' array" },
        { status: 400 },
      );
    }

    let created = 0;
    let updated = 0;

    for (const s of raw) {
      if (!s.id || !s.title) continue;

      // Compute hasOnDemand (Re:Invent sessions may not have on-demand URLs in catalog)
      const hasOnDemand = false; // Default to false for Re:Invent sessions

      const sessionRecord = await prisma.session.upsert({
        where: { eventSource_sessionId: { eventSource: "ReInvent", sessionId: s.id } },
        create: {
          sessionId: s.id,
          eventSource: "ReInvent",
          sessionInstanceId: s.shortId ?? null,
          title: s.title,
          description: s.abstract ?? null,
          location: s.venueRoomName ?? null,
          timeSlot: s.day ?? null,
          startDateTime: s.startDateTime ? new Date(s.startDateTime) : null,
          endDateTime: s.endDateTime ? new Date(s.endDateTime) : null,
          sessionTypeDisplay: s.type?.displayName ?? null,
          sessionTypeLogical: s.type?.displayName ?? null,
          hasOnDemand,
          isPopular: false,
          heroSession: false,
        },
        update: {
          title: s.title,
          description: s.abstract ?? null,
          location: s.venueRoomName ?? null,
          timeSlot: s.day ?? null,
          startDateTime: s.startDateTime ? new Date(s.startDateTime) : null,
          endDateTime: s.endDateTime ? new Date(s.endDateTime) : null,
          sessionTypeDisplay: s.type?.displayName ?? null,
          sessionTypeLogical: s.type?.displayName ?? null,
          hasOnDemand,
        },
      });

      // Topics / Services (Re:Invent uses both "topics" and "services" fields)
      const topicList = [
        ...(s.topics || []),
        ...(s.services || []),
      ];

      for (const t of topicList) {
        // t may have either `displayName` or `displayValue` depending on source
        const display = 'displayName' in t ? (t.displayName || '') : ('displayValue' in t ? (t.displayValue || '') : '');
        if (!display) continue;
        const logical = display; // Use display value as logical for Re:Invent

        const topic = await prisma.topic.upsert({
          where: { logicalValue: logical },
          create: {
            logicalValue: logical,
            displayValue: display,
          },
          update: {
            displayValue: display,
          },
        });

        await prisma.sessionTopic.upsert({
          where: {
            sessionId_topicId: {
              sessionId: sessionRecord.id,
              topicId: topic.id,
            },
          },
          create: {
            sessionId: sessionRecord.id,
            topicId: topic.id,
          },
          update: {},
        });
      }

      // Area of Interest as Tags
      if (s.areaOfInterest && Array.isArray(s.areaOfInterest)) {
        for (const a of s.areaOfInterest) {
          const display = 'displayName' in a ? (a.displayName || '') : ('displayValue' in a ? (a.displayValue || '') : '');
          if (!display) continue;
          const logical = display;

          const tag = await prisma.tag.upsert({
            where: { logicalValue: logical },
            create: {
              logicalValue: logical,
              displayValue: display,
            },
            update: {
              displayValue: display,
            },
          });

          await prisma.sessionTag.upsert({
            where: {
              sessionId_tagId: {
                sessionId: sessionRecord.id,
                tagId: tag.id,
              },
            },
            create: {
              sessionId: sessionRecord.id,
              tagId: tag.id,
            },
            update: {},
          });
        }
      }

      // Level
      if (s.level && s.level.displayName) {
        const levelDisplay = s.level.displayName;
        const levelLogical = levelDisplay;

        const level = await prisma.level.upsert({
          where: { logicalValue: levelLogical },
          create: {
            logicalValue: levelLogical,
            displayValue: levelDisplay,
          },
          update: {
            displayValue: levelDisplay,
          },
        });

        await prisma.sessionLevelOnSession.upsert({
          where: {
            sessionId_levelId: {
              sessionId: sessionRecord.id,
              levelId: level.id,
            },
          },
          create: {
            sessionId: sessionRecord.id,
            levelId: level.id,
          },
          update: {},
        });
      }

      // Role as Audience Type
      if (s.role && Array.isArray(s.role)) {
        for (const r of s.role) {
          const display = 'displayName' in r ? (r.displayName || '') : ('displayValue' in r ? (r.displayValue || '') : '');
          if (!display) continue;
          const logical = display;

          const audience = await prisma.audienceType.upsert({
            where: { logicalValue: logical },
            create: {
              logicalValue: logical,
              displayValue: display,
            },
            update: {
              displayValue: display,
            },
          });

          await prisma.sessionAudienceTypeOnSession.upsert({
            where: {
              sessionId_audienceTypeId: {
                sessionId: sessionRecord.id,
                audienceTypeId: audience.id,
              },
            },
            create: {
              sessionId: sessionRecord.id,
              audienceTypeId: audience.id,
            },
            update: {},
          });
        }
      }

      // Industry
      if (s.industry && Array.isArray(s.industry)) {
        for (const i of s.industry) {
          const display = 'displayName' in i ? (i.displayName || '') : ('displayValue' in i ? (i.displayValue || '') : '');
          if (!display) continue;
          const logical = display;

          const industry = await prisma.industry.upsert({
            where: { logicalValue: logical },
            create: {
              logicalValue: logical,
              displayValue: display,
            },
            update: {
              displayValue: display,
            },
          });

          await prisma.sessionIndustryOnSession.upsert({
            where: {
              sessionId_industryId: {
                sessionId: sessionRecord.id,
                industryId: industry.id,
              },
            },
            create: {
              sessionId: sessionRecord.id,
              industryId: industry.id,
            },
            update: {},
          });
        }
      }

      // Segment as a DeliveryType (or skip if not needed)
      if (s.segment && s.segment.displayName) {
        const segmentDisplay = s.segment.displayName;
        const segmentLogical = segmentDisplay;

        const delivery = await prisma.deliveryType.upsert({
          where: { logicalValue: segmentLogical },
          create: {
            logicalValue: segmentLogical,
            displayValue: segmentDisplay,
          },
          update: {
            displayValue: segmentDisplay,
          },
        });

        await prisma.sessionDeliveryTypeOnSession.upsert({
          where: {
            sessionId_deliveryTypeId: {
              sessionId: sessionRecord.id,
              deliveryTypeId: delivery.id,
            },
          },
          create: {
            sessionId: sessionRecord.id,
            deliveryTypeId: delivery.id,
          },
          update: {},
        });
      }

      // Speakers
      if (s.speakers && Array.isArray(s.speakers)) {
        for (const spk of s.speakers) {
          if (!spk.id || !spk.displayName) continue;

          const speakerName = spk.displayName;
          const speakerId = spk.id;
          const companyName = spk.company ?? null;

          const speaker = await prisma.speaker.upsert({
            where: { speakerId },
            create: {
              speakerId,
              name: speakerName,
              company: companyName,
            },
            update: {
              name: speakerName,
              company: companyName,
            },
          });

          // Link speaker to session
          await prisma.sessionSpeaker.upsert({
            where: {
              sessionId_speakerId: {
                sessionId: sessionRecord.id,
                speakerId: speaker.id,
              },
            },
            create: {
              sessionId: sessionRecord.id,
              speakerId: speaker.id,
            },
            update: {},
          });

          // Handle company if provided
          if (companyName) {
            const company = await prisma.company.upsert({
              where: { name: companyName },
              create: { name: companyName },
              update: {},
            });

            await prisma.speakerCompany.upsert({
              where: {
                speakerId_companyId: {
                  speakerId: speaker.id,
                  companyId: company.id,
                },
              },
              create: {
                speakerId: speaker.id,
                companyId: company.id,
              },
              update: {},
            });
          }
        }
      }

      // Track creates/updates
      const existing = await prisma.session.findUnique({
        where: {
          id: sessionRecord.id,
        },
      });
      if (existing) {
        updated += 1;
      } else {
        created += 1;
      }
    }

    return NextResponse.json({
      total: raw.length,
      created,
      updated,
      source: "ReInvent",
    });
  } catch (err) {
    console.error("Re:Invent ingestion error", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : undefined;
    return NextResponse.json(
      {
        error: "Unexpected error during Re:Invent ingestion",
        message: errorMessage,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
      },
      { status: 500 },
    );
  }
}
