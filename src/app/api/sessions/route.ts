import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categorizeTopic } from "@/lib/topicCategorization";
import { categorizeSessionType } from "@/lib/sessionTypeCategorization";
import { categorizeLevel } from "@/lib/levelCategorization";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const eventSource = searchParams.get("eventSource") || ""; // Filter by event source
    const hasOnDemand = searchParams.get("hasOnDemand");
    const topic = searchParams.get("topic");
    const tag = searchParams.get("tag");
    const sessionType = searchParams.get("sessionType");
    const level = searchParams.get("level");
    const audienceType = searchParams.get("audienceType");
    const industry = searchParams.get("industry");
    const deliveryType = searchParams.get("deliveryType");
    const voteFilter = searchParams.get("voteFilter");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Add event source filter if provided
    if (eventSource) {
      where.eventSource = eventSource;
    }

    // Search in title, description, aiDescription, speakers, companies, tags, and topics
    // PostgreSQL supports case-insensitive search with mode: 'insensitive'
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { aiDescription: { contains: search, mode: 'insensitive' } },
        // Search in speakers
        {
          sessionSpeakers: {
            some: {
              speaker: {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { company: { contains: search, mode: 'insensitive' } },
                  {
                    speakerCompanies: {
                      some: {
                        company: {
                          name: { contains: search, mode: 'insensitive' },
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
                  { displayValue: { contains: search, mode: 'insensitive' } },
                  { logicalValue: { contains: search, mode: 'insensitive' } },
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
                  { displayValue: { contains: search, mode: 'insensitive' } },
                  { logicalValue: { contains: search, mode: 'insensitive' } },
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

    // Filter by session type (handles both individual session types and categorized session types)
    if (sessionType) {
      // Get all sessions with session types to find which ones match the category
      const allSessionsWithTypes = await prisma.session.findMany({
        select: {
          sessionTypeLogical: true,
          sessionTypeDisplay: true,
        },
        where: {
          OR: [
            { sessionTypeLogical: { not: null } },
            { sessionTypeDisplay: { not: null } }
          ]
        }
      });

      // Find all session type values that belong to this category
      const matchingSessionTypes = new Set<string>();
      for (const session of allSessionsWithTypes) {
        const logicalValue = session.sessionTypeLogical || session.sessionTypeDisplay || "";
        const displayValue = session.sessionTypeDisplay || session.sessionTypeLogical || "";
        
        if (logicalValue) {
          const category = categorizeSessionType(logicalValue, displayValue);
          if (category.logicalValue === sessionType) {
            matchingSessionTypes.add(logicalValue);
          }
        }
      }

      if (matchingSessionTypes.size > 0) {
        // It's a category - filter by all session types in that category
        const sessionTypeClause = {
          OR: [
            {
              sessionTypeLogical: {
                in: Array.from(matchingSessionTypes),
              },
            },
            {
              sessionTypeDisplay: {
                in: Array.from(matchingSessionTypes),
              },
            },
          ],
        };

        // If there's already an OR search clause, combine using AND so both conditions apply
        if (where.OR) {
          where.AND = [{ OR: where.OR }, sessionTypeClause];
          delete where.OR;
        } else if (where.AND) {
          where.AND = [...where.AND, sessionTypeClause];
        } else {
          where.AND = [sessionTypeClause];
        }
      } else {
        // It's an individual session type - filter by that session type
        const sessionTypeClause = {
          OR: [
            { sessionTypeLogical: sessionType },
            { sessionTypeDisplay: sessionType },
          ],
        };

        // If there's already an OR search clause, combine using AND so both conditions apply
        if (where.OR) {
          where.AND = [{ OR: where.OR }, sessionTypeClause];
          delete where.OR;
        } else if (where.AND) {
          where.AND = [...where.AND, sessionTypeClause];
        } else {
          where.AND = [sessionTypeClause];
        }
      }
    }

    // Filter by level (handles both individual levels and categorized levels)
    if (level) {
      // Get all levels to find which ones match the category
      const allLevels = await prisma.level.findMany({
        select: {
          logicalValue: true,
          displayValue: true,
        },
      });

      // Find all level values that belong to this category
      const matchingLevels = new Set<string>();
      for (const levelRecord of allLevels) {
        const category = categorizeLevel(levelRecord.logicalValue, levelRecord.displayValue);
        if (category.logicalValue === level) {
          matchingLevels.add(levelRecord.logicalValue);
        }
      }

      if (matchingLevels.size > 0) {
        // It's a category - filter by all levels in that category
        where.sessionLevels = {
          some: {
            level: {
              logicalValue: {
                in: Array.from(matchingLevels),
              },
            },
          },
        };
      } else {
        // It's an individual level - filter by that level
        where.sessionLevels = {
          some: {
            level: {
              logicalValue: level,
            },
          },
        };
      }
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

    // Get total count (before vote filtering)
    const totalBeforeVoteFilter = await prisma.session.count({ where });

    // If vote filtering is needed, we need to fetch all sessions first, calculate votes, filter, then paginate
    const shouldFilterByVotes = voteFilter && (voteFilter === "high" || voteFilter === "low" || voteFilter === "none");
    
    // Common include clause for relations
    const includeRelations = {
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
    };

    // Fetch sessions with relations
    // If filtering by votes, fetch all matching sessions first
    const sessionsToFetch = shouldFilterByVotes ? await prisma.session.findMany({
      where,
      orderBy: [
        { hasOnDemand: "desc" }, // Recorded sessions first
        { startDateTime: "desc" }, // Then by date
      ],
      include: includeRelations,
    }) : await prisma.session.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { hasOnDemand: "desc" }, // Recorded sessions first
        { startDateTime: "desc" }, // Then by date
      ],
      include: includeRelations,
    });

    // Get vote counts for each session
    const sessionIds = sessionsToFetch.map((s) => s.id);
    const voteStats = sessionIds.length > 0 ? await prisma.vote.groupBy({
      by: ["sessionId", "value"],
      where: {
        sessionId: { in: sessionIds },
      },
      _count: {
        _all: true, 
    }
    }) : [];

    // Calculate vote counts per session
    const voteCountsMap = new Map<
      number,
      { upvotes: number; downvotes: number; netVotes: number }
    >();

    for (const stat of voteStats) {
      if (!voteCountsMap.has(stat.sessionId)) {
        voteCountsMap.set(stat.sessionId, {
          upvotes: 0,
          downvotes: 0,
          netVotes: 0,
        });
      }
      const counts = voteCountsMap.get(stat.sessionId)!;
      if (stat.value === 1) {
        counts.upvotes = stat._count._all;
      } else if (stat.value === -1) {
        counts.downvotes = stat._count._all;
      }
      counts.netVotes = counts.upvotes - counts.downvotes;
    }

    // Add vote counts to sessions
    let sessionsWithVotes = sessionsToFetch.map((session) => {
      const voteCounts = voteCountsMap.get(session.id) || {
        upvotes: 0,
        downvotes: 0,
        netVotes: 0,
      };
      return {
        ...session,
        voteCounts,
      };
    });

    // Apply vote filter if specified
    if (shouldFilterByVotes) {
      if (voteFilter === "high") {
        sessionsWithVotes = sessionsWithVotes.filter((s) => s.voteCounts.netVotes > 0);
      } else if (voteFilter === "low") {
        sessionsWithVotes = sessionsWithVotes.filter((s) => s.voteCounts.netVotes < 0);
      } else if (voteFilter === "none") {
        sessionsWithVotes = sessionsWithVotes.filter((s) => s.voteCounts.netVotes === 0);
      }
      
      // Now paginate the filtered results
      const totalAfterVoteFilter = sessionsWithVotes.length;
      const paginatedSessions = sessionsWithVotes.slice(skip, skip + limit);
      
      return NextResponse.json({
        sessions: paginatedSessions,
        pagination: {
          page,
          limit,
          total: totalAfterVoteFilter,
          totalPages: Math.ceil(totalAfterVoteFilter / limit),
        },
      });
    }

    return NextResponse.json({
      sessions: sessionsWithVotes,
      pagination: {
        page,
        limit,
        total: totalBeforeVoteFilter,
        totalPages: Math.ceil(totalBeforeVoteFilter / limit),
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

