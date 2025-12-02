import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  console.log("=== VOTE API CALLED ===");
  let body: any = {};
  
  try {
    body = await request.json();
    console.log("Vote request received:", { 
      sessionId: body.sessionId, 
      value: body.value, 
      userIdentifier: body.userIdentifier ? `${body.userIdentifier.substring(0, 10)}...` : "missing",
      hasSessionId: !!body.sessionId,
      hasValue: body.value !== undefined,
      hasUserIdentifier: !!body.userIdentifier
    });
    const { sessionId, value, userIdentifier } = body;

    // Validate inputs
    if (!sessionId || typeof sessionId !== "number") {
      return NextResponse.json(
        { error: "Invalid sessionId" },
        { status: 400 }
      );
    }

    if (value !== 1 && value !== -1) {
      return NextResponse.json(
        { error: "Value must be 1 (upvote) or -1 (downvote)" },
        { status: 400 }
      );
    }

    if (!userIdentifier || typeof userIdentifier !== "string") {
      return NextResponse.json(
        { error: "Invalid userIdentifier" },
        { status: 400 }
      );
    }

    // Verify session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // Check if user already voted on this session
    let existingVote;
    try {
      existingVote = await prisma.vote.findFirst({
        where: {
          sessionId,
          userIdentifier,
        },
      });
    } catch (err) {
      console.error("Error finding existing vote:", err);
      throw err;
    }

    let vote;
    let action = "created";

    try {
      if (existingVote) {
        if (existingVote.value === value) {
          // User clicked the same button - remove the vote
          await prisma.vote.delete({
            where: {
              id: existingVote.id,
            },
          });
          action = "deleted";
          vote = null;
        } else {
          // User clicked different button - update the vote
          vote = await prisma.vote.update({
            where: {
              id: existingVote.id,
            },
            data: {
              value,
            },
          });
          action = "updated";
        }
      } else {
        // No existing vote - create new one
        vote = await prisma.vote.create({
          data: {
            sessionId,
            value,
            userIdentifier,
          },
        });
        action = "created";
      }
    } catch (dbErr) {
      console.error("Database operation error:", dbErr);
      throw dbErr;
    }

    // Get updated vote counts
    let voteStats;
    try {
      voteStats = await prisma.vote.groupBy({
        by: ["value"],
        where: { sessionId },
        _count: true,
      });
    } catch (err) {
      console.error("Error getting vote stats:", err);
      throw err;
    }

    const upvotes = voteStats.find((v) => v.value === 1)?._count || 0;
    const downvotes = voteStats.find((v) => v.value === -1)?._count || 0;
    const netVotes = upvotes - downvotes;

    // Determine user's current vote
    let currentUserVote = null;
    if (action !== "deleted") {
      try {
        const userVoteRecord = await prisma.vote.findFirst({
          where: {
            sessionId,
            userIdentifier,
          },
        });
        currentUserVote = userVoteRecord?.value || null;
      } catch (err) {
        console.error("Error finding user vote:", err);
        // Don't throw - we can continue without this
      }
    }

    return NextResponse.json({
      success: true,
      action,
      vote,
      userVote: currentUserVote,
      voteCounts: {
        upvotes,
        downvotes,
        netVotes,
      },
    });
  } catch (err) {
    console.error("=== VOTE ERROR START ===");
    console.error("Error object:", err);
    console.error("Error type:", typeof err);
    console.error("Is Error instance:", err instanceof Error);
    
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : undefined;
    const errorName = err instanceof Error ? err.name : "UnknownError";
    
    console.error("Error details:", {
      name: errorName,
      message: errorMessage,
      stack: errorStack,
      body,
      errorString: String(err),
    });
    console.error("=== VOTE ERROR END ===");
    
    // Always return a simple, safe JSON response
    const errorResponse = {
      error: "Failed to create vote",
      message: errorMessage || "An unknown error occurred",
      errorName: errorName,
    };
    
    if (process.env.NODE_ENV === "development" && errorStack) {
      (errorResponse as any).details = errorStack;
    }
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

