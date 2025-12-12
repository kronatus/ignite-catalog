"use client";

import { useState, useEffect } from "react";

type Session = {
  id: number;
  sessionId: string;
  title: string;
  description: string | null;
  aiDescription: string | null;
  location: string | null;
  timeSlot: string | null;
  startDateTime: string | null;
  sessionTypeDisplay: string | null;
  reportingTopic: string | null;
  onDemandUrl: string | null;
  downloadVideoUrl: string | null;
  thumbnailUrl: string | null;
  hasOnDemand: boolean;
  isPopular: boolean;
  heroSession: boolean;
  sessionTopics: Array<{ topic: { displayValue: string; logicalValue: string } }>;
  sessionTags: Array<{ tag: { displayValue: string; logicalValue: string } }>;
  sessionLevels: Array<{ level: { displayValue: string; logicalValue: string } }>;
  sessionAudienceTypes: Array<{ audienceType: { displayValue: string; logicalValue: string } }>;
  sessionIndustries: Array<{ industry: { displayValue: string; logicalValue: string } }>;
  sessionDeliveryTypes: Array<{ deliveryType: { displayValue: string; logicalValue: string } }>;
  sessionSpeakers: Array<{
    speaker: {
      id: number;
      name: string;
      company: string | null;
      speakerCompanies: Array<{ company: { name: string } }>;
    };
  }>;
  voteCounts?: {
    upvotes: number;
    downvotes: number;
    netVotes: number;
  };
};

type Facets = {
  topics: Array<{ id: number; logicalValue: string; displayValue: string }>;
  tags: {
    popular: Array<{ id: number; logicalValue: string; displayValue: string; sessionCount: number }>;
    remaining: Array<{ id: number; logicalValue: string; displayValue: string; sessionCount: number }>;
    total: number;
  };
  levels: Array<{ id: number; logicalValue: string; displayValue: string }>;
  audienceTypes: Array<{ id: number; logicalValue: string; displayValue: string }>;
  industries: Array<{ id: number; logicalValue: string; displayValue: string }>;
  deliveryTypes: Array<{ id: number; logicalValue: string; displayValue: string }>;
  recordedCount: number;
  nonRecordedCount: number;
  sessionTypes?: Array<{ id: number; logicalValue: string; displayValue: string }>;
  eventSources?: string[]; // Available event sources (e.g., ["Ignite", "ReInvent"])
};

// Generate or retrieve user identifier from localStorage
const getUserIdentifier = (): string => {
  if (typeof window === "undefined") return "";
  let userId = localStorage.getItem("voteUserId");
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("voteUserId", userId);
  }
  return userId;
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userVotes, setUserVotes] = useState<Record<number, 1 | -1 | null>>({});
  const [filters, setFilters] = useState({
    eventSource: "",
    hasOnDemand: "",
    topic: "",
    tag: "",
    level: "",
    audienceType: "",
    industry: "",
    deliveryType: "",
    sessionType: "",
    voteFilter: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAllTags, setShowAllTags] = useState(false);

  // Theme configuration based on selected conference
  const getTheme = (eventSource: string) => {
    switch (eventSource) {
      case "Ignite":
        return {
          name: "Microsoft Ignite",
          primary: "#0078D4",
          primaryDark: "#005A9E",
          primaryLight: "#106EBE",
          accent: "#DEECF9",
          accentBorder: "#B3D9F2",
          background: "linear-gradient(135deg, #0078D4 0%, #005A9E 100%)",
          backgroundHover: "linear-gradient(135deg, #106EBE 0%, #0078D4 100%)",
        };
      case "ReInvent":
        return {
          name: "AWS Re:Invent",
          primary: "#FF9900",
          primaryDark: "#E88B00",
          primaryLight: "#FFB84D",
          accent: "#FFF4E5",
          accentBorder: "#FFD9A6",
          background: "linear-gradient(135deg, #FF9900 0%, #E88B00 100%)",
          backgroundHover: "linear-gradient(135deg, #FFB84D 0%, #FF9900 100%)",
        };
      default:
        return {
          name: "All Conferences",
          primary: "#6B46C1", // Amdocs purple
          primaryDark: "#553C9A",
          primaryLight: "#8B5CF6",
          accent: "#F3E8FF",
          accentBorder: "#C4B5FD",
          background: "linear-gradient(135deg, #6B46C1 0%, #553C9A 100%)",
          backgroundHover: "linear-gradient(135deg, #8B5CF6 0%, #6B46C1 100%)",
        };
    }
  };

  const currentTheme = getTheme(filters.eventSource);

  useEffect(() => {
    fetchFacets();
  }, [filters.eventSource]); // Re-fetch facets when event source changes

  useEffect(() => {
    fetchSessions();
  }, [search, filters, page]);

  const fetchFacets = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.eventSource) params.set("eventSource", filters.eventSource);
      
      const res = await fetch(`/api/facets?${params}`);
      const data = await res.json();
      setFacets(data);
    } catch (err) {
      console.error("Failed to fetch facets", err);
    }
  };

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filters.eventSource) params.set("eventSource", filters.eventSource);
      if (filters.hasOnDemand) params.set("hasOnDemand", filters.hasOnDemand);
      if (filters.topic) params.set("topic", filters.topic);
      if (filters.tag) params.set("tag", filters.tag);
      if (filters.level) params.set("level", filters.level);
      if (filters.audienceType) params.set("audienceType", filters.audienceType);
      if (filters.industry) params.set("industry", filters.industry);
      if (filters.deliveryType) params.set("deliveryType", filters.deliveryType);
      if (filters.sessionType) params.set("sessionType", filters.sessionType);
      if (filters.voteFilter) params.set("voteFilter", filters.voteFilter);
      params.set("page", page.toString());
      params.set("limit", "20");

      const res = await fetch(`/api/sessions?${params}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Failed to fetch sessions", res.status, errorData);
        setError(errorData.message || `Failed to fetch sessions (${res.status})`);
        setSessions([]);
        setTotalPages(1);
        return;
      }
      const data = await res.json();
      const sessionsData = data.sessions || [];
      setSessions(sessionsData);
      setTotalPages(data.pagination?.totalPages || 1);
      setError(null);
      
      // Initialize user votes from localStorage for displayed sessions
      if (typeof window !== "undefined" && sessionsData.length > 0) {
        const votes: Record<number, 1 | -1 | null> = {};
        sessionsData.forEach((session: Session) => {
          const storedVote = localStorage.getItem(`vote_${session.id}`);
          if (storedVote === "1" || storedVote === "-1") {
            votes[session.id] = parseInt(storedVote) as 1 | -1;
          }
        });
        setUserVotes((prev) => ({ ...prev, ...votes }));
      }
    } catch (err) {
      console.error("Failed to fetch sessions", err);
      setError(err instanceof Error ? err.message : "Failed to fetch sessions");
      setSessions([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
    
    // Reset tag expansion when event source changes (tags will be different)
    if (key === "eventSource") {
      setShowAllTags(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      eventSource: "",
      hasOnDemand: "",
      topic: "",
      tag: "",
      level: "",
      audienceType: "",
      industry: "",
      deliveryType: "",
      sessionType: "",
      voteFilter: "",
    });
    setSearch("");
    setPage(1);
    setShowAllTags(false); // Reset tag expansion
  };

  const handleVote = async (sessionId: number, value: 1 | -1) => {
    const userId = getUserIdentifier();
    if (!userId) {
      console.error("Failed to get user identifier");
      return;
    }

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId, value, userIdentifier: userId }),
      });

      if (!res.ok) {
        let errorData: any = {};
        try {
          const text = await res.text();
          errorData = text ? JSON.parse(text) : {};
        } catch (parseErr) {
          console.error("Failed to parse error response:", parseErr);
          errorData = { error: "Failed to parse error response" };
        }
        console.error("Failed to vote:", res.status, errorData);
        alert(`Failed to vote (${res.status}): ${errorData.message || errorData.error || "Unknown error"}`);
        return;
      }

      const data = await res.json();
      
      // Update user's vote state
      const newUserVote = data.userVote as 1 | -1 | null;
      setUserVotes((prev) => ({
        ...prev,
        [sessionId]: newUserVote,
      }));
      
      // Store in localStorage
      if (newUserVote) {
        localStorage.setItem(`vote_${sessionId}`, newUserVote.toString());
      } else {
        localStorage.removeItem(`vote_${sessionId}`);
      }
      
      // Update the session's vote counts in the local state
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                voteCounts: data.voteCounts,
              }
            : session
        )
      );
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  return (
    <div 
      className={`min-h-screen ms-background-pattern ${
        filters.eventSource === "Ignite" ? "ms-background-ignite" :
        filters.eventSource === "ReInvent" ? "ms-background-reinvent" :
        "ms-background-all"
      }`}
      style={{
        minHeight: "100vh"
      }}
    >
      {/* Header with Microsoft Gradient */}
      <header 
        className="sticky top-0 z-10 ms-elevation-8"
        style={{
          background: currentTheme.background,
          borderBottom: "none",
          padding: "24px 0"
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" fill="white" fillOpacity="0.2" rx="4"/>
              <path d="M8 4C6.9 4 6 4.9 6 6V26C6 27.1 6.9 28 8 28H24C25.1 28 26 27.1 26 26V8L20 4H8ZM18 10V6H20L24 10V26H8V6H18V10Z" fill="white"/>
            </svg>
            <h1 className="text-3xl font-semibold text-white" style={{ letterSpacing: "-0.02em" }}>
              {filters.eventSource ? `${currentTheme.name} 2025 Sessions` : "Ignite & Re:Invent 2025 Sessions Explorer"}
            </h1>
          </div>
          <p className="text-sm mt-1 ml-11" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
            {facets && (
              <>
                {facets.recordedCount} recorded sessions • {facets.nonRecordedCount} non-recorded
                {filters.eventSource && (
                  <span className="ml-2 opacity-80">
                    ({currentTheme.name})
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title, description, speakers, companies, tags, or topics..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-3 pl-12 text-base bg-white border border-[#C8C6C4] rounded-md focus:ring-2 outline-none ms-transition"
              style={{ 
                boxShadow: "var(--ms-shadow-2)",
                "--tw-ring-color": currentTheme.primary,
                borderColor: "#C8C6C4"
              } as any}
              onFocus={(e) => {
                e.target.style.borderColor = currentTheme.primary;
                e.target.style.boxShadow = `0 0 0 2px ${currentTheme.primary}33`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#C8C6C4";
                e.target.style.boxShadow = "var(--ms-shadow-2)";
              }}
            />
            <svg
              className="absolute left-4 top-3.5 h-5 w-5"
              style={{ color: "#605E5C" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Conference Slider and Recording Filter */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-8 bg-white rounded-md p-3 sm:p-4 border border-[#C8C6C4]" style={{ boxShadow: "var(--ms-shadow-2)" }}>
            
            {/* Conference Slider */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="text-sm font-semibold flex-shrink-0" style={{ color: "#323130" }}>
                Conference:
              </span>
              <div className="flex items-center bg-[#F3F2F1] rounded-lg p-0.5 border border-[#E1DFDD] overflow-x-auto min-w-0">
                <button
                  onClick={() => handleFilterChange("eventSource", "Ignite")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                    filters.eventSource === "Ignite"
                      ? "bg-white shadow-sm border border-[#C8C6C4]"
                      : "text-[#605E5C] hover:text-[#323130]"
                  }`}
                  style={filters.eventSource === "Ignite" ? { color: currentTheme.primary } : {}}
                  aria-label="Filter by Ignite"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="16" height="16" rx="1" fill="white"/>
                    {/* Microsoft logo with proper colors */}
                    <rect x="1" y="1" width="6.5" height="6.5" fill="#F25022"/>
                    <rect x="8.5" y="1" width="6.5" height="6.5" fill="#7FBA00"/>
                    <rect x="1" y="8.5" width="6.5" height="6.5" fill="#00A4EF"/>
                    <rect x="8.5" y="8.5" width="6.5" height="6.5" fill="#FFB900"/>
                  </svg>
                  <span className="whitespace-nowrap">Ignite</span>
                </button>
                
                <button
                  onClick={() => handleFilterChange("eventSource", "")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                    filters.eventSource === ""
                      ? "bg-white shadow-sm border border-[#C8C6C4]"
                      : "text-[#605E5C] hover:text-[#323130]"
                  }`}
                  style={filters.eventSource === "" ? { color: currentTheme.primary } : {}}
                  aria-label="Show all conferences"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="16" height="16" rx="2" fill="url(#allConfGradient)"/>
                    <circle cx="8" cy="8" r="5" fill="white" fillOpacity="0.9"/>
                    <circle cx="8" cy="8" r="2" fill="url(#allConfGradient)"/>
                    <defs>
                      <linearGradient id="allConfGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0078D4"/>
                        <stop offset="100%" stopColor="#FF9900"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="whitespace-nowrap">Show All</span>
                </button>
                
                <button
                  onClick={() => handleFilterChange("eventSource", "ReInvent")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                    filters.eventSource === "ReInvent"
                      ? "bg-white shadow-sm border border-[#C8C6C4]"
                      : "text-[#605E5C] hover:text-[#323130]"
                  }`}
                  style={filters.eventSource === "ReInvent" ? { color: currentTheme.primary } : {}}
                  aria-label="Filter by Re:Invent"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="16" height="16" rx="2" fill="#FF9900"/>
                    <path d="M3 11.5L8 5L13 11.5H10.5L8 8.5L5.5 11.5H3Z" fill="white"/>
                    <path d="M4 12H12" stroke="white" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                  <span className="whitespace-nowrap">Re:Invent</span>
                </button>
              </div>
            </div>

            {/* Recording Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <span className="text-sm font-semibold" style={{ color: "#323130" }}>
                Show:
              </span>
              <div className="flex items-center gap-4 sm:gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="recordingFilter"
                    value=""
                    checked={filters.hasOnDemand === ""}
                    onChange={(e) => handleFilterChange("hasOnDemand", e.target.value)}
                    className="w-4 h-4 border-[#C8C6C4] focus:ring-2"
                    style={{ 
                      color: currentTheme.primary,
                      "--tw-ring-color": currentTheme.primary
                    } as any}
                  />
                  <span className="text-sm font-medium whitespace-nowrap" style={{ color: "#323130" }}>
                    All Sessions
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="recordingFilter"
                    value="true"
                    checked={filters.hasOnDemand === "true"}
                    onChange={(e) => handleFilterChange("hasOnDemand", e.target.value)}
                    className="w-4 h-4 border-[#C8C6C4] focus:ring-2"
                    style={{ 
                      color: currentTheme.primary,
                      "--tw-ring-color": currentTheme.primary
                    } as any}
                  />
                  <span className="text-sm font-medium whitespace-nowrap" style={{ color: "#323130" }}>
                    Recorded Only
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">




          {facets && (
            <>
              {facets.topics.length > 0 && (
                <select
                  value={filters.topic}
                  onChange={(e) => handleFilterChange("topic", e.target.value)}
                  aria-label="Filter by topic"
                  className="px-4 py-2 bg-white border border-[#C8C6C4] rounded-md focus:ring-2 focus:ring-[#0078D4] focus:border-[#0078D4] outline-none ms-transition"
                  style={{ boxShadow: "var(--ms-shadow-2)", color: "#323130" }}
                >
                  <option value="">All Topics</option>
                  {facets.topics.map((t) => (
                    <option key={t.id} value={t.logicalValue}>
                      {t.displayValue}
                    </option>
                  ))}
                </select>
              )}

              {facets.tags.popular.length > 0 && (
                <select
                  value={filters.tag}
                  onChange={(e) => {
                    if (e.target.value === "SHOW_MORE_TAGS") {
                      setShowAllTags(true);
                      // Reset to empty value to keep "All Tags" selected
                      e.target.value = "";
                    } else if (e.target.value === "SHOW_LESS_TAGS") {
                      setShowAllTags(false);
                      // Reset to empty value to keep "All Tags" selected
                      e.target.value = "";
                    } else {
                      handleFilterChange("tag", e.target.value);
                    }
                  }}
                  aria-label="Filter by tag"
                  className="px-4 py-2 bg-white border border-[#C8C6C4] rounded-md focus:ring-2 focus:ring-[#0078D4] focus:border-[#0078D4] outline-none ms-transition"
                  style={{ boxShadow: "var(--ms-shadow-2)", color: "#323130" }}
                >
                  <option value="">All Tags</option>
                  {facets.tags.popular.map((t) => (
                    <option key={t.id} value={t.logicalValue}>
                      {t.displayValue}
                    </option>
                  ))}
                  {!showAllTags && facets.tags.remaining.length > 0 && (
                    <option value="SHOW_MORE_TAGS" style={{ fontStyle: 'italic', color: currentTheme.primary }}>
                      ── Show {facets.tags.remaining.length} more tags ──
                    </option>
                  )}
                  {showAllTags && facets.tags.remaining.map((t) => (
                    <option key={t.id} value={t.logicalValue}>
                      {t.displayValue}
                    </option>
                  ))}
                  {showAllTags && facets.tags.remaining.length > 0 && (
                    <option value="SHOW_LESS_TAGS" style={{ fontStyle: 'italic', color: currentTheme.primary }}>
                      ── Show less tags ──
                    </option>
                  )}
                </select>
              )}


              {facets.levels.length > 0 && (
                <select
                  value={filters.level}
                  onChange={(e) => handleFilterChange("level", e.target.value)}
                  aria-label="Filter by level"
                  className="px-4 py-2 bg-white border border-[#C8C6C4] rounded-md focus:ring-2 focus:ring-[#0078D4] focus:border-[#0078D4] outline-none ms-transition"
                  style={{ boxShadow: "var(--ms-shadow-2)", color: "#323130" }}
                >
                  <option value="">All Levels</option>
                  {facets.levels.map((l) => (
                    <option key={l.id} value={l.logicalValue}>
                      {l.displayValue}
                    </option>
                  ))}
                </select>
              )}

              {facets.sessionTypes && facets.sessionTypes.length > 0 && (
                <select
                  value={filters.sessionType}
                  onChange={(e) => handleFilterChange("sessionType", e.target.value)}
                  aria-label="Filter by session type"
                  className="px-4 py-2 bg-white border border-[#C8C6C4] rounded-md focus:ring-2 focus:ring-[#0078D4] focus:border-[#0078D4] outline-none ms-transition"
                  style={{ boxShadow: "var(--ms-shadow-2)", color: "#323130" }}
                >
                  <option value="">All Session Types</option>
                  {facets.sessionTypes.map((s) => (
                    <option key={s.id} value={s.logicalValue}>
                      {s.displayValue}
                    </option>
                  ))}
                </select>
              )}
            </>
          )}

          <select
            value={filters.voteFilter}
            onChange={(e) => handleFilterChange("voteFilter", e.target.value)}
            aria-label="Filter by votes"
            className="px-4 py-2 bg-white border border-[#C8C6C4] rounded-md focus:ring-2 focus:ring-[#0078D4] focus:border-[#0078D4] outline-none ms-transition"
            style={{ boxShadow: "var(--ms-shadow-2)", color: "#323130" }}
          >
            <option value="">All Votes</option>
            <option value="high">High Votes</option>
            <option value="low">Low Votes</option>
            <option value="none">No Votes</option>
          </select>

          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-white border border-[#C8C6C4] rounded-md hover:bg-[#F3F2F1] ms-transition text-[#323130] font-medium"
            style={{ boxShadow: "var(--ms-shadow-2)" }}
            aria-label="Clear all filters"
          >
            Clear Filters
          </button>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div 
              className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0078D4]"
              style={{ borderTopColor: "transparent" }}
            ></div>
            <p className="mt-4" style={{ color: "#605E5C" }}>Loading sessions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p style={{ color: "#D13438" }} className="font-semibold mb-2">Error loading sessions</p>
            <p style={{ color: "#605E5C" }}>{error}</p>
            {error.includes("DATABASE_URL") || error.includes("Prisma") ? (
              <p style={{ color: "#605E5C" }} className="mt-2 text-sm">
                Please check your database configuration.
              </p>
            ) : null}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: "#605E5C" }}>No sessions found.</p>
            <p style={{ color: "#605E5C" }} className="mt-2 text-sm">
              The database appears to be empty. You may need to run the ingest process to populate sessions.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-md p-6 ms-elevation-4 ms-transition cursor-pointer"
                  style={{
                    borderLeft: `4px solid ${session.hasOnDemand ? "#107C10" : "#C8C6C4"}`,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {session.hasOnDemand ? (
                          <span 
                            className="px-3 py-1 text-xs font-semibold rounded-md"
                            style={{ 
                              backgroundColor: currentTheme.accent, 
                              color: currentTheme.primary,
                              border: `1px solid ${currentTheme.accentBorder}`
                            }}
                          >
                            RECORDED
                          </span>
                        ) : (
                          <span 
                            className="px-3 py-1 text-xs font-semibold rounded-md"
                            style={{ 
                              backgroundColor: "#F3F2F1", 
                              color: "#605E5C",
                              border: "1px solid #E1DFDD"
                            }}
                          >
                            NOT RECORDED
                          </span>
                        )}
                        {session.isPopular && (
                          <span 
                            className="px-3 py-1 text-xs font-semibold rounded-md"
                            style={{ 
                              backgroundColor: "#FFF4E5", 
                              color: "#FF8C00",
                              border: "1px solid #FFD9A6"
                            }}
                          >
                            POPULAR
                          </span>
                        )}
                        {session.heroSession && (
                          <span 
                            className="px-3 py-1 text-xs font-semibold rounded-md"
                            style={{ 
                              backgroundColor: "#F3E5F5", 
                              color: "#8764B8",
                              border: "1px solid #E1BEE7"
                            }}
                          >
                            HERO
                          </span>
                        )}
                        {session.sessionTypeDisplay && (
                          <span 
                            className="px-3 py-1 text-xs font-semibold rounded-md"
                            style={{ 
                              backgroundColor: currentTheme.accent, 
                              color: currentTheme.primary,
                              border: `1px solid ${currentTheme.accentBorder}`
                            }}
                          >
                            {session.sessionTypeDisplay}
                          </span>
                        )}
                      </div>
                      <h2 
                        className="text-xl font-semibold mb-2"
                        style={{ color: "#201F1E", letterSpacing: "-0.01em" }}
                      >
                        {session.title}
                      </h2>
                      {session.description && (
                        <p 
                          className="mb-3 leading-relaxed"
                          style={{ color: "#605E5C" }}
                        >
                          {session.description}
                        </p>
                      )}
                      {session.sessionSpeakers && session.sessionSpeakers.length > 0 && (
                        <div className="mb-3">
                          <p 
                            className="text-sm font-semibold mb-2"
                            style={{ color: "#323130" }}
                          >
                            Speakers:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {session.sessionSpeakers.map((ss) => {
                              const speaker = ss.speaker;
                              const companies = [
                                speaker.company,
                                ...speaker.speakerCompanies.map((sc) => sc.company.name),
                              ].filter((c): c is string => !!c);
                              const uniqueCompanies = [...new Set(companies)];
                              
                              return (
                                <div
                                  key={speaker.id}
                                  className="px-3 py-1.5 text-sm rounded-md font-medium ms-transition hover:shadow-sm"
                                  style={{ 
                                    backgroundColor: "#DEECF9", 
                                    color: "#005A9E",
                                    border: "1px solid #B3D9F2"
                                  }}
                                >
                                  <span>{speaker.name}</span>
                                  {uniqueCompanies.length > 0 && (
                                    <span className="ml-1 opacity-80">
                                      ({uniqueCompanies.join(", ")})
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {session.sessionTags.map((st) => (
                          <span
                            key={st.tag.logicalValue}
                            className="px-2.5 py-1 text-xs rounded-md font-medium"
                            style={{ 
                              backgroundColor: "#F3F2F1", 
                              color: "#605E5C",
                              border: "1px solid #E1DFDD"
                            }}
                          >
                            {st.tag.displayValue}
                          </span>
                        ))}
                      </div>
                      <div 
                        className="text-sm flex flex-wrap gap-2"
                        style={{ color: "#979693" }}
                      >
                        {session.location && <span>{session.location}</span>}
                        {session.timeSlot && <span>• {session.timeSlot}</span>}
                        {session.startDateTime && (
                          <span>• {new Date(session.startDateTime).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex flex-col items-end gap-3">
                      {session.hasOnDemand && session.onDemandUrl && (
                        <a
                          href={session.onDemandUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-2.5 text-white rounded-md font-semibold ms-transition inline-block ms-elevation-4"
                          style={{
                            background: currentTheme.background,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = currentTheme.backgroundHover;
                            e.currentTarget.style.boxShadow = "var(--ms-shadow-8)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = currentTheme.background;
                            e.currentTarget.style.boxShadow = "var(--ms-shadow-4)";
                          }}
                        >
                          Watch
                        </a>
                      )}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleVote(session.id, 1)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-md ms-transition ${
                            userVotes[session.id] === 1
                              ? "border-2"
                              : "border border-[#C8C6C4]"
                          }`}
                          style={{
                            boxShadow: userVotes[session.id] === 1 ? "var(--ms-shadow-4)" : "var(--ms-shadow-2)",
                            backgroundColor: userVotes[session.id] === 1 ? "#E8F5E9" : "white",
                            borderColor: userVotes[session.id] === 1 ? "#107C10" : "#C8C6C4",
                          }}
                          aria-label="Upvote"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10 5L15 10H11V15H9V10H5L10 5Z"
                              fill="#107C10"
                            />
                          </svg>
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "#107C10" }}
                          >
                            {session.voteCounts?.upvotes || 0}
                          </span>
                        </button>
                        <button
                          onClick={() => handleVote(session.id, -1)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-md ms-transition ${
                            userVotes[session.id] === -1
                              ? "border-2"
                              : "border border-[#C8C6C4]"
                          }`}
                          style={{
                            boxShadow: userVotes[session.id] === -1 ? "var(--ms-shadow-4)" : "var(--ms-shadow-2)",
                            backgroundColor: userVotes[session.id] === -1 ? "#FEF6F6" : "white",
                            borderColor: userVotes[session.id] === -1 ? "#D13438" : "#C8C6C4",
                          }}
                          aria-label="Downvote"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10 15L5 10H9V5H11V10H15L10 15Z"
                              fill="#D13438"
                            />
                          </svg>
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "#D13438" }}
                          >
                            {session.voteCounts?.downvotes || 0}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-5 py-2.5 bg-white border border-[#C8C6C4] rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F3F2F1] ms-transition font-medium"
                  style={{ 
                    boxShadow: page === 1 ? "none" : "var(--ms-shadow-2)",
                    color: "#323130"
                  }}
                >
                  Previous
                </button>
                <span 
                  className="px-4 py-2 font-medium"
                  style={{ color: "#605E5C" }}
                >
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-5 py-2.5 bg-white border border-[#C8C6C4] rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F3F2F1] ms-transition font-medium"
                  style={{ 
                    boxShadow: page === totalPages ? "none" : "var(--ms-shadow-2)",
                    color: "#323130"
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
