'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AttackEvent, OperatorBadge, ResolutionLog, ThreatType } from '@/types/cyber'

const INITIAL_BADGES: OperatorBadge[] = [
  {
    id: 'FIRST_DEFENDER',
    name: 'FIRST DEFENDER',
    description: 'Neutralized first perimeter intrusion event.',
    icon: 'Shield',
    unlocked: true,
    unlockedAt: '2026-02-01',
  },
  {
    id: 'MAGI_SYNC_MASTER',
    name: 'MAGI SYNC MASTER',
    description: 'Maintained operator neural synchronization above 85%.',
    icon: 'Brain',
    unlocked: true,
    unlockedAt: '2026-03-12',
  },
  {
    id: 'ZERO_DAY_HUNTER',
    name: 'ZERO-DAY HUNTER',
    description: 'Successfully isolated an unauthenticated zero-day exploit payload.',
    icon: 'Crosshair',
    unlocked: false,
  },
  {
    id: 'ANGEL_INTERCEPTOR',
    name: 'ANGEL INTERCEPTOR',
    description: 'Thwarted 5 simultaneous critical ransomware campaigns.',
    icon: 'Zap',
    unlocked: false,
  },
  {
    id: 'KEV_HARVESTER',
    name: 'KEV HARVESTER',
    description: 'Investigated CISA KEV catalog telemetry and mitigated edge risks.',
    icon: 'Database',
    unlocked: false,
  },
]

export interface SiemState {
  // Telemetry stream
  attacks: AttackEvent[]
  lastTenLedger: AttackEvent[]
  activeThreatsCount: number
  blockedEvents24h: number
  activeCveAlerts: number
  histogramBars: number[]
  connectionStatus: 'CONNECTED' | 'RECONNECTING' | 'OFFLINE'
  currentActiveArc: AttackEvent | null

  // Universal Search & Filter
  searchQuery: string
  selectedAttack: AttackEvent | null

  // Interactive Tactical Modals
  activeModal: 'CVE_SEARCH' | 'THREAT_LIBRARY' | 'SYSTEM_DIAG' | 'BEST_PRACTICES' | null
  toast: string | null

  // Operator Persistent Profile
  missionsCompleted: number
  recentResolutions: number
  skillRating: number
  syncRating: number
  operatorLevel: number
  badges: OperatorBadge[]
  resolutionsLog: ResolutionLog[]

  // Actions
  setConnectionStatus: (status: 'CONNECTED' | 'RECONNECTING' | 'OFFLINE') => void
  setInitialAttacks: (attacks: AttackEvent[]) => void
  addAttack: (attack: AttackEvent) => void
  resolveIncident: (attackId: string, customAction?: string) => { success: boolean; message: string }
  setSearchQuery: (query: string) => void
  setSelectedAttack: (attack: AttackEvent | null) => void
  setActiveModal: (modal: 'CVE_SEARCH' | 'THREAT_LIBRARY' | 'SYSTEM_DIAG' | 'BEST_PRACTICES' | null) => void
  setToast: (msg: string | null) => void
}

export const useSiemStore = create<SiemState>()(
  persist(
    (set, get) => ({
      attacks: [],
      lastTenLedger: [],
      activeThreatsCount: 1248,
      blockedEvents24h: 84392,
      activeCveAlerts: 73,
      histogramBars: [24, 37, 28, 48, 35, 62, 44, 78, 52, 68, 84, 57, 92, 66, 75, 88, 61, 96, 72, 84, 58, 69, 82, 93],
      connectionStatus: 'CONNECTED',
      currentActiveArc: null,

      searchQuery: '',
      selectedAttack: null,
      activeModal: null,
      toast: null,

      // Operator Profile state (persisted)
      missionsCompleted: 124,
      recentResolutions: 14,
      skillRating: 87.4,
      syncRating: 87.0,
      operatorLevel: 7,
      badges: INITIAL_BADGES,
      resolutionsLog: [
        {
          id: 'RES-001',
          threatId: 'ATK-PREV-891',
          threatType: 'RANSOMWARE',
          targetCountry: 'US',
          action: 'EDR_QUARANTINE_ISOLATE',
          timestamp: '2026-10-09T21:40:00Z',
          operator: 'EVA_OPERATOR_01',
        },
        {
          id: 'RES-002',
          threatId: 'ATK-PREV-742',
          threatType: 'EXPLOIT',
          targetCountry: 'DE',
          action: 'WAF_RATE_LIMIT_DROP',
          timestamp: '2026-10-09T21:45:00Z',
          operator: 'EVA_OPERATOR_01',
        },
      ],

      setConnectionStatus: (status) => set({ connectionStatus: status }),

      setInitialAttacks: (incoming) => {
        set((state) => {
          const attacks = [...incoming]
          const ledger = incoming.slice(0, 10)
          const activeCount = incoming.filter((a) => a.status === 'ACTIVE').length
          return {
            attacks,
            lastTenLedger: ledger,
            currentActiveArc: incoming[0] || null,
            activeThreatsCount: Math.max(state.activeThreatsCount, 1200 + activeCount),
          }
        })
      },

      addAttack: (attack) => {
        set((state) => {
          const newAttacks = [attack, ...state.attacks].slice(0, 80)
          const newLedger = [attack, ...state.lastTenLedger].slice(0, 10)

          // Increment blocked events if status blocked
          const blockedInc = attack.status === 'BLOCKED' ? 1 : 0
          const activeInc = attack.status === 'ACTIVE' ? 1 : 0

          // Dynamically adjust histogram: push small delta to latest bar
          const updatedBars = [...state.histogramBars]
          const lastIdx = updatedBars.length - 1
          updatedBars[lastIdx] = Math.min(100, Math.max(20, updatedBars[lastIdx] + (Math.random() > 0.5 ? 2 : -1)))

          return {
            attacks: newAttacks,
            lastTenLedger: newLedger,
            currentActiveArc: attack,
            blockedEvents24h: state.blockedEvents24h + blockedInc,
            activeThreatsCount: state.activeThreatsCount + activeInc,
            histogramBars: updatedBars,
          }
        })
      },

      resolveIncident: (attackId, customAction) => {
        const state = get()
        const target = state.attacks.find((a) => a.id === attackId)

        if (!target) {
          // Fallback if not found in current buffer
          const newCompleted = state.missionsCompleted + 1
          const newRecent = state.recentResolutions + 1
          const newSync = Math.min(100, +(state.syncRating + 0.5).toFixed(1))
          const newSkill = +(state.skillRating + 0.3).toFixed(1)
          const newLevel = 7 + Math.floor(newRecent / 5)

          set({
            activeThreatsCount: Math.max(0, state.activeThreatsCount - 1),
            missionsCompleted: newCompleted,
            recentResolutions: newRecent,
            syncRating: newSync,
            skillRating: newSkill,
            operatorLevel: newLevel,
          })
          return { success: true, message: `INCIDENT [${attackId}] RESOLVED // PERIMETER RESTORED` }
        }

        const actionTaken = customAction || (target.threatType === 'RANSOMWARE' ? 'ISOLATE_HOST_REVOKE_CREDS' : 'BGP_BLACKHOLE_APPLY_ACL')

        // Update attack status to RESOLVED
        const updatedAttacks = state.attacks.map((a) =>
          a.id === attackId ? { ...a, status: 'RESOLVED' as const } : a
        )

        const newCompleted = state.missionsCompleted + 1
        const newRecent = state.recentResolutions + 1
        const newSync = Math.min(100, +(state.syncRating + 0.8).toFixed(1))
        const newSkill = +(state.skillRating + 0.4).toFixed(1)
        const newLevel = 7 + Math.floor(newRecent / 5)

        // Check badge unlocks
        const updatedBadges = state.badges.map((b) => {
          if (b.id === 'ZERO_DAY_HUNTER' && (target.threatType === 'ZERO_DAY' || target.severity === 'CRITICAL')) {
            return { ...b, unlocked: true, unlockedAt: new Date().toISOString().split('T')[0] }
          }
          if (b.id === 'ANGEL_INTERCEPTOR' && newRecent >= 18) {
            return { ...b, unlocked: true, unlockedAt: new Date().toISOString().split('T')[0] }
          }
          if (b.id === 'KEV_HARVESTER' && target.cveId) {
            return { ...b, unlocked: true, unlockedAt: new Date().toISOString().split('T')[0] }
          }
          return b
        })

        const newLogEntry: ResolutionLog = {
          id: `RES-${Date.now().toString(36).toUpperCase()}`,
          threatId: target.id,
          threatType: target.threatType,
          targetCountry: target.targetCountry,
          action: actionTaken,
          timestamp: new Date().toISOString(),
          operator: 'EVA_OPERATOR_01',
        }

        set({
          attacks: updatedAttacks,
          activeThreatsCount: Math.max(0, state.activeThreatsCount - 1),
          missionsCompleted: newCompleted,
          recentResolutions: newRecent,
          syncRating: newSync,
          skillRating: newSkill,
          operatorLevel: newLevel,
          badges: updatedBadges,
          resolutionsLog: [newLogEntry, ...state.resolutionsLog].slice(0, 30),
        })

        return {
          success: true,
          message: `INCIDENT [${target.id}] // VECTOR: ${target.threatType} // RESOLVED VIA ${actionTaken}`,
        }
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedAttack: (attack) => set({ selectedAttack: attack }),
      setActiveModal: (modal) => set({ activeModal: modal }),
      setToast: (toast) => set({ toast }),
    }),
    {
      name: 'nerv_siem_operator_store',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : ({} as any))),
      partialize: (state) => ({
        missionsCompleted: state.missionsCompleted,
        recentResolutions: state.recentResolutions,
        skillRating: state.skillRating,
        syncRating: state.syncRating,
        operatorLevel: state.operatorLevel,
        badges: state.badges,
        resolutionsLog: state.resolutionsLog,
      }),
    }
  )
)
