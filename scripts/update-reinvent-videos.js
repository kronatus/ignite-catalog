/**
 * Local script to update Re:Invent sessions with YouTube URLs
 * Run with: node scripts/update-reinvent-videos.js
 */
const { PrismaClient } = require("../src/generated/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function updateVideos() {
  try {
    // Read Reinvent.json
    const candidates = ["reinvent.json", "Reinvent.json", "ReInvent.json"];
    let filePath = null;
    for (const c of candidates) {
      const p = path.join(process.cwd(), c);
      if (fs.existsSync(p)) {
        filePath = p;
        break;
      }
    }

    if (!filePath) {
      console.error("Reinvent.json not found");
      process.exit(1);
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(fileContent);
    const raw = data.catalog || data;

    let updated = 0;

    for (const session of raw) {
      if (!session.id) continue;

      if (session.youtubeUrl) {
        await prisma.session.updateMany({
          where: {
            eventSource_sessionId: {
              eventSource: "ReInvent",
              sessionId: session.id,
            },
          },
          data: {
            onDemandUrl: session.youtubeUrl,
            hasOnDemand: true,
          },
        });
        updated++;
      }
    }

    console.log(`Updated ${updated} Re:Invent sessions with YouTube URLs`);
  } catch (err) {
    console.error("Error updating videos:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateVideos();
