import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categorizeTopic } from "@/lib/topicCategorization";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const hasOnDemand = searchParams.get("hasOnDemand");
    const topic = searchParams.get("topic");
    const tag = searchParams.get("tag");
    const level = searchParams.get("level");
    const audienceType = searchParams.get("audienceType");
    const industry = searchParams.get("industry");
    const deliveryType = searchParams.get("deliveryType");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Search in title, description, aiDescription, speakers, companies, tags, and topics
    // SQLite doesn't support case-insensitive mode, so we use contains
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { aiDescription: { contains: search } },
        // Search in speakers
        {
          sessionSpeakers: {
            some: {
              speaker: {
                OR: [
                  { name: { contains: search } },
                  { company: { contains: search } },
                  {
                    speakerCompanies: {
                      some: {
                        company: {
                          name: { contains: search },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        // Search in tags
        {
          sessionTags: {
            some: {
              tag: {
                OR: [
                  { displayValue: { contains: search } },
                  { logicalValue: { contains: search } },
                ],
              },
            },
          },
        },
        // Search in topics
        {
          sessionTopics: {
            some: {
              topic: {
                OR: [
                  { displayValue: { contains: search } },
                  { logicalValue: { contains: search } },
                ],
              },
            },
          },
        },
      ];
    }

    // Filter by hasOnDemand (prioritize recorded)
    if (hasOnDemand === "true") {
      where.hasOnDemand = true;
    } else if (hasOnDemand === "false") {
      where.hasOnDemand = false;
    }

    // Filter by topic (handles both individual topics and categorized topics)
    if (topic) {
      // Check if this is a category logical value
      const allTopics = await prisma.topic.findMany();
      const categoryTopics = allTopics
        .filter((t) => {
          const category = categorizeTopic(t.logicalValue, t.displayValue);
          return category.logicalValue === topic;
        })
        .map((t) => t.logicalValue);

      if (categoryTopics.length > 0) {
        // It's a category - filter by all topics in that category
        where.sessionTopics = {
          some: {
            topic: {
              logicalValue: {
                in: categoryTopics,
              },
            },
          },
        };
      } else {
        // It's an individual topic - filter by that topic
        where.sessionTopics = {
          some: {
            topic: {
              logicalValue: topic,
            },
          },
        };
      }
    }

    // Filter by tag
    if (tag) {
      where.sessionTags = {
        some: {
          tag: {
            logicalValue: tag,
          },
        },
      };
    }

    // Filter by level
    if (level) {
      where.sessionLevels = {
        some: {
          level: {
            logicalValue: level,
          },
        },
      };
    }

    // Filter by audience type
    if (audienceType) {
      where.sessionAudienceTypes = {
        some: {
          audienceType: {
            logicalValue: audienceType,
          },
        },
      };
    }

    // Filter by industry
    if (industry) {
      where.sessionIndustries = {
        some: {
          industry: {
            logicalValue: industry,
          },
        },
      };
    }

    // Filter by delivery type
    if (deliveryType) {
      where.sessionDeliveryTypes = {
        some: {
          deliveryType: {
            logicalValue: deliveryType,
          },
        },
      };
    }

    // Get total count
    const total = await prisma.session.count({ where });

    // Fetch sessions with relations
    // Priority: hasOnDemand=true first, then by startDateTime
    const sessions = await prisma.session.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { hasOnDemand: "desc" }, // Recorded sessions first
        { startDateTime: "desc" }, // Then by date
      ],
      include: {
        sessionTopics: {
          include: {
            topic: true,
          },
        },
        sessionTags: {
          include: {
            tag: true,
          },
        },
        sessionLevels: {
          include: {
            level: true,
          },
        },
        sessionAudienceTypes: {
          include: {
            audienceType: true,
          },
        },
        sessionIndustries: {
          include: {
            industry: true,
          },
        },
        sessionDeliveryTypes: {
          include: {
            deliveryType: true,
          },
        },
        sessionViewingOpts: {
          include: {
            viewingOption: true,
          },
        },
        sessionSpeakers: {
          include: {
            speaker: {
              include: {
                speakerCompanies: {
                  include: {
                    company: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      sessions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Sessions query error", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: "Failed to fetch sessions",
        message: errorMessage,
      },
      { status: 500 },
    );
  }
}

