-- CreateTable
CREATE TABLE "Session" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sessionId" TEXT NOT NULL,
    "sessionInstanceId" TEXT,
    "localizedId" TEXT,
    "sessionCode" TEXT,
    "langLocale" TEXT,
    "title" TEXT NOT NULL,
    "sortTitle" TEXT,
    "description" TEXT,
    "aiDescription" TEXT,
    "location" TEXT,
    "timeSlot" TEXT,
    "startDateTime" DATETIME,
    "endDateTime" DATETIME,
    "durationInMinutes" INTEGER,
    "sessionTypeDisplay" TEXT,
    "sessionTypeLogical" TEXT,
    "reportingTopic" TEXT,
    "onDemandUrl" TEXT,
    "downloadVideoUrl" TEXT,
    "captionFileUrl" TEXT,
    "thumbnailUrl" TEXT,
    "registrationLink" TEXT,
    "hasOnDemand" BOOLEAN NOT NULL DEFAULT false,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "heroSession" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "logicalValue" TEXT NOT NULL,
    "displayValue" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SessionTopic" (
    "sessionId" INTEGER NOT NULL,
    "topicId" INTEGER NOT NULL,

    PRIMARY KEY ("sessionId", "topicId"),
    CONSTRAINT "SessionTopic_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "logicalValue" TEXT NOT NULL,
    "displayValue" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SessionTag" (
    "sessionId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    PRIMARY KEY ("sessionId", "tagId"),
    CONSTRAINT "SessionTag_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Level" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "logicalValue" TEXT NOT NULL,
    "displayValue" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SessionLevelOnSession" (
    "sessionId" INTEGER NOT NULL,
    "levelId" INTEGER NOT NULL,

    PRIMARY KEY ("sessionId", "levelId"),
    CONSTRAINT "SessionLevelOnSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionLevelOnSession_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AudienceType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "logicalValue" TEXT NOT NULL,
    "displayValue" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SessionAudienceTypeOnSession" (
    "sessionId" INTEGER NOT NULL,
    "audienceTypeId" INTEGER NOT NULL,

    PRIMARY KEY ("sessionId", "audienceTypeId"),
    CONSTRAINT "SessionAudienceTypeOnSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionAudienceTypeOnSession_audienceTypeId_fkey" FOREIGN KEY ("audienceTypeId") REFERENCES "AudienceType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Industry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "logicalValue" TEXT NOT NULL,
    "displayValue" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SessionIndustryOnSession" (
    "sessionId" INTEGER NOT NULL,
    "industryId" INTEGER NOT NULL,

    PRIMARY KEY ("sessionId", "industryId"),
    CONSTRAINT "SessionIndustryOnSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionIndustryOnSession_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeliveryType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "logicalValue" TEXT NOT NULL,
    "displayValue" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SessionDeliveryTypeOnSession" (
    "sessionId" INTEGER NOT NULL,
    "deliveryTypeId" INTEGER NOT NULL,

    PRIMARY KEY ("sessionId", "deliveryTypeId"),
    CONSTRAINT "SessionDeliveryTypeOnSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionDeliveryTypeOnSession_deliveryTypeId_fkey" FOREIGN KEY ("deliveryTypeId") REFERENCES "DeliveryType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ViewingOption" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "logicalValue" TEXT NOT NULL,
    "displayValue" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SessionViewingOptionOnSession" (
    "sessionId" INTEGER NOT NULL,
    "viewingOptionId" INTEGER NOT NULL,

    PRIMARY KEY ("sessionId", "viewingOptionId"),
    CONSTRAINT "SessionViewingOptionOnSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionViewingOptionOnSession_viewingOptionId_fkey" FOREIGN KEY ("viewingOptionId") REFERENCES "ViewingOption" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Topic_logicalValue_key" ON "Topic"("logicalValue");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_logicalValue_key" ON "Tag"("logicalValue");

-- CreateIndex
CREATE UNIQUE INDEX "Level_logicalValue_key" ON "Level"("logicalValue");

-- CreateIndex
CREATE UNIQUE INDEX "AudienceType_logicalValue_key" ON "AudienceType"("logicalValue");

-- CreateIndex
CREATE UNIQUE INDEX "Industry_logicalValue_key" ON "Industry"("logicalValue");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryType_logicalValue_key" ON "DeliveryType"("logicalValue");

-- CreateIndex
CREATE UNIQUE INDEX "ViewingOption_logicalValue_key" ON "ViewingOption"("logicalValue");
