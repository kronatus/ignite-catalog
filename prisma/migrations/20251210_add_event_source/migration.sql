-- Drop the old unique constraint on sessionId if it exists
ALTER TABLE "Session" DROP CONSTRAINT IF EXISTS "Session_sessionId_key";

-- Add eventSource column with default value
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "eventSource" TEXT NOT NULL DEFAULT 'Ignite';

-- Drop the old unique constraint if it's being recreated (handles idempotency)
ALTER TABLE "Session" DROP CONSTRAINT IF EXISTS "Session_eventSource_sessionId_key";

-- Create new composite unique constraint
ALTER TABLE "Session" ADD CONSTRAINT "Session_eventSource_sessionId_key" UNIQUE("eventSource", "sessionId");

-- Create an index for faster filtering by eventSource if it doesn't exist
CREATE INDEX IF NOT EXISTS "Session_eventSource_idx" ON "Session"("eventSource");
