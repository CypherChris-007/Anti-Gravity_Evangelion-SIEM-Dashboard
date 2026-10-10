'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  Shield,
  ShieldAlert,
  Zap,
} from 'lucide-react'
import { useSiemStore } from '@/lib/store/useSiemStore'
import { AttackEvent, ThreatSeverity, ThreatType } from '@/types/cyber'

export function MetricsSection() {
  const activeThreatsCount = useSiemStore((state) => state.activeThreatsCount)
  const blockedEvents24h = useSiemStore((state) => state.blockedEvents24h)
  const activeCveAlerts = useSiemStore((state) => state.activeCveAlerts)
  const histogramBars = useSiemStore((state) => state.histogramBars)
  const attacks = useSiemStore((state) => state.attacks)
  const searchQuery = useSiemStore((state) => state.searchQuery)
  const resolveIncident = useSiemStore((state) => state.resolveIncident)
  const setToast = useSiemStore((state) => state.setToast)
  const setSelectedAttack = useSiemStore((state) => state.setSelectedAttack)

  const [severityFilter, setSeverityFilter] = useState<'ALL' | ThreatSeverity>('ALL')
  const [typeFilter, setTypeFilter] = useState<'ALL' | ThreatType>('ALL')
  const [sortBy, setSortBy] = useState<'TIME' | 'SEVERITY'>('TIME')

  // Calculate live attack vectors frequency
  const vectorSummary = useMemo(() => {
    const counts: Record<string, { count: number; severity: ThreatSeverity }> = {
      RANSOMWARE: { count: 18400, severity: 'CRITICAL' },
      MALWARE: { count: 42800, severity: 'HIGH' },
      EXPLOIT: { count: 8900, severity: 'HIGH' },
      PHISHING: { count: 12700, severity: 'MEDIUM' },
      BOTNET: { count: 6400, severity: 'MEDIUM' },
      ZERO_DAY: { count: 3200, severity: 'CRITICAL' },
    }

    // Add in current stream counts
    attacks.forEach((atk) => {
      if (counts[atk.threatType]) {
        counts[atk.threatType].count += 1
      }
    })

    return Object.entries(counts).map(([type, meta]) => ({
      type,
      countFormatted: `${(meta.count / 1000).toFixed(1)}K`,
      severity: meta.severity,
    }))
  }, [attacks])

  // Filter and sort active attacks list
  const filteredAttacks = useMemo(() => {
    return attacks
      .filter((atk) => {
        if (severityFilter !== 'ALL' && atk.severity !== severityFilter) return false
        if (typeFilter !== 'ALL' && atk.threatType !== typeFilter) return false
        if (searchQuery) {
          const q = searchQuery.toLowerCase()
          return (
            atk.threatType.toLowerCase().includes(q) ||
            atk.threatVector.toLowerCase().includes(q) ||
            atk.originCountry.toLowerCase().includes(q) ||
            atk.targetCountry.toLowerCase().includes(q) ||
            (atk.cveId && atk.cveId.toLowerCase().includes(q))
          )
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'SEVERITY') {
          const rank: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
          return (rank[b.severity] || 0) - (rank[a.severity] || 0)
        }
        // Timestamp desc
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      })
  }, [attacks, severityFilter, typeFilter, searchQuery, sortBy])

  function handleResolve(e: React.MouseEvent, atk: AttackEvent) {
    e.stopPropagation()
    const res = resolveIncident(atk.id)
    setToast(res.message)
  }

  return (
    <div className="flex flex-col h-full font-mono text-xs">
      {/* 1. KPI Counters */}
      <div className="kpi-grid">
        <div className="kpi critical relative overflow-hidden">
          <span>ACTIVE_THREATS</span>
          <strong>{activeThreatsCount.toLocaleString()}</strong>
          <em>+12.4% ELEVATED</em>
          <div className="kpi-bar">
            <i style={{ width: `${Math.min(100, (activeThreatsCount / 1500) * 100)}%` }} />
          </div>
        </div>

        <div className="kpi secure relative overflow-hidden">
          <span>BLOCKED_EVENTS_24H</span>
          <strong>{blockedEvents24h.toLocaleString()}</strong>
          <em>+08.1% INTERCEPTED</em>
          <div className="kpi-bar">
            <i style={{ width: '84%' }} />
          </div>
        </div>

        <div className="kpi warning relative overflow-hidden">
          <span>ACTIVE_CVE_ALERTS</span>
          <strong>{activeCveAlerts}</strong>
          <em>+03.2% KEV_SYNC</em>
          <div className="kpi-bar">
            <i style={{ width: '62%' }} />
          </div>
        </div>
      </div>

      {/* 2. Dynamic 24-Bar Threat Timeline Histogram */}
      <div className="px-3 pt-2">
        <div className="chart-head !px-0">
          <span className="flex items-center gap-1.5 font-bold">
            <Clock className="w-3 h-3 text-[var(--orange)]" />
            THREAT TIMELINE <small className="text-[#596872]">// LAST 60 MIN (5-MIN BUCKETS)</small>
          </span>
          <span className="chart-value text-[8px] flex items-center">
            <i className="w-1.5 h-1.5 bg-[var(--orange)] rounded-sm mr-1" />
            REAL-TIME BUFFER
          </span>
        </div>

        <div className="bar-chart !h-[58px] !px-0 mt-1">
          {histogramBars.map((height, idx) => {
            const isHot = height > 75 || idx % 6 === 0
            return (
              <div
                key={idx}
                className={`bar ${isHot ? 'hot' : ''}`}
                style={{ height: `${height}%` }}
                title={`Bucket ${idx + 1}: ${height} events/min`}
              >
                <span />
              </div>
            )
          })}
        </div>

        <div className="chart-axis !px-0 flex justify-between text-[7px] text-[#4f606b] mt-1">
          <span>-60M</span>
          <span>-45M</span>
          <span>-30M</span>
          <span>-15M</span>
          <span className="text-[var(--orange)] font-bold">NOW (LIVE)</span>
        </div>
      </div>

      {/* 3. Attack Vector Summary Bar */}
      <div className="vector-table !mt-2 !mx-3">
        <div className="table-label !pb-1 flex justify-between border-b border-[#202a31] text-[7px] text-[#667680]">
          <span>ATTACK VECTOR DISTRIBUTION</span>
          <span>ESTIMATED RATE</span>
          <span>SEVERITY</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 py-1.5">
          {vectorSummary.slice(0, 4).map((vec) => (
            <div
              key={vec.type}
              className="border border-[#1f2830] bg-[#070b0f] p-1.5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <b className="text-[8px] text-[var(--orange)]">[{vec.type}]</b>
                <span className="text-[7px] text-[#81919a]">{vec.countFormatted}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[7px]">
                <span
                  className={
                    vec.severity === 'CRITICAL'
                      ? 'text-[var(--red)] font-bold'
                      : 'text-[var(--orange)] font-bold'
                  }
                >
                  {vec.severity}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--orange)] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Live Incident Feed & Resolution Table */}
      <div className="mt-2 mx-3 flex-1 flex flex-col border-t border-[#202a31] pt-1.5 pb-2">
        <div className="flex items-center justify-between text-[8px] text-[#71808a] mb-1.5">
          <div className="flex items-center gap-2">
            <Flame className="w-3 h-3 text-[var(--red)] animate-pulse" />
            <span className="font-bold text-white tracking-wider">ACTIVE INCIDENTS</span>
            <span>({filteredAttacks.length} IN BUFFER)</span>
          </div>

          {/* Filter and Sort toggles */}
          <div className="flex items-center gap-1.5 text-[7px]">
            <button
              onClick={() =>
                setSeverityFilter((prev) =>
                  prev === 'ALL' ? 'CRITICAL' : prev === 'CRITICAL' ? 'HIGH' : 'ALL'
                )
              }
              className={`px-1.5 py-0.5 border ${
                severityFilter !== 'ALL'
                  ? 'border-[var(--red)] text-[var(--red)] bg-[var(--red)]/10'
                  : 'border-[#28313a] text-[#71808a]'
              }`}
            >
              SEV: {severityFilter}
            </button>
            <button
              onClick={() => setSortBy((prev) => (prev === 'TIME' ? 'SEVERITY' : 'TIME'))}
              className="px-1.5 py-0.5 border border-[#28313a] hover:border-[var(--orange)] text-[#71808a] flex items-center gap-1"
            >
              <ArrowUpDown className="w-2.5 h-2.5" /> {sortBy}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[140px] space-y-1 pr-1 font-mono">
          {filteredAttacks.slice(0, 15).map((atk) => {
            const isCritical = atk.severity === 'CRITICAL'
            const isResolved = atk.status === 'RESOLVED'
            return (
              <div
                key={atk.id}
                onClick={() => setSelectedAttack(atk)}
                className={`p-1.5 border transition-all cursor-pointer flex items-center justify-between gap-2 text-[8px] ${
                  isResolved
                    ? 'border-[#1b3323] bg-[#07130b] opacity-60'
                    : isCritical
                    ? 'border-[#3f1e1e] bg-[#140808] hover:border-[var(--red)]'
                    : 'border-[#202a31] bg-[#0b0f14] hover:border-[var(--orange)]'
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      isResolved
                        ? 'bg-[var(--green)]'
                        : isCritical
                        ? 'bg-[var(--red)] animate-ping'
                        : 'bg-[var(--orange)]'
                    }`}
                  />
                  <div className="truncate">
                    <span className="font-bold text-white mr-1.5">
                      {atk.originCountry} → {atk.targetCountry}
                    </span>
                    <span
                      className={`px-1 py-0.2 text-[7px] mr-1.5 font-bold ${
                        isCritical
                          ? 'bg-[var(--red)]/20 text-[var(--red)]'
                          : 'bg-[var(--orange)]/20 text-[var(--orange)]'
                      }`}
                    >
                      {atk.threatType}
                    </span>
                    <span className="text-[#71808a] truncate hidden sm:inline">
                      {atk.threatVector}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[#596872] text-[7px]">
                    {new Date(atk.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>

                  {/* SPECIFICATION: [RESOLVE_INCIDENT] button */}
                  {isResolved ? (
                    <span className="text-[var(--green)] text-[7px] flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-2.5 h-2.5" /> RESOLVED
                    </span>
                  ) : (
                    <button
                      onClick={(e) => handleResolve(e, atk)}
                      className="px-2 py-0.5 border border-[var(--orange)] bg-[var(--orange)]/15 text-[var(--orange)] hover:bg-[var(--orange)] hover:text-black font-bold text-[7px] transition-all flex items-center gap-1"
                    >
                      <Zap className="w-2.5 h-2.5" /> RESOLVE
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
