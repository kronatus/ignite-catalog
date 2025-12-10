-- Drop the old unique constraint on sessionId
ALTER TABLE "Session" DROP CONSTRAINT "Session_sessionId_key";

-- Add eventSource column with default value
ALTER TABLE "Session" ADD COLUMN "eventSource" TEXT NOT NULL DEFAULT 'Ignite';

-- Create new composite unique constraint
ALTER TABLE "Session" ADD CONSTRAINT "Session_eventSource_sessionId_key" UNIQUE("eventSource", "sessionId");

-- Create an index for faster filtering by eventSource
CREATE INDEX "Session_eventSource_idx" ON "Session"("eventSource");
