import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const API_URL =
  "https://api-v2.ignite.microsoft.com/api/session/all/en-US";

type IgniteOption = {
  displayValue?: string;
  logicalValue?: string;
};

type IgniteSpeakerType = {
  SpeakerType?: string;
  SpeakerId?: string;
  RegistrantKey?: string;
};

type IgniteSession = {
  sessionId: string;
  sessionInstanceId?: string | null;
  localizedId?: string | null;
  sessionCode?: string | null;
  langLocale?: string | null;
  title: string;
  sortTitle?: string | null;
  description?: string | null;
  aiDescription?: string | null;
  location?: string | null;
  TimeSlot?: string | null;
  startDateTime?: string | null;
  endDateTime?: string | null;
  durationInMinutes?: number | null;
  sessionType?: IgniteOption | null;
  reportingTopic?: string | null;
  onDemand?: string | null;
  downloadVideoLink?: string | null;
  captionFileLink?: string | null;
  onDemandThumbnail?: string | null;
  registrationLink?: string | null;
  hasOnDemand?: boolean | null;
  isPopular?: boolean | null;
  heroSession?: boolean | null;
  topic?: IgniteOption[] | null;
  tags?: IgniteOption[] | null;
  sessionLevel?: IgniteOption[] | null;
  audienceTypes?: IgniteOption[] | null;
  industry?: IgniteOption[] | null;
  deliveryTypes?: IgniteOption[] | null;
  viewingOptions?: IgniteOption[] | null;
  speakerNames?: string | null;
  speakerIds?: string[] | null;
  SpeakerTypes?: IgniteSpeakerType[] | null;
  associatedCompanies?: string[] | null;
};

function normalizeOptions(list: IgniteOption[] | null | undefined) {
  if (!Array.isArray(list)) return [];
  return list
    .map((o) => {
      const logical = o.logicalValue || o.displayValue;
      const display = o.displayValue || logical;
      if (!logical || !display) return null;
      return { logical, display };
    })
    .filter((x): x is { logical: string; display: string } => !!x);
}

function computeHasOnDemand(session: IgniteSession): boolean {
  if (session.hasOnDemand) return true;
  if (session.onDemand || session.downloadVideoLink) return true;
  if (Array.isArray(session.viewingOptions)) {
    if (
      session.viewingOptions.some(
        (v) =>
          v.logicalValue === "Recorded" || v.displayValue === "Recorded",
      )
    ) {
      return true;
    }
  }
  return false;
}

export async function GET() {
  return NextResponse.json(
    {
      message: "Use POST method to ingest Ignite sessions",
      example: "curl -X POST http://localhost:3000/api/ingest",
    },
    { status: 405 },
  );
}

export async function POST() {
  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Ignite sessions" },
        { status: 502 },
      );
    }

    const raw = (await res.json()) as IgniteSession[];

    let created = 0;
    let updated = 0;

    for (const s of raw) {
      if (!s.sessionId || !s.title) continue;

      const hasOnDemand = computeHasOnDemand(s);

      const sessionRecord = await prisma.session.upsert({
        where: { eventSource_sessionId: { eventSource: "Ignite", sessionId: s.sessionId } },
        create: {
          sessionId: s.sessionId,
          eventSource: "Ignite",
          sessionInstanceId: s.sessionInstanceId ?? null,
          localizedId: s.localizedId ?? null,
          sessionCode: s.sessionCode ?? null,
          langLocale: s.langLocale ?? null,
          title: s.title,
          sortTitle: s.sortTitle ?? null,
          description: s.description ?? null,
          aiDescription: s.aiDescription ?? null,
          location: s.location ?? null,
          timeSlot: s.TimeSlot ?? null,
          startDateTime: s.startDateTime
            ? new Date(s.startDateTime)
            : null,
          endDateTime: s.endDateTime ? new Date(s.endDateTime) : null,
          durationInMinutes: s.durationInMinutes ?? null,
          sessionTypeDisplay: s.sessionType?.displayValue ?? null,
          sessionTypeLogical: s.sessionType?.logicalValue ?? null,
          reportingTopic: s.reportingTopic ?? null,
          onDemandUrl: s.onDemand ?? null,
          downloadVideoUrl: s.downloadVideoLink ?? null,
          captionFileUrl: s.captionFileLink ?? null,
          thumbnailUrl: s.onDemandThumbnail ?? null,
          registrationLink: s.registrationLink ?? null,
          hasOnDemand,
          isPopular: !!s.isPopular,
          heroSession: !!s.heroSession,
        },
        update: {
          sessionInstanceId: s.sessionInstanceId ?? null,
          localizedId: s.localizedId ?? null,
          sessionCode: s.sessionCode ?? null,
          langLocale: s.langLocale ?? null,
          title: s.title,
          sortTitle: s.sortTitle ?? null,
          description: s.description ?? null,
          aiDescription: s.aiDescription ?? null,
          location: s.location ?? null,
          timeSlot: s.TimeSlot ?? null,
          startDateTime: s.startDateTime
            ? new Date(s.startDateTime)
            : null,
          endDateTime: s.endDateTime ? new Date(s.endDateTime) : null,
          durationInMinutes: s.durationInMinutes ?? null,
          sessionTypeDisplay: s.sessionType?.displayValue ?? null,
          sessionTypeLogical: s.sessionType?.logicalValue ?? null,
          reportingTopic: s.reportingTopic ?? null,
          onDemandUrl: s.onDemand ?? null,
          downloadVideoUrl: s.downloadVideoLink ?? null,
          captionFileUrl: s.captionFileLink ?? null,
          thumbnailUrl: s.onDemandThumbnail ?? null,
          registrationLink: s.registrationLink ?? null,
          hasOnDemand,
          isPopular: !!s.isPopular,
          heroSession: !!s.heroSession,
        },
      });

      // Check if session existed before by trying to find it first
      const existing = await prisma.session.findUnique({
        where: { eventSource_sessionId: { eventSource: "Ignite", sessionId: s.sessionId } },
      });
      if (existing) {
        updated += 1;
      } else {
        created += 1;
      }

      // Topics
      for (const t of normalizeOptions(s.topic)) {
        const topic = await prisma.topic.upsert({
          where: { logicalValue: t.logical },
          create: {
            logicalValue: t.logical,
            displayValue: t.display,
          },
          update: {
            displayValue: t.display,
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

      // Tags
      for (const t of normalizeOptions(s.tags)) {
        const tag = await prisma.tag.upsert({
          where: { logicalValue: t.logical },
          create: {
            logicalValue: t.logical,
            displayValue: t.display,
          },
          update: {
            displayValue: t.display,
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

      // Levels
      for (const l of normalizeOptions(s.sessionLevel)) {
        const level = await prisma.level.upsert({
          where: { logicalValue: l.logical },
          create: {
            logicalValue: l.logical,
            displayValue: l.display,
          },
          update: {
            displayValue: l.display,
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

      // Audience types
      for (const a of normalizeOptions(s.audienceTypes)) {
        const audience = await prisma.audienceType.upsert({
          where: { logicalValue: a.logical },
          create: {
            logicalValue: a.logical,
            displayValue: a.display,
          },
          update: {
            displayValue: a.display,
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

      // Industries
      for (const i of normalizeOptions(s.industry)) {
        const industry = await prisma.industry.upsert({
          where: { logicalValue: i.logical },
          create: {
            logicalValue: i.logical,
            displayValue: i.display,
          },
          update: {
            displayValue: i.display,
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

      // Delivery types
      for (const d of normalizeOptions(s.deliveryTypes)) {
        const delivery = await prisma.deliveryType.upsert({
          where: { logicalValue: d.logical },
          create: {
            logicalValue: d.logical,
            displayValue: d.display,
          },
          update: {
            displayValue: d.display,
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

      // Viewing options
      for (const v of normalizeOptions(s.viewingOptions)) {
        const viewing = await prisma.viewingOption.upsert({
          where: { logicalValue: v.logical },
          create: {
            logicalValue: v.logical,
            displayValue: v.display,
          },
          update: {
            displayValue: v.display,
          },
        });

        await prisma.sessionViewingOptionOnSession.upsert({
          where: {
            sessionId_viewingOptionId: {
              sessionId: sessionRecord.id,
              viewingOptionId: viewing.id,
            },
          },
          create: {
            sessionId: sessionRecord.id,
            viewingOptionId: viewing.id,
          },
          update: {},
        });
      }

      // Speakers
      if (s.speakerNames && s.speakerIds && Array.isArray(s.speakerIds)) {
        const speakerNamesList = s.speakerNames.split(",").map((n) => n.trim());
        
        // Match speaker names with IDs (assuming order matches)
        for (let i = 0; i < Math.min(speakerNamesList.length, s.speakerIds.length); i++) {
          const speakerName = speakerNamesList[i];
          const speakerId = s.speakerIds[i];
          
          if (!speakerName || !speakerId) continue;

          // Extract company from speaker name if it contains " - " (e.g., "John Doe - Microsoft")
          const nameParts = speakerName.split(" - ");
          const cleanName = nameParts[0].trim();
          let companyName = nameParts.length > 1 ? nameParts[1].trim() : null;
          
          // Skip if company name looks like a UUID
          if (companyName) {
            const looksLikeUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(companyName);
            if (looksLikeUUID || /^\d+$/.test(companyName) || companyName.length < 3) {
              companyName = null;
            }
          }

          const speaker = await prisma.speaker.upsert({
            where: { speakerId },
            create: {
              speakerId,
              name: cleanName,
              company: companyName,
            },
            update: {
              name: cleanName,
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

          // Handle associated companies if provided
          // Skip UUIDs - only store readable company names
          if (s.associatedCompanies && Array.isArray(s.associatedCompanies)) {
            for (const companyNameFromArray of s.associatedCompanies) {
              if (!companyNameFromArray) continue;
              
              // Skip if it looks like a UUID (contains hyphens and is long)
              // UUIDs typically look like: "123e4567-e89b-12d3-a456-426614174000"
              const looksLikeUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(companyNameFromArray.trim());
              if (looksLikeUUID) continue;
              
              // Skip if it's just an ID (all numbers or very short)
              if (/^\d+$/.test(companyNameFromArray.trim()) || companyNameFromArray.trim().length < 3) continue;
              
              const company = await prisma.company.upsert({
                where: { name: companyNameFromArray },
                create: { name: companyNameFromArray },
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

          // Also add company from speaker name if extracted
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
    }

    return NextResponse.json({
      total: raw.length,
      created,
      updated,
    });
  } catch (err) {
    console.error("Ingestion error", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : undefined;
    return NextResponse.json(
      {
        error: "Unexpected error during ingestion",
        message: errorMessage,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
      },
      { status: 500 },
    );
  }
}


