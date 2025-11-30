-- CreateTable
CREATE TABLE "Speaker" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "speakerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT
);

-- CreateTable
CREATE TABLE "Company" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SpeakerCompany" (
    "speakerId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,

    PRIMARY KEY ("speakerId", "companyId"),
    CONSTRAINT "SpeakerCompany_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "Speaker" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SpeakerCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessionSpeaker" (
    "sessionId" INTEGER NOT NULL,
    "speakerId" INTEGER NOT NULL,

    PRIMARY KEY ("sessionId", "speakerId"),
    CONSTRAINT "SessionSpeaker_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionSpeaker_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "Speaker" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Speaker_speakerId_key" ON "Speaker"("speakerId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

