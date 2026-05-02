"use client";

import { useEffect, useRef, useState } from "react";

type LogLine = {
  type: string;
  message: string;
  ts: string;
  city: string;
  category: string;
  status: string;
};

type AnalyticsEntry = {
  key: string;
  country: string;
  city: string;
  category: string;
  status?: string;
  build_status?: string;
  total_leads?: number;
  no_web?: number;
  weak_web?: number;
  deployed_count?: number;
};

type Stats = {
  total_leads: number;
  no_web: number;
  weak_web: number;
  deployed: number;
  emails_sent: number;
  active_city: string;
  categories_scraped: number;
  categories_built: number;
  categories_error: number;
};

const TYPE_COLOR: Record<string, string> = {
  scraper: "#79c0ff",
  builder: "#e3b341",
  vercel: "#56d364",
  analytics: "#79c0ff",
  email: "#bc8cff",
  error: "#f85149",
};

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  scraped: { label: "scraped", cls: "bg-teal-100 text-teal-800" },
  queued: { label: "queued", cls: "bg-gray-100 text-gray-600" },
  building: { label: "building", cls: "bg-blue-100 text-blue-800" },
  deployed: { label: "deployed", cls: "bg-purple-100 text-purple-800" },
  error: { label: "error", cls: "bg-red-100 text-red-800" },
};

export default function Dashboard() {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const termRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource("/api/events");
    esRef.current = es;
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "ping") return;
      setLogs((prev) => [...prev.slice(-499), data]);
    };
    return () => es.close();
  }, []);

  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    const fetchData = () => {
      fetch("/api/analytics")
        .then((r) => r.json())
        .then(setAnalytics)
        .catch(() => {});
      fetch("/api/stats")
        .then((r) => r.json())
        .then(setStats)
        .catch(() => {});
    };
    fetchData();
    const t = setInterval(fetchData, 5000);
    return () => clearInterval(t);
  }, []);

  const formatTs = (ts: string) => ts.slice(11, 19);

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-medium text-gray-900">NexviaTech Pipeline</h1>
            {stats?.active_city ? (
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                ● Running · {stats.active_city}
              </span>
            ) : (
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">Idle</span>
            )}
          </div>
          <span className="text-xs text-gray-400">{new Date().toLocaleTimeString()}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: "leads scraped", val: stats?.total_leads ?? 0, color: "" },
            { label: "no-website", val: stats?.no_web ?? 0, color: "text-green-700" },
            { label: "weak website", val: stats?.weak_web ?? 0, color: "text-amber-700" },
            { label: "sites deployed", val: stats?.deployed ?? 0, color: "text-purple-700" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={`text-2xl font-medium ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Main two-column */}
        <div className="grid grid-cols-2 gap-3 mb-3">

          {/* Terminal */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-500">terminal output</span>
              <span className="text-xs text-green-500">● live</span>
            </div>
            <div
              ref={termRef}
              className="overflow-y-auto p-3 font-mono text-xs leading-relaxed"
              style={{ height: 260, background: "#0d1117", color: "#c9d1d9" }}
            >
              {logs.length === 0 && (
                <span style={{ color: "#484f58" }}>waiting for pipeline to start...</span>
              )}
              {logs.map((log, i) => (
                <div key={i}>
                  <span style={{ color: "#484f58" }}>{formatTs(log.ts)}</span>{" "}
                  <span style={{ color: TYPE_COLOR[log.type] || "#c9d1d9" }}>
                    [{log.type}]
                  </span>{" "}
                  <span style={{ color: log.status === "error" ? "#f85149" : "#c9d1d9" }}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Category status */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-500">category status</span>
              <span className="text-xs text-gray-400">{analytics[0]?.city || "—"}</span>
            </div>
            <div className="overflow-y-auto" style={{ height: 260 }}>
              {analytics.length === 0 && (
                <p className="text-xs text-gray-400 p-4">no data yet</p>
              )}
              {analytics.map((entry) => {
                const bs = entry.build_status || "queued";
                const badge = STATUS_BADGE[bs] || STATUS_BADGE.queued;
                return (
                  <div
                    key={entry.key}
                    className="flex items-center justify-between px-4 py-2 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{entry.category}</p>
                      <p className="text-xs text-gray-400">
                        {entry.total_leads
                          ? `${entry.total_leads} leads · ${entry.no_web} no-web · ${entry.weak_web} weak`
                          : entry.status === "scraped" ? "scraped" : "waiting..."}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-500 mb-3">pipeline summary</p>
            <div className="space-y-2 text-sm">
              {[
                { label: "Categories scraped", val: stats?.categories_scraped ?? 0 },
                { label: "Sites built & deployed", val: stats?.categories_built ?? 0 },
                { label: "Errors", val: stats?.categories_error ?? 0 },
                { label: "Emails sent", val: stats?.emails_sent ?? 0 },
              ].map((r) => (
                <div key={r.label} className="flex justify-between border-b border-gray-50 pb-1">
                  <span className="text-gray-500">{r.label}</span>
                  <span className="font-medium text-gray-800">{r.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-medium text-gray-500 mb-3">deployed sites (latest)</p>
            <div className="space-y-1 text-xs font-mono overflow-y-auto" style={{ maxHeight: 120 }}>
              {analytics
                .filter((e) => e.build_status === "deployed")
                .slice(0, 8)
                .map((e) => (
                  <div key={e.key} className="text-gray-600">
                    ✓ {e.city}/{e.category} · {e.deployed_count ?? 0} sites
                  </div>
                ))}
              {analytics.filter((e) => e.build_status === "deployed").length === 0 && (
                <span className="text-gray-400">no deployments yet</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
