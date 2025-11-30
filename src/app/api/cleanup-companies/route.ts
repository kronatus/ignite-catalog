import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper to check if a string looks like a UUID
function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
}

// Helper to check if a string is just an ID (all numbers or very short)
function isID(str: string): boolean {
  return /^\d+$/.test(str.trim()) || str.trim().length < 3;
}

export async function POST() {
  try {
    // Get all companies
    const companies = await prisma.company.findMany();
    let deletedCount = 0;
    let updatedSpeakers = 0;

    // Delete companies that are UUIDs or IDs
    for (const company of companies) {
      if (isUUID(company.name) || isID(company.name)) {
        // Delete the company and its relationships
        await prisma.speakerCompany.deleteMany({
          where: { companyId: company.id },
        });
        await prisma.company.delete({
          where: { id: company.id },
        });
        deletedCount++;
      }
    }

    // Clean up speaker.company field
    const speakers = await prisma.speaker.findMany({
      where: {
        company: {
          not: null,
        },
      },
    });

    for (const speaker of speakers) {
      if (speaker.company && (isUUID(speaker.company) || isID(speaker.company))) {
        await prisma.speaker.update({
          where: { id: speaker.id },
          data: { company: null },
        });
        updatedSpeakers++;
      }
    }

    return NextResponse.json({
      message: "Cleanup completed",
      deletedCompanies: deletedCount,
      updatedSpeakers,
    });
  } catch (err) {
    console.error("Cleanup error", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: "Failed to cleanup companies",
        message: errorMessage,
      },
      { status: 500 },
    );
  }
}

