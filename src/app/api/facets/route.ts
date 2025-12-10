import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  categorizeTopic,
  getAllTopicCategories,
  type TopicCategory,
} from "@/lib/topicCategorization";

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

    // Session types: aggregate by logical/display values from sessions
    const sessionTypeGroups = await prisma.session.groupBy({
      by: ["sessionTypeLogical", "sessionTypeDisplay"],
      where: { ...where, sessionTypeLogical: { not: null } },
      _count: { _all: true },
    });

    const sessionTypes = sessionTypeGroups
      .map((g) => ({
        id: hashString(g.sessionTypeLogical || g.sessionTypeDisplay || ""),
        logicalValue: g.sessionTypeLogical || g.sessionTypeDisplay || "",
        displayValue: g.sessionTypeDisplay || g.sessionTypeLogical || "",
        count: g._count._all,
      }))
      .filter((s) => s.logicalValue);

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

