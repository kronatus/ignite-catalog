import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  categorizeTopic,
  getAllTopicCategories,
  type TopicCategory,
} from "@/lib/topicCategorization";
import {
  categorizeSessionType,
  getAllSessionTypeCategories,
  type SessionTypeCategory,
} from "@/lib/sessionTypeCategorization";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventSource = searchParams.get("eventSource") || ""; // Filter by event source if provided

    const where = eventSource ? { eventSource } : {};

    const [allTopics, tags, levels, audienceTypes, industries, deliveryTypes] =
      await Promise.all([
        prisma.topic.findMany({ orderBy: { displayValue: "asc" } }),
        prisma.tag.findMany({ orderBy: { displayValue: "asc" } }),
        prisma.level.findMany({ orderBy: { displayValue: "asc" } }),
        prisma.audienceType.findMany({ orderBy: { displayValue: "asc" } }),
        prisma.industry.findMany({ orderBy: { displayValue: "asc" } }),
        prisma.deliveryType.findMany({ orderBy: { displayValue: "asc" } }),
      ]);

    // Categorize topics and build a map of category -> topic logical values
    const categoryToTopics = new Map<string, string[]>();
    for (const topic of allTopics) {
      const category = categorizeTopic(
        topic.logicalValue,
        topic.displayValue,
      );
      if (!categoryToTopics.has(category.logicalValue)) {
        categoryToTopics.set(category.logicalValue, []);
      }
      categoryToTopics.get(category.logicalValue)!.push(topic.logicalValue);
    }

    // Get session counts for each category
    const categoryCounts = new Map<string, number>();
    const allCategories = getAllTopicCategories();

    for (const category of allCategories) {
      const topicLogicalValues = categoryToTopics.get(category.logicalValue) || [];
      
      if (topicLogicalValues.length === 0) {
        categoryCounts.set(category.logicalValue, 0);
        continue;
      }

      // Count unique sessions that have at least one topic in this category
      const count = await prisma.session.count({
        where: {
          ...where,
          sessionTopics: {
            some: {
              topic: {
                logicalValue: {
                  in: topicLogicalValues,
                },
              },
            },
          },
        },
      });

      categoryCounts.set(category.logicalValue, count);
    }

    // Build categorized topics array with counts, only including categories with sessions
    // Simple hash function for id
    const hashString = (str: string): number => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash);
    };

    const categorizedTopics = allCategories
      .map((category) => ({
        id: hashString(category.logicalValue),
        logicalValue: category.logicalValue,
        displayValue: category.displayValue,
        count: categoryCounts.get(category.logicalValue) || 0,
      }))
      .filter((cat) => cat.count > 0) // Only include categories with sessions
      .sort((a, b) => b.count - a.count); // Sort by count descending

    // Get counts for recorded vs non-recorded
    const [recordedCount, nonRecordedCount] = await Promise.all([
      prisma.session.count({ where: { ...where, hasOnDemand: true } }),
      prisma.session.count({ where: { ...where, hasOnDemand: false } }),
    ]);

    // Session types: get all sessions with session types and categorize them
    const allSessionsWithTypes = await prisma.session.findMany({
      where: {
        ...where,
        OR: [
          { sessionTypeLogical: { not: null } },
          { sessionTypeDisplay: { not: null } }
        ]
      },
      select: {
        sessionTypeLogical: true,
        sessionTypeDisplay: true,
      },
    });

    // Categorize session types and build a map of category -> session type logical values
    const categoryToSessionTypes = new Map<string, Set<string>>();
    for (const session of allSessionsWithTypes) {
      const logicalValue = session.sessionTypeLogical || session.sessionTypeDisplay || "";
      const displayValue = session.sessionTypeDisplay || session.sessionTypeLogical || "";
      
      if (logicalValue) {
        const category = categorizeSessionType(logicalValue, displayValue);
        if (!categoryToSessionTypes.has(category.logicalValue)) {
          categoryToSessionTypes.set(category.logicalValue, new Set());
        }
        categoryToSessionTypes.get(category.logicalValue)!.add(logicalValue);
      }
    }

    // Get session counts for each category
    const sessionTypeCategoryCounts = new Map<string, number>();
    const allSessionTypeCategories = getAllSessionTypeCategories();

    for (const category of allSessionTypeCategories) {
      const sessionTypeLogicalValues = Array.from(categoryToSessionTypes.get(category.logicalValue) || []);
      
      if (sessionTypeLogicalValues.length === 0) {
        sessionTypeCategoryCounts.set(category.logicalValue, 0);
        continue;
      }

      // Count unique sessions that have at least one session type in this category
      const count = await prisma.session.count({
        where: {
          ...where,
          OR: [
            {
              sessionTypeLogical: {
                in: sessionTypeLogicalValues,
              },
            },
            {
              sessionTypeDisplay: {
                in: sessionTypeLogicalValues,
              },
            },
          ],
        },
      });

      sessionTypeCategoryCounts.set(category.logicalValue, count);
    }

    // Build categorized session types array with counts, only including categories with sessions
    const sessionTypes = allSessionTypeCategories
      .map((category) => ({
        id: hashString(category.logicalValue),
        logicalValue: category.logicalValue,
        displayValue: category.displayValue,
        count: sessionTypeCategoryCounts.get(category.logicalValue) || 0,
      }))
      .filter((cat) => cat.count > 0) // Only include categories with sessions
      .sort((a, b) => b.count - a.count); // Sort by count descending

    return NextResponse.json({
      topics: categorizedTopics,
      tags,
      levels,
      audienceTypes,
      industries,
      deliveryTypes,
      sessionTypes,
      recordedCount,
      nonRecordedCount,
      eventSources: ["Ignite", "ReInvent"], // Available event sources
    });
  } catch (err) {
    console.error("Facets query error", err);
    return NextResponse.json(
      { error: "Failed to fetch facets" },
      { status: 500 },
    );
  }
}

