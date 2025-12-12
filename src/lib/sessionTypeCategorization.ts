/**
 * Session type categorization utility
 * Maps individual session types to main categories (max 10)
 */

export interface SessionTypeCategory {
  logicalValue: string;
  displayValue: string;
}

/**
 * Maps a session type's logical or display value to a main category
 */
export function categorizeSessionType(
  logicalValue: string,
  displayValue: string,
): SessionTypeCategory {
  const lowerLogical = logicalValue.toLowerCase();
  const lowerDisplay = displayValue.toLowerCase();

  // Presentations & Talks (Main content sessions)
  if (
    lowerLogical.includes("breakout") ||
    lowerDisplay.includes("breakout") ||
    lowerLogical.includes("chalk talk") ||
    lowerDisplay.includes("chalk talk") ||
    lowerLogical.includes("lightning talk") ||
    lowerDisplay.includes("lightning talk") ||
    lowerLogical.includes("innovation talk") ||
    lowerDisplay.includes("innovation talk") ||
    lowerLogical.includes("code talk") ||
    lowerDisplay.includes("code talk")
  ) {
    return {
      logicalValue: "presentations-talks",
      displayValue: "Presentations & Talks",
    };
  }

  // Hands-on Learning (Interactive sessions)
  if (
    lowerLogical.includes("workshop") ||
    lowerDisplay.includes("workshop") ||
    lowerLogical.includes("lab") ||
    lowerDisplay.includes("lab") ||
    lowerLogical.includes("builders") ||
    lowerDisplay.includes("builders") ||
    lowerLogical.includes("bootcamp") ||
    lowerDisplay.includes("bootcamp") ||
    lowerLogical.includes("interactive training") ||
    lowerDisplay.includes("interactive training")
  ) {
    return {
      logicalValue: "hands-on-learning",
      displayValue: "Hands-on Learning",
    };
  }

  // Self-paced & Training (Learning at your own pace)
  if (
    lowerLogical.includes("self-paced") ||
    lowerDisplay.includes("self-paced") ||
    lowerLogical.includes("pre-recorded") ||
    lowerDisplay.includes("pre-recorded") ||
    lowerLogical.includes("on-demand") ||
    lowerDisplay.includes("on-demand") ||
    lowerLogical.includes("gamified learning") ||
    lowerDisplay.includes("gamified learning") ||
    lowerLogical.includes("exam prep") ||
    lowerDisplay.includes("exam prep")
  ) {
    return {
      logicalValue: "self-paced-training",
      displayValue: "Self-paced & Training",
    };
  }

  // Keynotes & Featured (High-profile sessions)
  if (
    lowerLogical.includes("keynote") ||
    lowerDisplay.includes("keynote") ||
    lowerLogical.includes("featured") ||
    lowerDisplay.includes("featured")
  ) {
    return {
      logicalValue: "keynotes-featured",
      displayValue: "Keynotes & Featured",
    };
  }

  // Theater & Demos (Demonstration sessions)
  if (
    lowerLogical.includes("theater") ||
    lowerDisplay.includes("theater") ||
    lowerLogical.includes("expo") ||
    lowerDisplay.includes("expo")
  ) {
    return {
      logicalValue: "theater-demos",
      displayValue: "Theater & Demos",
    };
  }

  // Community & Networking (Social sessions)
  if (
    lowerLogical.includes("meetup") ||
    lowerDisplay.includes("meetup") ||
    lowerLogical.includes("community") ||
    lowerDisplay.includes("community") ||
    lowerLogical.includes("interview") ||
    lowerDisplay.includes("interview")
  ) {
    return {
      logicalValue: "community-networking",
      displayValue: "Community & Networking",
    };
  }

  // Event Services (Administrative/support sessions)
  if (
    lowerLogical.includes("event service") ||
    lowerDisplay.includes("event service")
  ) {
    return {
      logicalValue: "event-services",
      displayValue: "Event Services",
    };
  }

  // Other
  return {
    logicalValue: "other",
    displayValue: "Other",
  };
}

/**
 * Get all available session type categories
 */
export function getAllSessionTypeCategories(): SessionTypeCategory[] {
  return [
    { logicalValue: "presentations-talks", displayValue: "Presentations & Talks" },
    { logicalValue: "hands-on-learning", displayValue: "Hands-on Learning" },
    { logicalValue: "keynotes-featured", displayValue: "Keynotes & Featured" },
    { logicalValue: "theater-demos", displayValue: "Theater & Demos" },
    { logicalValue: "community-networking", displayValue: "Community & Networking" },
    { logicalValue: "self-paced-training", displayValue: "Self-paced & Training" },
    { logicalValue: "event-services", displayValue: "Event Services" },
    { logicalValue: "other", displayValue: "Other" },
  ];
}