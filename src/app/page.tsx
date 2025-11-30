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
};

type Facets = {
  topics: Array<{ id: number; logicalValue: string; displayValue: string }>;
  tags: Array<{ id: number; logicalValue: string; displayValue: string }>;
  levels: Array<{ id: number; logicalValue: string; displayValue: string }>;
  audienceTypes: Array<{ id: number; logicalValue: string; displayValue: string }>;
  industries: Array<{ id: number; logicalValue: string; displayValue: string }>;
  deliveryTypes: Array<{ id: number; logicalValue: string; displayValue: string }>;
  recordedCount: number;
  nonRecordedCount: number;
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    hasOnDemand: "",
    topic: "",
    tag: "",
    level: "",
    audienceType: "",
    industry: "",
    deliveryType: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchFacets();
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [search, filters, page]);

  const fetchFacets = async () => {
    try {
      const res = await fetch("/api/facets");
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
      if (filters.hasOnDemand) params.set("hasOnDemand", filters.hasOnDemand);
      if (filters.topic) params.set("topic", filters.topic);
      if (filters.tag) params.set("tag", filters.tag);
      if (filters.level) params.set("level", filters.level);
      if (filters.audienceType) params.set("audienceType", filters.audienceType);
      if (filters.industry) params.set("industry", filters.industry);
      if (filters.deliveryType) params.set("deliveryType", filters.deliveryType);
      params.set("page", page.toString());
      params.set("limit", "20");

      const res = await fetch(`/api/sessions?${params}`);
      const data = await res.json();
      setSessions(data.sessions || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      hasOnDemand: "",
      topic: "",
      tag: "",
      level: "",
      audienceType: "",
      industry: "",
      deliveryType: "",
    });
    setSearch("");
    setPage(1);
  };

  return (
    <div className="min-h-screen ms-background-pattern">
      {/* Header with Microsoft Gradient */}
      <header 
        className="sticky top-0 z-10 ms-elevation-8"
        style={{
          background: "linear-gradient(135deg, #0078D4 0%, #005A9E 100%)",
          borderBottom: "none"
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" fill="white" fillOpacity="0.2" rx="4"/>
              <path d="M16 8L24 14V24H20V16H12V24H8V14L16 8Z" fill="white"/>
            </svg>
            <h1 className="text-3xl font-semibold text-white" style={{ letterSpacing: "-0.02em" }}>
              Microsoft Ignite Sessions Explorer
            </h1>
          </div>
          <p className="text-sm text-white text-opacity-90 mt-1 ml-11">
            {facets && (
              <>
                {facets.recordedCount} recorded sessions • {facets.nonRecordedCount} non-recorded
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
              className="w-full px-4 py-3 pl-12 text-base bg-white border border-[#C8C6C4] rounded-md focus:ring-2 focus:ring-[#0078D4] focus:border-[#0078D4] outline-none ms-transition"
              style={{ boxShadow: "var(--ms-shadow-2)" }}
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

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={filters.hasOnDemand}
            onChange={(e) => handleFilterChange("hasOnDemand", e.target.value)}
            aria-label="Filter by recording availability"
            className="px-4 py-2 bg-white border border-[#C8C6C4] rounded-md focus:ring-2 focus:ring-[#0078D4] focus:border-[#0078D4] outline-none ms-transition"
            style={{ boxShadow: "var(--ms-shadow-2)", color: "#323130" }}
          >
            <option value="">All Sessions</option>
            <option value="true">Recorded Only</option>
            <option value="false">Not Recorded</option>
          </select>

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

              {facets.tags.length > 0 && (
                <select
                  value={filters.tag}
                  onChange={(e) => handleFilterChange("tag", e.target.value)}
                  aria-label="Filter by tag"
                  className="px-4 py-2 bg-white border border-[#C8C6C4] rounded-md focus:ring-2 focus:ring-[#0078D4] focus:border-[#0078D4] outline-none ms-transition"
                  style={{ boxShadow: "var(--ms-shadow-2)", color: "#323130" }}
                >
                  <option value="">All Tags</option>
                  {facets.tags.map((t) => (
                    <option key={t.id} value={t.logicalValue}>
                      {t.displayValue}
                    </option>
                  ))}
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
            </>
          )}

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
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: "#605E5C" }}>No sessions found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-md p-6 ms-elevation-4 hover:ms-elevation-8 ms-transition cursor-pointer"
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
                              backgroundColor: "#E8F5E9", 
                              color: "#107C10",
                              border: "1px solid #B3E5B3"
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
                              backgroundColor: "#DEECF9", 
                              color: "#0078D4",
                              border: "1px solid #B3D9F2"
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
                          className="mb-3 line-clamp-2 leading-relaxed"
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
                    {session.hasOnDemand && session.onDemandUrl && (
                      <div className="ml-4 flex-shrink-0">
                        <a
                          href={session.onDemandUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-2.5 text-white rounded-md font-semibold ms-transition inline-block ms-elevation-4 hover:ms-elevation-8"
                          style={{
                            background: "linear-gradient(135deg, #0078D4 0%, #005A9E 100%)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "linear-gradient(135deg, #106EBE 0%, #0078D4 100%)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "linear-gradient(135deg, #0078D4 0%, #005A9E 100%)";
                          }}
                        >
                          Watch
                        </a>
                      </div>
                    )}
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
