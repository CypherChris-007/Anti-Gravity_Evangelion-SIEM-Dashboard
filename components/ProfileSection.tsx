'use client'

import { useState } from 'react'
import {
  Award,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Crosshair,
  Database,
  History,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useSiemStore } from '@/lib/store/useSiemStore'

export function ProfileSection() {
  const missionsCompleted = useSiemStore((state) => state.missionsCompleted)
  const recentResolutions = useSiemStore((state) => state.recentResolutions)
  const skillRating = useSiemStore((state) => state.skillRating)
  const syncRating = useSiemStore((state) => state.syncRating)
  const operatorLevel = useSiemStore((state) => state.operatorLevel)
  const badges = useSiemStore((state) => state.badges)
  const resolutionsLog = useSiemStore((state) => state.resolutionsLog)
  const [showDetails, setShowDetails] = useState(false)

  const unlockedCount = badges.filter((b) => b.unlocked).length

  return (
    <div className="flex flex-col justify-between h-full font-mono text-xs">
      {/* Operator Header */}
      <div className="profile-main !p-3 flex items-center gap-3">
        <div className="profile-avatar !w-9 !h-9 flex items-center justify-center border border-[var(--orange)] text-[var(--orange)] bg-[#121921]">
          <Crosshair className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <strong className="text-white text-[10px] tracking-wider">
            EVA_OPERATOR_01
          </strong>
          <span className="text-[8px] text-[#71808a] block mt-0.5">
            SECURITY OPERATIONS SPECIALIST // MAGI CLEARANCE
          </span>
        </div>
        <div className="level !ml-auto !pl-3 border-l border-[#28313a] text-right">
          <span className="text-[8px] text-[#71808a]">RANK</span>
          <b className="text-[var(--orange)] text-base font-black">
            LVL {String(operatorLevel).padStart(2, '0')}
          </b>
        </div>
      </div>

      {/* Operator Metrics 3-Column */}
      <div className="profile-stats grid grid-cols-3 border-t border-b border-[#202a31] text-center">
        <div className="p-2 border-r border-[#202a31]">
          <span className="text-[7px] text-[#687982] block">MISSIONS_COMPLETED</span>
          <b className="text-sm font-bold text-white block mt-0.5">
            {missionsCompleted}
          </b>
        </div>
        <div className="p-2 border-r border-[#202a31]">
          <span className="text-[7px] text-[#687982] block">RESOLUTIONS (SES)</span>
          <b className="text-sm font-bold text-[var(--green)] block mt-0.5">
            {recentResolutions}
          </b>
        </div>
        <div className="p-2">
          <span className="text-[7px] text-[#687982] block">SKILL_RATING</span>
          <b className="text-sm font-bold text-[var(--orange)] block mt-0.5">
            {skillRating.toFixed(1)}
          </b>
        </div>
      </div>

      {/* Operator Neural Sync Bar */}
      <div className="progress-line !p-2.5 flex items-center gap-2 text-[7px] text-[#64747e]">
        <span className="whitespace-nowrap font-bold">OPERATOR SYNC</span>
        <div className="flex-1 h-1.5 bg-[#1b252d] border border-[#28343c] overflow-hidden">
          <div
            className="h-full bg-[var(--green)] transition-all duration-500"
            style={{ width: `${Math.min(100, syncRating)}%` }}
          />
        </div>
        <strong className="text-[var(--green)] font-bold">{syncRating.toFixed(0)}%</strong>

        {/* Toggle Badges & History drawer */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="ml-1 text-[#71808a] hover:text-[var(--orange)] flex items-center gap-0.5"
          title="Toggle Badges & Resolution Audit"
        >
          {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Drawer: Badges and Resolution Audit */}
      {showDetails && (
        <div className="p-2.5 border-t border-[#202a31] bg-[#070b0f] text-[8px] space-y-2 max-h-[140px] overflow-y-auto">
          <div className="flex items-center justify-between font-bold text-[#71808a]">
            <span>OPERATOR BADGES ({unlockedCount}/{badges.length} UNLOCKED)</span>
            <span className="text-[var(--orange)] flex items-center gap-1">
              <Award className="w-2.5 h-2.5" /> NERV COMMENDATIONS
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`p-1.5 border flex items-center gap-1.5 ${
                  b.unlocked
                    ? 'border-[#203c2a] bg-[#0a180e] text-white'
                    : 'border-[#1f2830] bg-[#090d12] text-[#4d5e68] opacity-60'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] ${
                    b.unlocked ? 'bg-[var(--green)] text-black' : 'bg-[#212b32] text-[#71808a]'
                  }`}
                >
                  {b.unlocked ? '✓' : '🔒'}
                </div>
                <div className="min-w-0">
                  <div className="font-bold truncate">{b.name}</div>
                  <div className="text-[7px] text-[#71808a] truncate">{b.description}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Resolutions Log */}
          {resolutionsLog.length > 0 && (
            <div className="pt-2 border-t border-[#1b252d]">
              <div className="font-bold text-[#71808a] mb-1 flex items-center gap-1">
                <History className="w-2.5 h-2.5 text-[var(--green)]" />
                <span>RECENT INCIDENT RESOLUTIONS</span>
              </div>
              <div className="space-y-1">
                {resolutionsLog.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    className="flex justify-between items-center text-[7px] text-[#9cacb4] bg-[#0b1015] p-1 border border-[#1b252d]"
                  >
                    <span className="text-[var(--green)] font-bold">[{r.threatType}]</span>
                    <span>{r.action}</span>
                    <span className="text-[#596872]">
                      {new Date(r.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
