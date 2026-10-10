'use client'

import { useEffect, useState } from 'react'
import {
  Activity,
  ChevronRight,
  CircleDot,
  Database,
  LockKeyhole,
  Menu,
  Search,
  Settings2,
  X,
} from 'lucide-react'
import { useSiemStore } from '@/lib/store/useSiemStore'
import { useAttackStream } from '@/lib/hooks/useAttackStream'
import { EarthSection } from '@/components/EarthSection'
import { MetricsSection } from '@/components/MetricsSection'
import { NewsSection } from '@/components/NewsSection'
import { ToolsSection } from '@/components/ToolsSection'
import { ProfileSection } from '@/components/ProfileSection'
import {
  BestPracticesModal,
  CveSearchModal,
  SystemDiagModal,
  ThreatLibraryModal,
} from '@/components/ToolsModals'

function Panel({
  title,
  tag,
  children,
  className = '',
}: {
  title: string
  tag?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-head">
        <div className="panel-title flex items-center">
          <span className="panel-mark" />
          {title}
        </div>
        {tag && <span className="panel-tag">[{tag}]</span>}
      </div>
      {children}
    </section>
  )
}

export default function Page() {
  // Connect to SSE Attack Stream daemon
  useAttackStream()

  const searchQuery = useSiemStore((state) => state.searchQuery)
  const setSearchQuery = useSiemStore((state) => state.setSearchQuery)
  const connectionStatus = useSiemStore((state) => state.connectionStatus)
  const activeModal = useSiemStore((state) => state.activeModal)
  const setActiveModal = useSiemStore((state) => state.setActiveModal)
  const toast = useSiemStore((state) => state.toast)
  const setToast = useSiemStore((state) => state.setToast)

  const [menuOpen, setMenuOpen] = useState(false)
  const [utcTime, setUtcTime] = useState('00:00:00 UTC')

  // Live UTC Clock
  useEffect(() => {
    function updateClock() {
      const now = new Date()
      const timeStr = now.toTimeString().split(' ')[0] + ' UTC'
      setUtcTime(timeStr)
    }
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toast, setToast])

  // Keyboard shortcut: ⌘K or Ctrl+K to focus search, ESC to close modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const el = document.getElementById('telemetry-search-input')
        el?.focus()
      }
      if (e.key === 'Escape') {
        if (activeModal) {
          setActiveModal(null)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeModal, setActiveModal])

  return (
    <main className="command-center font-mono">
      {/* Top Brand & Status Bar */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-symbol">N</div>
          <div>
            <div className="brand-name">
              NERV<span>///</span>NET
            </div>
            <div className="brand-sub">TACTICAL INTELLIGENCE SYSTEM</div>
          </div>
        </div>

        <div className="header-status flex items-center">
          <span
            className={`status-dot ${
              connectionStatus === 'CONNECTED' ? 'green' : ''
            }`}
          />
          MAGI_STATUS:{' '}
          <b className={connectionStatus === 'CONNECTED' ? 'text-[var(--green)]' : 'orange'}>
            {connectionStatus}
          </b>
          <span className="divider" />
          DEPLOY_CODE: <b className="orange">NERV-01</b>
        </div>

        <button
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <Menu />
        </button>

        <div className={`user-chip ${menuOpen ? 'open' : ''}`}>
          <div className="avatar">EO</div>
          <div>
            <strong>EVA_OPERATOR_01</strong>
            <small>CLEARANCE: MAGI</small>
          </div>
          <ChevronRight />
        </div>
      </header>

      {/* Universal Search and UTC Time Row */}
      <div className="command-row">
        <div className="command-input">
          <Search />
          <input
            id="telemetry-search-input"
            aria-label="Command or search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ENTER_COMMAND_OR_SEARCH (CVE, VECTOR, COUNTRY, INTEL)..."
          />
          {searchQuery ? (
            <X
              className="w-3.5 h-3.5 text-[#71808a] hover:text-[var(--orange)] cursor-pointer"
              onClick={() => setSearchQuery('')}
            />
          ) : (
            <kbd>⌘ K</kbd>
          )}
        </div>

        <div className="system-time">
          <span className="status-dot green" />
          SYSTEM_TIME <b>{utcTime}</b>
        </div>
      </div>

      {/* Active Search Filter Banner */}
      {searchQuery && (
        <div className="search-result flex items-center justify-between">
          <div>
            SEARCHING ALL TELEMETRY & OSINT ADVISORIES FOR: <b>{searchQuery.toUpperCase()}</b>
          </div>
          <X className="cursor-pointer" onClick={() => setSearchQuery('')} />
        </div>
      )}

      {/* Main 5-Panel Tactical Grid */}
      <div className="dashboard-grid">
        {/* SECTION 1: "EARTH" (Global Threat Visualization) */}
        <Panel
          title="EARTH // GLOBAL VIEW"
          tag="THREAT_SURFACE"
          className="earth-panel flex flex-col justify-between"
        >
          <EarthSection />
        </Panel>

        {/* SECTION 2: "DASHBOARD OF CURRENT ATTACKS" (SIEM Metrics & Analytics) */}
        <Panel
          title="DASHBOARD OF CURRENT ATTACKS"
          tag="SIEM_CORE"
          className="metrics-panel"
        >
          <MetricsSection />
        </Panel>

        {/* SECTION 3: "TOP NEWS & OSINT" (Live Threat Feeds) */}
        <Panel
          title="TOP NEWS: CURRENT ATTACKS"
          tag="OSINT_FEED"
          className="news-panel"
        >
          <NewsSection />
        </Panel>

        {/* SECTION 4: "OTHER TOOLS" (Tactical Cyber Utilities) */}
        <Panel
          title="OTHER TOOLS & INFORMED USER"
          tag="UTILITY_DECK"
          className="tools-panel"
        >
          <ToolsSection />
        </Panel>

        {/* SECTION 5: "USER ACCOMPLISHMENTS" (Operator Profile & Stats) */}
        <Panel
          title="USER ACCOMPLISHMENTS"
          tag="OPERATOR_PROFILE"
          className="profile-panel"
        >
          <ProfileSection />
        </Panel>
      </div>

      {/* Footer */}
      <footer>
        <span>
          <Activity /> NERV NET // COMMAND CENTER V2.7.4
        </span>
        <span>
          <LockKeyhole /> ENCRYPTED CONNECTION // TLS 1.3
        </span>
        <span>
          <Database /> DATA RETENTION: 90 DAYS
        </span>
        <span>
          <Settings2 /> CONFIG // ZERO_DAY_DEFENSE
        </span>
      </footer>

      {/* Toast Notification */}
      {toast && (
        <div className="toast animate-in fade-in slide-in-from-bottom-2">
          <CircleDot />
          {toast}
        </div>
      )}

      {/* SECTION 4 Interactive Utility Modals */}
      {activeModal === 'CVE_SEARCH' && (
        <CveSearchModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'THREAT_LIBRARY' && (
        <ThreatLibraryModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'SYSTEM_DIAG' && (
        <SystemDiagModal onClose={() => setActiveModal(null)} />
      )}
      {activeModal === 'BEST_PRACTICES' && (
        <BestPracticesModal onClose={() => setActiveModal(null)} />
      )}
    </main>
  )
}
