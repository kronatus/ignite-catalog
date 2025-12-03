-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
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
    "startDateTime" TIMESTAMP(3),
    "endDateTime" TIMESTAMP(3),
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
    "heroSession" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" SERIAL NOT NULL,
    "logicalValue" TEXT NOT NULL,
    "displayValue" TEXT NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionTopic" (
    "sessionId" INTEGER NOT NULL,
    "topicId" INTEGER NOT NULL,

    CONSTRAINT "SessionTopic_pkey" PRIMARY KEY ("sessionId","topicId")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "logicalValue" TEXT NOT NULL,
    "displayValue" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionTag" (
    "sessionId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "SessionTag_pkey" PRIMARY KEY ("sessionId","tagId")
);

-- CreateTable
CREATE TABLE "Level" (
    "id" SERIAL NOT NULL,
    "logicalValue" TEXT NOT NULL,
    "displayValue" TEXT NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionLevelOnSession" (
    "sessionId" INTEGER NOT NULL,
    "levelId" INTEGER NOT NULL,

    CONSTRAINT "SessionLevelOnSession_pkey" PRIMARY KEY ("sessionId","levelId")
);

-- CreateTable
CREATE TABLE "AudienceType" (
    "id" SERIAL NOT NULL,
    "logicalValue" TEXT NOT NULL,
    "displayValue" TEXT NOT NULL,

    CONSTRAINT "AudienceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionAudienceTypeOnSession" (
    "sessionId" INTEGER NOT NULL,
    "audienceTypeId" INTEGER NOT NULL,

    CONSTRAINT "SessionAudienceTypeOnSession_pkey" PRIMARY KEY ("sessionId","audienceTypeId")
);

-- CreateTable
CREATE TABLE "Industry" (
    "id" SERIAL NOT NULL,
    "logicalValue" TEXT NOT NULL,
    "displayValue" TEXT NOT NULL,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionIndustryOnSession" (
    "sessionId" INTEGER NOT NULL,
    "industryId" INTEGER NOT NULL,

    CONSTRAINT "SessionIndustryOnSession_pkey" PRIMARY KEY ("sessionId","industryId")
);

-- CreateTable
CREATE TABLE "DeliveryType" (
    "id" SERIAL NOT NULL,
    "logicalValue" TEXT NOT NULL,
    "displayValue" TEXT NOT NULL,

    CONSTRAINT "DeliveryType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionDeliveryTypeOnSession" (
    "sessionId" INTEGER NOT NULL,
    "deliveryTypeId" INTEGER NOT NULL,

    CONSTRAINT "SessionDeliveryTypeOnSession_pkey" PRIMARY KEY ("sessionId","deliveryTypeId")
);

-- CreateTable
CREATE TABLE "ViewingOption" (
    "id" SERIAL NOT NULL,
    "logicalValue" TEXT NOT NULL,
    "displayValue" TEXT NOT NULL,

    CONSTRAINT "ViewingOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionViewingOptionOnSession" (
    "sessionId" INTEGER NOT NULL,
    "viewingOptionId" INTEGER NOT NULL,

    CONSTRAINT "SessionViewingOptionOnSession_pkey" PRIMARY KEY ("sessionId","viewingOptionId")
);

-- CreateTable
CREATE TABLE "Speaker" (
    "id" SERIAL NOT NULL,
    "speakerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,

    CONSTRAINT "Speaker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakerCompany" (
    "speakerId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "SpeakerCompany_pkey" PRIMARY KEY ("speakerId","companyId")
);

-- CreateTable
CREATE TABLE "SessionSpeaker" (
    "sessionId" INTEGER NOT NULL,
    "speakerId" INTEGER NOT NULL,

    CONSTRAINT "SessionSpeaker_pkey" PRIMARY KEY ("sessionId","speakerId")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "userIdentifier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionId_key" ON "Session"("sessionId");

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

-- CreateIndex
CREATE UNIQUE INDEX "Speaker_speakerId_key" ON "Speaker"("speakerId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE INDEX "Vote_sessionId_idx" ON "Vote"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_sessionId_userIdentifier_key" ON "Vote"("sessionId", "userIdentifier");

-- AddForeignKey
ALTER TABLE "SessionTopic" ADD CONSTRAINT "SessionTopic_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionTopic" ADD CONSTRAINT "SessionTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionTag" ADD CONSTRAINT "SessionTag_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionTag" ADD CONSTRAINT "SessionTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionLevelOnSession" ADD CONSTRAINT "SessionLevelOnSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionLevelOnSession" ADD CONSTRAINT "SessionLevelOnSession_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionAudienceTypeOnSession" ADD CONSTRAINT "SessionAudienceTypeOnSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionAudienceTypeOnSession" ADD CONSTRAINT "SessionAudienceTypeOnSession_audienceTypeId_fkey" FOREIGN KEY ("audienceTypeId") REFERENCES "AudienceType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionIndustryOnSession" ADD CONSTRAINT "SessionIndustryOnSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionIndustryOnSession" ADD CONSTRAINT "SessionIndustryOnSession_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionDeliveryTypeOnSession" ADD CONSTRAINT "SessionDeliveryTypeOnSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionDeliveryTypeOnSession" ADD CONSTRAINT "SessionDeliveryTypeOnSession_deliveryTypeId_fkey" FOREIGN KEY ("deliveryTypeId") REFERENCES "DeliveryType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionViewingOptionOnSession" ADD CONSTRAINT "SessionViewingOptionOnSession_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionViewingOptionOnSession" ADD CONSTRAINT "SessionViewingOptionOnSession_viewingOptionId_fkey" FOREIGN KEY ("viewingOptionId") REFERENCES "ViewingOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakerCompany" ADD CONSTRAINT "SpeakerCompany_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "Speaker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakerCompany" ADD CONSTRAINT "SpeakerCompany_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionSpeaker" ADD CONSTRAINT "SessionSpeaker_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionSpeaker" ADD CONSTRAINT "SessionSpeaker_speakerId_fkey" FOREIGN KEY ("speakerId") REFERENCES "Speaker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
