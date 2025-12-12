/**
 * Level categorization utility
 * Standardizes levels to "Name (Number)" format for both conferences
 */

export interface LevelCategory {
  logicalValue: string;
  displayValue: string;
}

/**
 * Maps a level's logical or display value to a standardized category
 */
export function categorizeLevel(
  logicalValue: string,
  displayValue: string,
): LevelCategory {
  const lowerLogical = logicalValue.toLowerCase();
  const lowerDisplay = displayValue.toLowerCase();

  // Beginner / 100 level
  if (
    lowerLogical.includes("beginner") ||
    lowerDisplay.includes("beginner") ||
    lowerLogical.includes("100") ||
    lowerDisplay.includes("100") ||
    lowerLogical.includes("intro") ||
    lowerDisplay.includes("intro") ||
    lowerLogical.includes("basic") ||
    lowerDisplay.includes("basic") ||
    lowerLogical.includes("fundamental") ||
    lowerDisplay.includes("fundamental")
  ) {
    return {
      logicalValue: "beginner-100",
      displayValue: "Beginner (100)",
    };
  }

  // Intermediate / 200 level
  if (
    lowerLogical.includes("intermediate") ||
    lowerDisplay.includes("intermediate") ||
    lowerLogical.includes("200") ||
    lowerDisplay.includes("200") ||
    lowerLogical.includes("general") ||
    lowerDisplay.includes("general")
  ) {
    return {
      logicalValue: "intermediate-200",
      displayValue: "Intermediate (200)",
    };
  }

  // Advanced / 300 level
  if (
    lowerLogical.includes("advanced") ||
    lowerDisplay.includes("advanced") ||
    lowerLogical.includes("300") ||
    lowerDisplay.includes("300") ||
    lowerLogical.includes("deep") ||
    lowerDisplay.includes("deep")
  ) {
    return {
      logicalValue: "advanced-300",
      displayValue: "Advanced (300)",
    };
  }

  // Expert / 400 level
  if (
    lowerLogical.includes("expert") ||
    lowerDisplay.includes("expert") ||
    lowerLogical.includes("400") ||
    lowerDisplay.includes("400") ||
    lowerLogical.includes("deep dive") ||
    lowerDisplay.includes("deep dive") ||
    lowerLogical.includes("technical") ||
    lowerDisplay.includes("technical")
  ) {
    return {
      logicalValue: "expert-400",
      displayValue: "Expert (400)",
    };
  }

  // If it's already in the desired format (Name (Number)), keep it
  const formatMatch = displayValue.match(/^(.+)\s*\((\d+)\)$/);
  if (formatMatch) {
    const name = formatMatch[1].trim();
    const number = formatMatch[2];
    return {
      logicalValue: `${name.toLowerCase().replace(/\s+/g, '-')}-${number}`,
      displayValue: `${name} (${number})`,
    };
  }

  // Default to General if we can't categorize
  return {
    logicalValue: "general-200",
    displayValue: "General (200)",
  };
}

/**
 * Get all available level categories in order
 */
export function getAllLevelCategories(): LevelCategory[] {
  return [
    { logicalValue: "beginner-100", displayValue: "Beginner (100)" },
    { logicalValue: "intermediate-200", displayValue: "Intermediate (200)" },
    { logicalValue: "advanced-300", displayValue: "Advanced (300)" },
    { logicalValue: "expert-400", displayValue: "Expert (400)" },
  ];
}