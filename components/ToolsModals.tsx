'use client'

import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Database,
  ExternalLink,
  Flame,
  Globe,
  HardDrive,
  Info,
  Layers,
  Lock,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Wifi,
  X,
  Zap,
} from 'lucide-react'
import { useSiemStore } from '@/lib/store/useSiemStore'
import { CveDetails, ThreatSeverity } from '@/types/cyber'

// ==========================================
// 1. LAUNCH CVE SEARCH MODAL
// ==========================================
export function CveSearchModal({ onClose }: { onClose: () => void }) {
  const [cveId, setCveId] = useState('CVE-2025-0282')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<CveDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mitigated, setMitigated] = useState(false)
  const resolveIncident = useSiemStore((state) => state.resolveIncident)
  const setToast = useSiemStore((state) => state.setToast)

  async function handleSearch(targetId: string) {
    if (!targetId.trim()) return
    setLoading(true)
    setError(null)
    setMitigated(false)
    try {
      const res = await fetch(`/api/cve?id=${encodeURIComponent(targetId.trim())}`)
      const data = await res.json()
      if (data.found && data.cve) {
        setResult(data.cve)
      } else {
        setError(data.error || 'CVE identifier not found in intelligence database.')
        setResult(null)
      }
    } catch {
      setError('Telemetry link timed out. Verify network connection.')
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleSearch('CVE-2025-0282')
  }, [])

  const quickCves = ['CVE-2025-0282', 'CVE-2024-3400', 'CVE-2024-6387', 'CVE-2024-21887', 'CVE-2021-44228']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl border border-[var(--orange)] bg-[#0a0e13] text-[#e8edf1] shadow-2xl p-6 relative">
        <div className="flex items-center justify-between border-b border-[#28313a] pb-3 mb-4">
          <div className="flex items-center gap-2 font-black tracking-widest text-xs text-[var(--orange)]">
            <span className="w-2.5 h-2.5 bg-[var(--orange)] inline-block" />
            [NERV_INTEL // CISA_KEV_QUERY_TERMINAL]
          </div>
          <button
            onClick={onClose}
            className="text-[#71808a] hover:text-[var(--orange)] p-1 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input bar */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 flex items-center gap-2 border border-[#34414b] bg-[#07090d] px-3 py-2">
            <Search className="w-4 h-4 text-[var(--orange)]" />
            <input
              type="text"
              value={cveId}
              onChange={(e) => setCveId(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(cveId)}
              placeholder="ENTER CVE IDENTIFIER (e.g., CVE-2024-3400)..."
              className="w-full bg-transparent border-0 outline-none font-mono text-xs text-white uppercase tracking-wider"
            />
          </div>
          <button
            onClick={() => handleSearch(cveId)}
            disabled={loading}
            className="px-4 py-2 border border-[var(--orange)] bg-[var(--orange)]/10 text-[var(--orange)] font-bold text-xs hover:bg-[var(--orange)]/20 transition-all flex items-center gap-2"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'QUERY'}
          </button>
        </div>

        {/* Quick select pills */}
        <div className="flex flex-wrap gap-1.5 mb-4 text-[9px] text-[#71808a]">
          <span className="self-center mr-1">KEV_HOTLIST:</span>
          {quickCves.map((q) => (
            <button
              key={q}
              onClick={() => {
                setCveId(q)
                handleSearch(q)
              }}
              className={`px-2 py-0.5 border ${
                cveId === q
                  ? 'border-[var(--orange)] text-[var(--orange)] bg-[var(--orange)]/10'
                  : 'border-[#28313a] hover:border-[#48a9ff] text-[#a5b0b7]'
              }`}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Results */}
        {error && (
          <div className="p-3 border border-[var(--red)] bg-[var(--red)]/10 text-[var(--red)] text-xs font-mono">
            [MAGI_FAULT: {error}]
          </div>
        )}

        {result && (
          <div className="border border-[#202a31] bg-[#0c1016] p-4 text-xs font-mono space-y-3">
            <div className="flex items-start justify-between border-b border-[#202a31] pb-2">
              <div>
                <span className="text-[10px] text-[#71808a]">[CVE_ID]</span>
                <h3 className="text-sm font-bold text-[var(--orange)] tracking-wider">
                  {result.cveID}
                </h3>
                <div className="text-[10px] text-[#a5b0b7]">
                  {result.vendorProject} // {result.product}
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-2 py-0.5 text-[9px] font-bold ${
                    result.cvssScore && result.cvssScore >= 9.0
                      ? 'bg-[var(--red)] text-black'
                      : 'bg-[var(--orange)] text-black'
                  }`}
                >
                  CVSS {result.cvssScore?.toFixed(1) || 'CRITICAL'}
                </span>
                <div className="text-[8px] text-[#71808a] mt-1">
                  ADDED: {result.dateAdded}
                </div>
              </div>
            </div>

            <div>
              <div className="text-[9px] text-[#71808a] mb-1">[VULNERABILITY_TITLE]</div>
              <div className="text-[#e8edf1] font-semibold">{result.vulnerabilityName}</div>
            </div>

            <div>
              <div className="text-[9px] text-[#71808a] mb-1">[DESCRIPTION & THREAT IMPACT]</div>
              <p className="text-[11px] text-[#a5b0b7] leading-relaxed">
                {result.shortDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#202a31]">
              <div>
                <div className="text-[9px] text-[#71808a]">[RANSOMWARE_CAMPAIGN_USE]</div>
                <div className="text-[var(--red)] font-bold">
                  {result.knownRansomwareCampaignUse || 'ANALYSIS IN PROGRESS'}
                </div>
              </div>
              <div>
                <div className="text-[9px] text-[#71808a]">[REMEDIATION_DUE_DATE]</div>
                <div className="text-[var(--green)] font-bold">
                  {result.dueDate || 'IMMEDIATE ACTION MANDATED'}
                </div>
              </div>
            </div>

            <div className="border-t border-[#202a31] pt-2">
              <div className="text-[9px] text-[#71808a] mb-1">[TACTICAL_REMEDIATION_GUIDANCE]</div>
              <div className="text-[10px] text-[var(--green)] bg-[#07090d] p-2 border border-[#263039]">
                {result.requiredAction}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <a
                href={`https://nvd.nist.gov/vuln/detail/${result.cveID}`}
                target="_blank"
                rel="noreferrer"
                className="text-[9px] text-[#48a9ff] hover:underline flex items-center gap-1"
              >
                OPEN NVD SPECIFICATION <ArrowUpRight className="w-3 h-3" />
              </a>

              <button
                onClick={() => {
                  setMitigated(true)
                  resolveIncident(result.cveID, 'CISA_KEV_PATCH_DISPATCHED')
                  setToast(`[DISPATCHED] EMERGENCY DEFENSE APPLIED FOR ${result.cveID}`)
                }}
                disabled={mitigated}
                className={`px-3 py-1.5 text-[10px] font-bold border transition-all flex items-center gap-1.5 ${
                  mitigated
                    ? 'border-[var(--green)] bg-[var(--green)]/15 text-[var(--green)]'
                    : 'border-[var(--orange)] bg-[var(--orange)] text-black hover:bg-orange-500'
                }`}
              >
                {mitigated ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> PATCH RULE ACTIVATED
                  </>
                ) : (
                  <>
                    <Zap className="w-3 h-3" /> DISPATCH EMERGENCY RULE
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-[#202a31] flex justify-between items-center text-[9px] text-[#52616b]">
          <span>SOURCE: NATIONAL VULNERABILITY DATABASE / CISA KEV CATALOG</span>
          <button onClick={onClose} className="hover:text-white underline">
            CLOSE [ESC]
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 2. ACCESS THREAT LIBRARY (MITRE ATT&CK) MODAL
// ==========================================
const MITRE_TACTICS = [
  {
    tactic: 'TA0001: INITIAL ACCESS',
    techniques: [
      {
        id: 'T1190',
        name: 'Exploit Public-Facing Application',
        severity: 'CRITICAL',
        vector: 'Weaponizing unpatched perimeter edge appliances (VPN, Firewalls, Web Servers).',
        detection: 'Monitor anomalous inbound HTTP payloads, abnormal parent-child process spawns (e.g. nginx spawning sh).',
        countermeasure: 'Deploy WAF virtual patching, isolate edge services into DMZ VLAN, enforce zero-trust proxy.',
      },
      {
        id: 'T1566',
        name: 'Phishing: Spearphishing Attachment',
        severity: 'HIGH',
        vector: 'Delivery of weaponized Microsoft Office documents or ISO/LNK containers via targeted email.',
        detection: 'Inspect mail gateway quarantine logs, mark external banners, analyze Office macro execution telemetry.',
        countermeasure: 'Enforce FIDO2 webauthn hardware keys, block inbound executable extensions, sandbox attachments.',
      },
      {
        id: 'T1078',
        name: 'Valid Accounts: Cloud / VPN Access',
        severity: 'HIGH',
        vector: 'Adversary gains credentials via infostealers and authenticates directly into enterprise portals.',
        detection: 'Flag impossible travel velocity, anomalous user-agent strings, multiple MFA push denials.',
        countermeasure: 'Enforce conditional access policies, session token binding, and automated step-up verification.',
      },
    ],
  },
  {
    tactic: 'TA0002: EXECUTION',
    techniques: [
      {
        id: 'T1059.001',
        name: 'PowerShell / Scripting Interpreter',
        severity: 'HIGH',
        vector: 'Execution of encoded PowerShell commandlets to download second-stage payloads.',
        detection: 'Enable Script Block Logging (Event ID 4104), track unquoted base64 arguments in sysmon.',
        countermeasure: 'Enforce Constrained Language Mode (CLM) and AppLocker / WDAC code integrity policies.',
      },
      {
        id: 'T1204',
        name: 'User Execution: Malicious File',
        severity: 'MEDIUM',
        vector: 'Deceiving operator into running signed malicious binaries under guise of system utilities.',
        detection: 'Correlate Mark-of-the-Web (MOTW) zone tags with unsigned process creation.',
        countermeasure: 'Implement behavioral blocking on untrusted downloads, enforce EDR endpoint isolation.',
      },
    ],
  },
  {
    tactic: 'TA0005: DEFENSE EVASION',
    techniques: [
      {
        id: 'T1562.001',
        name: 'Impair Defenses: Disable Security Tools',
        severity: 'CRITICAL',
        vector: 'Adversaries terminate EDR services using BYOVD (Bring Your Own Vulnerable Driver).',
        detection: 'Alert on unauthorized driver loading events and service configuration tampering.',
        countermeasure: 'Enable Tamper Protection in EDR agents, enforce Windows HVCI (Hypervisor-Protected Code Integrity).',
      },
      {
        id: 'T1027',
        name: 'Obfuscated Files or Information',
        severity: 'HIGH',
        vector: 'Payloads packed with custom polymorphic crypters to evade static signature scanning.',
        detection: 'Evaluate file entropy metrics (> 7.2) and high Shannon entropy sections.',
        countermeasure: 'Leverage AMSI (Antimalware Scan Interface) memory scanning upon in-memory decryption.',
      },
    ],
  },
  {
    tactic: 'TA0040: IMPACT',
    techniques: [
      {
        id: 'T1486',
        name: 'Data Encrypted for Impact (Ransomware)',
        severity: 'CRITICAL',
        vector: 'High-speed multithreaded file encryption targeting local NTFS volumes and SMB network shares.',
        detection: 'Threshold alert on rapid rename/modification rate of user files (> 100 files/sec).',
        countermeasure: 'Trigger automated network isolation via EDR API, restore from immutable air-gapped backups.',
      },
      {
        id: 'T1498',
        name: 'Network Denial of Service',
        severity: 'MEDIUM',
        vector: 'Volumetric reflection attacks overwhelming edge bandwidth or stateful connection tables.',
        detection: 'BGP telemetry alerting on ingress threshold saturation over 100 Gbps.',
        countermeasure: 'Initiate automated Anycast BGP Flowspec route redirection to upstream DDoS scrubbing centers.',
      },
    ],
  },
]

export function ThreatLibraryModal({ onClose }: { onClose: () => void }) {
  const [filter, setFilter] = useState('')
  const [selectedTechnique, setSelectedTechnique] = useState(MITRE_TACTICS[0].techniques[0])

  const filteredTactics = MITRE_TACTICS.map((tact) => ({
    ...tact,
    techniques: tact.techniques.filter(
      (tech) =>
        tech.id.toLowerCase().includes(filter.toLowerCase()) ||
        tech.name.toLowerCase().includes(filter.toLowerCase()) ||
        tech.vector.toLowerCase().includes(filter.toLowerCase())
    ),
  })).filter((tact) => tact.techniques.length > 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[85vh] flex flex-col border border-[var(--orange)] bg-[#0a0e13] text-[#e8edf1] shadow-2xl p-6">
        <div className="flex items-center justify-between border-b border-[#28313a] pb-3 mb-4">
          <div className="flex items-center gap-2 font-black tracking-widest text-xs text-[var(--orange)]">
            <Layers className="w-4 h-4" />
            [NERV_TACTICAL_LIBRARY // MITRE_ATT&CK_MATRIX_v15]
          </div>
          <button onClick={onClose} className="text-[#71808a] hover:text-[var(--orange)] p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="flex items-center gap-2 border border-[#34414b] bg-[#07090d] px-3 py-2">
            <Search className="w-3.5 h-3.5 text-[var(--orange)]" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="SEARCH TECHNIQUES, IDs (T1190), OR VECTORS..."
              className="w-full bg-transparent border-0 outline-none font-mono text-xs text-white uppercase tracking-wider"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
          {/* Left: Technique browser */}
          <div className="border border-[#202a31] bg-[#0c1016] p-3 overflow-y-auto space-y-4">
            {filteredTactics.map((tact) => (
              <div key={tact.tactic} className="space-y-1.5">
                <div className="text-[10px] font-bold text-[var(--orange)] tracking-wider border-b border-[#202a31] pb-1">
                  {tact.tactic}
                </div>
                {tact.techniques.map((tech) => (
                  <button
                    key={tech.id}
                    onClick={() => setSelectedTechnique(tech)}
                    className={`w-full text-left p-2 border transition-all text-xs font-mono flex items-center justify-between ${
                      selectedTechnique.id === tech.id
                        ? 'border-[var(--orange)] bg-[var(--orange)]/15 text-white'
                        : 'border-[#1c262e] bg-[#07090d] text-[#a5b0b7] hover:border-[#35404a]'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-[var(--orange)] mr-2">[{tech.id}]</span>
                      <span>{tech.name}</span>
                    </div>
                    <span
                      className={`text-[8px] font-bold px-1.5 py-0.5 ${
                        tech.severity === 'CRITICAL'
                          ? 'bg-[var(--red)]/20 text-[var(--red)] border border-[var(--red)]/40'
                          : 'bg-[var(--orange)]/20 text-[var(--orange)] border border-[var(--orange)]/40'
                      }`}
                    >
                      {tech.severity}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Right: Technique details */}
          <div className="border border-[#202a31] bg-[#0c1016] p-4 overflow-y-auto font-mono text-xs space-y-3">
            <div className="border-b border-[#202a31] pb-2">
              <span className="text-[9px] text-[#71808a]">TECHNIQUE SPECIFICATION</span>
              <h3 className="text-sm font-bold text-[var(--orange)] mt-0.5">
                [{selectedTechnique.id}] {selectedTechnique.name}
              </h3>
            </div>

            <div>
              <div className="text-[9px] text-[#71808a] mb-1">[ADVERSARY EXECUTION PATTERN]</div>
              <p className="text-[11px] text-[#e8edf1] bg-[#07090d] p-2.5 border border-[#1e272f]">
                {selectedTechnique.vector}
              </p>
            </div>

            <div>
              <div className="text-[9px] text-[#71808a] mb-1">[DETECTION & TELEMETRY HEURISTICS]</div>
              <p className="text-[11px] text-[#48a9ff] bg-[#07090d] p-2.5 border border-[#1e272f]">
                {selectedTechnique.detection}
              </p>
            </div>

            <div>
              <div className="text-[9px] text-[#71808a] mb-1">[NERV SOC COUNTERMEASURE PLAYBOOK]</div>
              <p className="text-[11px] text-[var(--green)] bg-[#07090d] p-2.5 border border-[#1e272f]">
                {selectedTechnique.countermeasure}
              </p>
            </div>

            <div className="pt-2">
              <a
                href={`https://attack.mitre.org/techniques/${selectedTechnique.id.split('.')[0]}/`}
                target="_blank"
                rel="noreferrer"
                className="text-[9px] text-[var(--orange)] hover:underline flex items-center gap-1"
              >
                ACCESS MITRE ATT&CK REPOSITORY ENTRY <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#202a31] flex justify-between items-center text-[9px] text-[#52616b]">
          <span>FRAMEWORK: MITRE ATT&CK ENTERPRISE TACTICS / NERV DEFENSE MAPPING</span>
          <button onClick={onClose} className="hover:text-white underline">
            CLOSE [ESC]
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 3. RUN SYSTEM DIAG (MAGI CONSENSUS) MODAL
// ==========================================
export function SystemDiagModal({ onClose }: { onClose: () => void }) {
  const [running, setRunning] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const connectionStatus = useSiemStore((state) => state.connectionStatus)
  const attacksCount = useSiemStore((state) => state.attacks.length)
  const [browserStats, setBrowserStats] = useState({
    storageUsed: '0 KB',
    online: true,
    cores: 8,
    memory: 'N/A',
    resolution: '1920x1080',
    protocol: 'HTTP/2',
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storageEstimate = '0 KB'
      try {
        const total = JSON.stringify(localStorage).length
        storageEstimate = `${(total / 1024).toFixed(2)} KB`
      } catch {
        storageEstimate = 'N/A'
      }

      setBrowserStats({
        storageUsed: storageEstimate,
        online: navigator.onLine,
        cores: navigator.hardwareConcurrency || 8,
        memory: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : '4 GB',
        resolution: `${window.innerWidth}x${window.innerHeight}`,
        protocol: window.location.protocol.replace(':', '').toUpperCase(),
      })
    }
  }, [])

  function runDiagnostics() {
    setRunning(true)
    setLogs([])
    setProgress(0)

    const diagSteps = [
      `[MAGI_SYS_01: MELCHIOR-1] INITIATING NEURAL HARDWARE BUS AUDIT...`,
      `[MELCHIOR-1: NOMINAL] CPU CORES: ${browserStats.cores} // MEMORY THRESHOLD: ${browserStats.memory} ALLOCATED`,
      `[MAGI_SYS_02: BALTHASAR-2] INSPECTING TELEMETRY WEBSOCKET & SSE DATA LINE...`,
      `[BALTHASAR-2: NOMINAL] SSE STREAM: ${connectionStatus} // PACKET CACHE: ${attacksCount} EVENTS ACTIVE`,
      `[MAGI_SYS_03: CASPER-3] VERIFYING CRYPTOGRAPHIC ENCLAVE & STORAGE INTEGRITY...`,
      `[CASPER-3: NOMINAL] LOCALSTORAGE INTEGRITY: ${browserStats.storageUsed} ENCRYPTED BUFFER`,
      `[MAGI_SYS_CONSENSUS] MELCHIOR-1: AGREE // BALTHASAR-2: AGREE // CASPER-3: AGREE`,
      `[NERV_COMMAND] DIAGNOSTIC COMPLETE. ALL 3 MAGI ENGINES IN HARMONIOUS CONSENSUS. UPTIME 99.98%`,
    ]

    let current = 0
    const interval = setInterval(() => {
      if (current < diagSteps.length) {
        const step = diagSteps[current]
        setLogs((prev) => [...prev, step])
        current++
        setProgress(Math.round((current / diagSteps.length) * 100))
      } else {
        clearInterval(interval)
        setRunning(false)
      }
    }, 450)
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl border border-[var(--orange)] bg-[#0a0e13] text-[#e8edf1] shadow-2xl p-6">
        <div className="flex items-center justify-between border-b border-[#28313a] pb-3 mb-4">
          <div className="flex items-center gap-2 font-black tracking-widest text-xs text-[var(--orange)]">
            <Cpu className="w-4 h-4" />
            [NERV_SUPERCOMPUTER // MAGI_SYSTEM_DIAGNOSTIC]
          </div>
          <button onClick={onClose} className="text-[#71808a] hover:text-[var(--orange)] p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 MAGI Engines Status Cards */}
        <div className="grid grid-cols-3 gap-2 mb-4 font-mono">
          <div className="border border-[#202a31] bg-[#0c1016] p-2.5 text-center">
            <div className="text-[9px] text-[#71808a]">SUPERCOMPUTER 01</div>
            <div className="text-xs font-bold text-[var(--orange)] mt-0.5">MELCHIOR-1</div>
            <div className="text-[9px] text-[var(--green)] mt-1 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 bg-[var(--green)] rounded-full animate-ping" />
              AGREE (NOMINAL)
            </div>
          </div>
          <div className="border border-[#202a31] bg-[#0c1016] p-2.5 text-center">
            <div className="text-[9px] text-[#71808a]">SUPERCOMPUTER 02</div>
            <div className="text-xs font-bold text-[var(--orange)] mt-0.5">BALTHASAR-2</div>
            <div className="text-[9px] text-[var(--green)] mt-1 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 bg-[var(--green)] rounded-full animate-ping" />
              AGREE (NOMINAL)
            </div>
          </div>
          <div className="border border-[#202a31] bg-[#0c1016] p-2.5 text-center">
            <div className="text-[9px] text-[#71808a]">SUPERCOMPUTER 03</div>
            <div className="text-xs font-bold text-[var(--orange)] mt-0.5">CASPER-3</div>
            <div className="text-[9px] text-[var(--green)] mt-1 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 bg-[var(--green)] rounded-full animate-ping" />
              AGREE (NOMINAL)
            </div>
          </div>
        </div>

        {/* Terminal Screen */}
        <div className="border border-[#28313a] bg-[#07090d] p-3 font-mono text-[11px] h-52 overflow-y-auto space-y-1 text-green-400">
          <div className="text-[#71808a] border-b border-[#1c262e] pb-1 text-[9px]">
            CONSOLE: MAGI_NEURAL_BUS // TRACE LEVEL: TACTICAL
          </div>
          {logs.map((log, idx) => (
            <div
              key={idx}
              className={
                log.includes('FAULT')
                  ? 'text-[var(--red)]'
                  : log.includes('CONSENSUS')
                  ? 'text-[var(--orange)] font-bold'
                  : 'text-[#9cacb4]'
              }
            >
              {log}
            </div>
          ))}
          {running && (
            <div className="text-[var(--orange)] animate-pulse flex items-center gap-2">
              <RefreshCw className="w-3 h-3 animate-spin" /> PROBING TELEMETRY BUS...
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-3 flex items-center gap-3 font-mono text-[9px] text-[#71808a]">
          <span>DIAGNOSTIC_PROGRESS:</span>
          <div className="flex-1 h-2 bg-[#1c262e] border border-[#28343c]">
            <div
              className="h-full bg-[var(--orange)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-white font-bold">{progress}%</span>
        </div>

        <div className="mt-4 pt-3 border-t border-[#202a31] flex justify-between items-center text-[9px] text-[#52616b]">
          <button
            onClick={runDiagnostics}
            disabled={running}
            className="px-3 py-1 border border-[var(--orange)] bg-[var(--orange)]/10 text-[var(--orange)] font-mono text-xs hover:bg-[var(--orange)]/20 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${running ? 'animate-spin' : ''}`} />
            RE-RUN MAGI AUDIT
          </button>
          <button onClick={onClose} className="hover:text-white underline">
            CLOSE [ESC]
          </button>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 4. VIEW BEST PRACTICES (NIST / CIS CONTROLS) MODAL
// ==========================================
const CIS_CONTROLS = [
  {
    id: 'CIS-01',
    name: 'Inventory and Control of Enterprise Assets',
    category: 'BASIC',
    requirement: 'Actively manage and track all devices connected to the enterprise network.',
    nistMapping: 'ID.AM-01',
    implemented: true,
  },
  {
    id: 'CIS-02',
    name: 'Inventory and Control of Software Assets',
    category: 'BASIC',
    requirement: 'Actively manage all software so only authorized software can execute.',
    nistMapping: 'ID.AM-02',
    implemented: true,
  },
  {
    id: 'CIS-03',
    name: 'Data Protection & Encryption',
    category: 'BASIC',
    requirement: 'Identify, classify, and securely handle data in transit and at rest.',
    nistMapping: 'PR.DS-01',
    implemented: true,
  },
  {
    id: 'CIS-04',
    name: 'Secure Configuration of Enterprise Assets',
    category: 'FOUNDATIONAL',
    requirement: 'Establish and maintain hardened baseline configurations for servers and endpoints.',
    nistMapping: 'PR.IP-01',
    implemented: false,
  },
  {
    id: 'CIS-05',
    name: 'Account & Credential Management',
    category: 'FOUNDATIONAL',
    requirement: 'Use unique credentials, revoke dormant accounts, and enforce least privilege.',
    nistMapping: 'PR.AC-01',
    implemented: true,
  },
  {
    id: 'CIS-06',
    name: 'Access Control Management (MFA Enforcement)',
    category: 'FOUNDATIONAL',
    requirement: 'Mandate phishing-resistant multi-factor authentication on all remote access.',
    nistMapping: 'PR.AC-07',
    implemented: true,
  },
  {
    id: 'CIS-07',
    name: 'Continuous Vulnerability Management (CISA KEV)',
    category: 'FOUNDATIONAL',
    requirement: 'Remediate vulnerabilities listed in CISA KEV catalog within specified deadlines.',
    nistMapping: 'ID.RA-01',
    implemented: true,
  },
  {
    id: 'CIS-08',
    name: 'Audit Log Management & SIEM Centralization',
    category: 'FOUNDATIONAL',
    requirement: 'Collect, review, and retain audit logs to help detect and investigate cyber attacks.',
    nistMapping: 'DE.AE-03',
    implemented: true,
  },
  {
    id: 'CIS-10',
    name: 'Malware Defenses & EDR Orchestration',
    category: 'FOUNDATIONAL',
    requirement: 'Deploy automated anti-malware defense and behavioral endpoint detection tools.',
    nistMapping: 'DE.CM-04',
    implemented: true,
  },
  {
    id: 'CIS-17',
    name: 'Incident Response Management',
    category: 'ORGANIZATIONAL',
    requirement: 'Establish incident handling playbooks, roles, and disaster recovery workflows.',
    nistMapping: 'RS.RP-01',
    implemented: false,
  },
]

export function BestPracticesModal({ onClose }: { onClose: () => void }) {
  const [controls, setControls] = useState(CIS_CONTROLS)

  const toggleControl = (id: string) => {
    setControls((prev) =>
      prev.map((c) => (c.id === id ? { ...c, implemented: !c.implemented } : c))
    )
  }

  const score = Math.round(
    (controls.filter((c) => c.implemented).length / controls.length) * 100
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[85vh] flex flex-col border border-[var(--orange)] bg-[#0a0e13] text-[#e8edf1] shadow-2xl p-6">
        <div className="flex items-center justify-between border-b border-[#28313a] pb-3 mb-4">
          <div className="flex items-center gap-2 font-black tracking-widest text-xs text-[var(--orange)]">
            <ShieldCheck className="w-4 h-4 text-[var(--green)]" />
            [NERV_GOVERNANCE // NIST_CSF_2.0_&_CIS_CONTROLS_v8]
          </div>
          <button onClick={onClose} className="text-[#71808a] hover:text-[var(--orange)] p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Score banner */}
        <div className="border border-[#202a31] bg-[#0c1016] p-3 mb-4 flex items-center justify-between font-mono text-xs">
          <div>
            <div className="text-[9px] text-[#71808a]">COMPLIANCE SCORECARD</div>
            <div className="text-sm font-bold text-white">
              NIST CSF 2.0 DEFENSIVE POSTURE
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[9px] text-[#71808a]">COMPLIANCE</span>
              <div className="text-lg font-black text-[var(--green)]">{score}%</div>
            </div>
            <div className="w-24 h-2 bg-[#1c262e] border border-[#28343c]">
              <div
                className="h-full bg-[var(--green)] transition-all duration-300"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>

        {/* Controls list */}
        <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs pr-1">
          {controls.map((ctrl) => (
            <div
              key={ctrl.id}
              onClick={() => toggleControl(ctrl.id)}
              className={`p-3 border cursor-pointer transition-all flex items-start gap-3 ${
                ctrl.implemented
                  ? 'border-[#203929] bg-[#09150d] text-white'
                  : 'border-[#3a2020] bg-[#140909] text-[#9cacb4]'
              }`}
            >
              <div className="mt-0.5">
                <input
                  type="checkbox"
                  checked={ctrl.implemented}
                  onChange={() => toggleControl(ctrl.id)}
                  className="accent-[var(--green)] cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[var(--orange)]">
                    [{ctrl.id}] {ctrl.name}
                  </span>
                  <span className="text-[9px] text-[#71808a] border border-[#28313a] px-1.5 py-0.5">
                    NIST: {ctrl.nistMapping}
                  </span>
                </div>
                <p className="text-[10px] text-[#71808a] mt-1 leading-normal">
                  {ctrl.requirement}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-[#202a31] flex justify-between items-center text-[9px] text-[#52616b]">
          <span>SOURCE: CENTER FOR INTERNET SECURITY (CIS v8) / NIST CSF 2.0</span>
          <button onClick={onClose} className="hover:text-white underline">
            CLOSE [ESC]
          </button>
        </div>
      </div>
    </div>
  )
}
