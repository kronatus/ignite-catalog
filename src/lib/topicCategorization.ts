/**
 * Topic categorization utility
 * Maps individual topics to main categories (max 15)
 */

export interface TopicCategory {
  logicalValue: string;
  displayValue: string;
}

/**
 * Maps a topic's logical or display value to a main category
 */
export function categorizeTopic(
  logicalValue: string,
  displayValue: string,
): TopicCategory {
  const lowerLogical = logicalValue.toLowerCase();
  const lowerDisplay = displayValue.toLowerCase();

  // Cloud & Infrastructure
  if (
    lowerLogical.includes("cloud") ||
    lowerDisplay.includes("cloud") ||
    lowerLogical.includes("azure") ||
    lowerDisplay.includes("azure") ||
    lowerLogical.includes("infrastructure") ||
    lowerDisplay.includes("infrastructure") ||
    lowerLogical.includes("iaas") ||
    lowerDisplay.includes("iaas") ||
    lowerLogical.includes("paas") ||
    lowerDisplay.includes("paas")
  ) {
    return {
      logicalValue: "cloud-infrastructure",
      displayValue: "Cloud & Infrastructure",
    };
  }

  // Security & Compliance
  if (
    lowerLogical.includes("security") ||
    lowerDisplay.includes("security") ||
    lowerLogical.includes("compliance") ||
    lowerDisplay.includes("compliance") ||
    lowerLogical.includes("identity") ||
    lowerDisplay.includes("identity") ||
    lowerLogical.includes("authentication") ||
    lowerDisplay.includes("authentication") ||
    lowerLogical.includes("authorization") ||
    lowerDisplay.includes("authorization") ||
    lowerLogical.includes("defender") ||
    lowerDisplay.includes("defender") ||
    lowerLogical.includes("entra") ||
    lowerDisplay.includes("entra")
  ) {
    return {
      logicalValue: "security-compliance",
      displayValue: "Security & Compliance",
    };
  }

  // AI & Machine Learning
  if (
    lowerLogical.includes("ai") ||
    lowerDisplay.includes("ai") ||
    lowerLogical.includes("artificial intelligence") ||
    lowerDisplay.includes("artificial intelligence") ||
    lowerLogical.includes("machine learning") ||
    lowerDisplay.includes("machine learning") ||
    lowerLogical.includes("ml") ||
    lowerDisplay.includes("ml") ||
    lowerLogical.includes("copilot") ||
    lowerDisplay.includes("copilot") ||
    lowerLogical.includes("openai") ||
    lowerDisplay.includes("openai") ||
    lowerLogical.includes("cognitive") ||
    lowerDisplay.includes("cognitive")
  ) {
    return {
      logicalValue: "ai-machine-learning",
      displayValue: "AI & Machine Learning",
    };
  }

  // Data & Analytics
  if (
    lowerLogical.includes("data") ||
    lowerDisplay.includes("data") ||
    lowerLogical.includes("analytics") ||
    lowerDisplay.includes("analytics") ||
    lowerLogical.includes("database") ||
    lowerDisplay.includes("database") ||
    lowerLogical.includes("sql") ||
    lowerDisplay.includes("sql") ||
    lowerLogical.includes("data warehouse") ||
    lowerDisplay.includes("data warehouse") ||
    lowerLogical.includes("data lake") ||
    lowerDisplay.includes("data lake") ||
    lowerLogical.includes("power bi") ||
    lowerDisplay.includes("power bi") ||
    lowerLogical.includes("fabric") ||
    lowerDisplay.includes("fabric")
  ) {
    return {
      logicalValue: "data-analytics",
      displayValue: "Data & Analytics",
    };
  }

  // Developer Tools & DevOps
  if (
    lowerLogical.includes("developer") ||
    lowerDisplay.includes("developer") ||
    lowerLogical.includes("devops") ||
    lowerDisplay.includes("devops") ||
    lowerLogical.includes("github") ||
    lowerDisplay.includes("github") ||
    lowerLogical.includes("visual studio") ||
    lowerDisplay.includes("visual studio") ||
    lowerLogical.includes("code") ||
    (lowerDisplay.includes("code") && !lowerDisplay.includes("low code")) ||
    lowerLogical.includes("kubernetes") ||
    lowerDisplay.includes("kubernetes") ||
    lowerLogical.includes("container") ||
    lowerDisplay.includes("container") ||
    lowerLogical.includes("docker") ||
    lowerDisplay.includes("docker")
  ) {
    return {
      logicalValue: "developer-devops",
      displayValue: "Developer Tools & DevOps",
    };
  }

  // Microsoft 365 & Productivity
  if (
    lowerLogical.includes("microsoft 365") ||
    lowerDisplay.includes("microsoft 365") ||
    lowerLogical.includes("office 365") ||
    lowerDisplay.includes("office 365") ||
    lowerLogical.includes("teams") ||
    lowerDisplay.includes("teams") ||
    lowerLogical.includes("sharepoint") ||
    lowerDisplay.includes("sharepoint") ||
    lowerLogical.includes("outlook") ||
    lowerDisplay.includes("outlook") ||
    lowerLogical.includes("excel") ||
    lowerDisplay.includes("excel") ||
    lowerLogical.includes("word") ||
    lowerDisplay.includes("word") ||
    lowerLogical.includes("powerpoint") ||
    lowerDisplay.includes("powerpoint") ||
    lowerLogical.includes("productivity") ||
    lowerDisplay.includes("productivity")
  ) {
    return {
      logicalValue: "m365-productivity",
      displayValue: "Microsoft 365 & Productivity",
    };
  }

  // Power Platform & Low-Code
  if (
    lowerLogical.includes("power platform") ||
    lowerDisplay.includes("power platform") ||
    lowerLogical.includes("power apps") ||
    lowerDisplay.includes("power apps") ||
    lowerLogical.includes("power automate") ||
    lowerDisplay.includes("power automate") ||
    lowerLogical.includes("power pages") ||
    lowerDisplay.includes("power pages") ||
    lowerLogical.includes("low code") ||
    lowerDisplay.includes("low code") ||
    lowerLogical.includes("no code") ||
    lowerDisplay.includes("no code")
  ) {
    return {
      logicalValue: "power-platform",
      displayValue: "Power Platform & Low-Code",
    };
  }

  // Windows & Endpoint Management
  if (
    lowerLogical.includes("windows") ||
    lowerDisplay.includes("windows") ||
    lowerLogical.includes("endpoint") ||
    lowerDisplay.includes("endpoint") ||
    lowerLogical.includes("intune") ||
    lowerDisplay.includes("intune") ||
    lowerLogical.includes("device management") ||
    lowerDisplay.includes("device management") ||
    lowerLogical.includes("autopilot") ||
    lowerDisplay.includes("autopilot")
  ) {
    return {
      logicalValue: "windows-endpoint",
      displayValue: "Windows & Endpoint Management",
    };
  }

  // Business Applications & Dynamics
  if (
    lowerLogical.includes("dynamics") ||
    lowerDisplay.includes("dynamics") ||
    lowerLogical.includes("crm") ||
    lowerDisplay.includes("crm") ||
    lowerLogical.includes("erp") ||
    lowerDisplay.includes("erp") ||
    lowerLogical.includes("business application") ||
    lowerDisplay.includes("business application") ||
    lowerLogical.includes("sales") ||
    (lowerDisplay.includes("sales") && !lowerDisplay.includes("retail")) ||
    lowerLogical.includes("customer service") ||
    lowerDisplay.includes("customer service")
  ) {
    return {
      logicalValue: "business-applications",
      displayValue: "Business Applications & Dynamics",
    };
  }

  // Networking & Connectivity
  if (
    lowerLogical.includes("networking") ||
    lowerDisplay.includes("networking") ||
    lowerLogical.includes("network") ||
    lowerDisplay.includes("network") ||
    lowerLogical.includes("connectivity") ||
    lowerDisplay.includes("connectivity") ||
    lowerLogical.includes("vpn") ||
    lowerDisplay.includes("vpn") ||
    lowerLogical.includes("sd-wan") ||
    lowerDisplay.includes("sd-wan")
  ) {
    return {
      logicalValue: "networking-connectivity",
      displayValue: "Networking & Connectivity",
    };
  }

  // Hybrid & Multi-Cloud
  if (
    lowerLogical.includes("hybrid") ||
    lowerDisplay.includes("hybrid") ||
    lowerLogical.includes("multi-cloud") ||
    lowerDisplay.includes("multi-cloud") ||
    lowerLogical.includes("arc") ||
    lowerDisplay.includes("arc") ||
    (lowerDisplay.includes("arc") && !lowerDisplay.includes("arc-enabled"))
  ) {
    return {
      logicalValue: "hybrid-multicloud",
      displayValue: "Hybrid & Multi-Cloud",
    };
  }

  // Industry Solutions
  if (
    lowerLogical.includes("healthcare") ||
    lowerDisplay.includes("healthcare") ||
    lowerLogical.includes("retail") ||
    lowerDisplay.includes("retail") ||
    lowerLogical.includes("manufacturing") ||
    lowerDisplay.includes("manufacturing") ||
    lowerLogical.includes("financial") ||
    lowerDisplay.includes("financial") ||
    lowerLogical.includes("education") ||
    lowerDisplay.includes("education") ||
    lowerLogical.includes("government") ||
    lowerDisplay.includes("government") ||
    lowerLogical.includes("nonprofit") ||
    lowerDisplay.includes("nonprofit")
  ) {
    return {
      logicalValue: "industry-solutions",
      displayValue: "Industry Solutions",
    };
  }

  // Modern Work & Collaboration
  if (
    lowerLogical.includes("collaboration") ||
    lowerDisplay.includes("collaboration") ||
    lowerLogical.includes("remote work") ||
    lowerDisplay.includes("remote work") ||
    lowerLogical.includes("hybrid work") ||
    lowerDisplay.includes("hybrid work") ||
    lowerLogical.includes("viva") ||
    lowerDisplay.includes("viva") ||
    lowerLogical.includes("workplace") ||
    lowerDisplay.includes("workplace")
  ) {
    return {
      logicalValue: "modern-work",
      displayValue: "Modern Work & Collaboration",
    };
  }

  // Governance & Management
  if (
    lowerLogical.includes("governance") ||
    lowerDisplay.includes("governance") ||
    lowerLogical.includes("management") ||
    lowerDisplay.includes("management") ||
    lowerLogical.includes("administration") ||
    lowerDisplay.includes("administration") ||
    lowerLogical.includes("cost management") ||
    lowerDisplay.includes("cost management")
  ) {
    return {
      logicalValue: "governance-management",
      displayValue: "Governance & Management",
    };
  }

  // Other / General
  return {
    logicalValue: "other",
    displayValue: "Other",
  };
}

/**
 * Get all available topic categories
 */
export function getAllTopicCategories(): TopicCategory[] {
  return [
    { logicalValue: "cloud-infrastructure", displayValue: "Cloud & Infrastructure" },
    { logicalValue: "security-compliance", displayValue: "Security & Compliance" },
    { logicalValue: "ai-machine-learning", displayValue: "AI & Machine Learning" },
    { logicalValue: "data-analytics", displayValue: "Data & Analytics" },
    { logicalValue: "developer-devops", displayValue: "Developer Tools & DevOps" },
    { logicalValue: "m365-productivity", displayValue: "Microsoft 365 & Productivity" },
    { logicalValue: "power-platform", displayValue: "Power Platform & Low-Code" },
    { logicalValue: "windows-endpoint", displayValue: "Windows & Endpoint Management" },
    { logicalValue: "business-applications", displayValue: "Business Applications & Dynamics" },
    { logicalValue: "networking-connectivity", displayValue: "Networking & Connectivity" },
    { logicalValue: "hybrid-multicloud", displayValue: "Hybrid & Multi-Cloud" },
    { logicalValue: "industry-solutions", displayValue: "Industry Solutions" },
    { logicalValue: "modern-work", displayValue: "Modern Work & Collaboration" },
    { logicalValue: "governance-management", displayValue: "Governance & Management" },
    { logicalValue: "other", displayValue: "Other" },
  ];
}

