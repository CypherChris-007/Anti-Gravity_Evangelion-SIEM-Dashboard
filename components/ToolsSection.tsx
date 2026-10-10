'use client'

import {
  BookOpen,
  ChevronRight,
  Gauge,
  Search,
  ShieldCheck,
  Terminal,
} from 'lucide-react'
import { useSiemStore } from '@/lib/store/useSiemStore'

export function ToolsSection() {
  const setActiveModal = useSiemStore((state) => state.setActiveModal)
  const setToast = useSiemStore((state) => state.setToast)

  const tools = [
    {
      id: 'CVE_SEARCH',
      label: 'LAUNCH_CVE_SEARCH',
      icon: Search,
      tag: 'NVD / CISA KEV',
    },
    {
      id: 'THREAT_LIBRARY',
      label: 'ACCESS_THREAT_LIBRARY',
      icon: BookOpen,
      tag: 'MITRE ATT&CK',
    },
    {
      id: 'SYSTEM_DIAG',
      label: 'RUN_SYSTEM_DIAG',
      icon: Gauge,
      tag: 'MAGI CONSENSUS',
    },
    {
      id: 'BEST_PRACTICES',
      label: 'VIEW_BEST_PRACTICES',
      icon: ShieldCheck,
      tag: 'NIST / CIS v8',
    },
  ] as const

  const handleLaunch = (id: typeof tools[number]['id'], label: string) => {
    setActiveModal(id)
    setToast(`${label} // ACTIVE TERMINAL ENGAGED`)
  }

  return (
    <div className="flex flex-col justify-between h-full font-mono">
      <div className="tool-list !p-3 grid grid-cols-2 gap-2">
        {tools.map(({ id, label, icon: Icon, tag }) => (
          <button
            key={id}
            onClick={() => handleLaunch(id, label)}
            className="flex items-center gap-2 p-2.5 border border-[#28343d] bg-[#0b1015] hover:border-[var(--orange)] hover:bg-[#121921] text-[#a5b0b6] hover:text-[var(--orange)] text-left transition-all group"
          >
            <Icon className="w-3.5 h-3.5 text-[var(--orange)] flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="block text-[8px] font-bold tracking-wider text-white group-hover:text-[var(--orange)] truncate">
                {label}
              </span>
              <span className="block text-[7px] text-[#5e717e] mt-0.5">{tag}</span>
            </div>
            <ChevronRight className="w-3 h-3 text-[#46555e] group-hover:text-[var(--orange)] group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
          </button>
        ))}
      </div>

      <div className="utility-status !p-2.5 !mt-0 border-t border-[#202a31] text-[8px] text-[var(--green)] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Terminal className="w-3 h-3" />
          <span>ALL TACTICAL UTILITIES NOMINAL</span>
        </div>
        <span className="text-[#566670]">99.98% UPTIME // AIR-GAPPED</span>
      </div>
    </div>
  )
}
