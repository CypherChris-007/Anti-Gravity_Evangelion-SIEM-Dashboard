import { NextRequest } from 'next/server'
import { AttackEvent, ThreatSeverity, ThreatType } from '@/types/cyber'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Known geopolitical cyber hubs and operational targets
const CYBER_NODES = [
  { city: 'Beijing', country: 'CN', lat: 39.9042, lng: 116.4074 },
  { city: 'Moscow', country: 'RU', lat: 55.7558, lng: 37.6173 },
  { city: 'Pyongyang', country: 'KP', lat: 39.0392, lng: 125.7625 },
  { city: 'Tehran', country: 'IR', lat: 35.6892, lng: 51.3890 },
  { city: 'St. Petersburg', country: 'RU', lat: 59.9311, lng: 30.3609 },
  { city: 'Shanghai', country: 'CN', lat: 31.2304, lng: 121.4737 },
  { city: 'Washington D.C.', country: 'US', lat: 38.9072, lng: -77.0369 },
  { city: 'New York', country: 'US', lat: 40.7128, lng: -74.0060 },
  { city: 'London', country: 'GB', lat: 51.5074, lng: -0.1278 },
  { city: 'Frankfurt', country: 'DE', lat: 50.1109, lng: 8.6821 },
  { city: 'Tokyo', country: 'JP', lat: 35.6762, lng: 139.6503 },
  { city: 'Seoul', country: 'KR', lat: 37.5665, lng: 126.9780 },
  { city: 'Sydney', country: 'AU', lat: -33.8688, lng: 151.2093 },
  { city: 'Tel Aviv', country: 'IL', lat: 32.0853, lng: 34.7818 },
  { city: 'Singapore', country: 'SG', lat: 1.3521, lng: 103.8198 },
  { city: 'São Paulo', country: 'BR', lat: -23.5505, lng: -46.6333 },
  { city: 'Paris', country: 'FR', lat: 48.8566, lng: 2.3522 },
  { city: 'Warsaw', country: 'PL', lat: 52.2297, lng: 21.0122 },
  { city: 'Taipei', country: 'TW', lat: 25.0330, lng: 121.5654 },
]

const THREAT_CATALOG: Array<{
  type: ThreatType
  severity: ThreatSeverity
  vectors: string[]
  cves: string[]
}> = [
  {
    type: 'RANSOMWARE',
    severity: 'CRITICAL',
    vectors: [
      'LockBit 3.0 Encryptor Infiltration',
      'Akira Double-Extortion Pipeline',
      'BlackCat/ALPHV ESXi Hypervisor Payload',
      'Phobos Shadow-Copy Wipe Routine',
    ],
    cves: ['CVE-2024-3400', 'CVE-2023-38606', 'CVE-2024-21887'],
  },
  {
    type: 'ZERO_DAY',
    severity: 'CRITICAL',
    vectors: [
      'Unauthenticated RCE in Edge Gateway',
      'Kernel Memory Corruption via eBPF',
      'HTTP/2 Rapid Reset Zero-Day Probe',
      'SSL-VPN Bypass Authentication Heap Overflow',
    ],
    cves: ['CVE-2025-0282', 'CVE-2024-6387', 'CVE-2024-4577'],
  },
  {
    type: 'MALWARE',
    severity: 'HIGH',
    vectors: [
      'FrostyGoop OT ICS Industrial Sabotage',
      'QakBot Loader Dropper Ingress',
      'RedLine Stealer Credential Harvester',
      'Sliver C2 Beacon Command Injection',
    ],
    cves: ['CVE-2024-27198', 'CVE-2023-46805'],
  },
  {
    type: 'EXPLOIT',
    severity: 'HIGH',
    vectors: [
      'T1190 Exploit Public-Facing Application',
      'Log4Shell JNDI Lookup Ingestion',
      'Spring4Shell Remote Code Injection',
      'Atlassian Confluence Template Injection',
    ],
    cves: ['CVE-2021-44228', 'CVE-2022-26134', 'CVE-2024-21762'],
  },
  {
    type: 'BOTNET',
    severity: 'MEDIUM',
    vectors: [
      'Mirai IoT Telnet Scanning Sweep',
      'Mozi P2P DHT Network Infiltration',
      'Andoryu Botnet SOCKS5 Proxy Relay',
    ],
    cves: ['CVE-2023-1389', 'CVE-2024-7029'],
  },
  {
    type: 'PHISHING',
    severity: 'MEDIUM',
    vectors: [
      'Device Code OAuth Token Exfiltration',
      'Evilginx Reverse-Proxy AiTM Session Hijack',
      'Spearphishing Attachment PDF Macro Injection',
    ],
    cves: [],
  },
  {
    type: 'DDoS',
    severity: 'LOW',
    vectors: [
      'DNS Amplification Flood (120 Gbps)',
      'SYN Flood targeting Kubernetes Ingress',
      'NTP Monlist Reflection Surge',
    ],
    cves: [],
  },
]

function generateAttack(index = 0): AttackEvent {
  const origin = CYBER_NODES[Math.floor(Math.random() * CYBER_NODES.length)]
  let target = CYBER_NODES[Math.floor(Math.random() * CYBER_NODES.length)]
  while (target.city === origin.city) {
    target = CYBER_NODES[Math.floor(Math.random() * CYBER_NODES.length)]
  }

  const catalogItem = THREAT_CATALOG[Math.floor(Math.random() * THREAT_CATALOG.length)]
  const vector = catalogItem.vectors[Math.floor(Math.random() * catalogItem.vectors.length)]
  const cve = catalogItem.cves.length > 0
    ? catalogItem.cves[Math.floor(Math.random() * catalogItem.cves.length)]
    : undefined

  const jitterLat = (Math.random() - 0.5) * 1.5
  const jitterLng = (Math.random() - 0.5) * 1.5

  const now = new Date()
  const offsetSeconds = index * 4
  const timestamp = new Date(now.getTime() - offsetSeconds * 1000).toISOString()

  return {
    id: `ATK-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`,
    timestamp,
    originCountry: origin.country,
    originCity: origin.city,
    targetCountry: target.country,
    targetCity: target.city,
    startLat: Number((origin.lat + jitterLat).toFixed(4)),
    startLng: Number((origin.lng + jitterLng).toFixed(4)),
    endLat: Number((target.lat + jitterLat).toFixed(4)),
    endLng: Number((target.lng + jitterLng).toFixed(4)),
    threatType: catalogItem.type,
    severity: catalogItem.severity,
    threatVector: vector,
    latency: Math.floor(Math.random() * 85 + 12), // 12 - 97ms
    status: Math.random() > 0.35 ? 'ACTIVE' : 'BLOCKED',
    cveId: cve,
  }
}

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial snapshot of recent attacks for immediate telemetry populate
      const initialBurst: AttackEvent[] = []
      for (let i = 8; i >= 0; i--) {
        initialBurst.push(generateAttack(i))
      }

      // Initial batch delivery
      const burstPayload = `event: initial\ndata: ${JSON.stringify(initialBurst)}\n\n`
      controller.enqueue(encoder.encode(burstPayload))

      // 2. Stream interval: push real-time attacks every 1800ms
      const interval = setInterval(() => {
        try {
          const nextEvent = generateAttack(0)
          const message = `event: attack\ndata: ${JSON.stringify(nextEvent)}\n\n`
          controller.enqueue(encoder.encode(message))
        } catch {
          clearInterval(interval)
        }
      }, 1900)

      // Keepalive heartbeat every 15 seconds
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'))
        } catch {
          clearInterval(heartbeat)
        }
      }, 15000)

      req.signal.addEventListener('abort', () => {
        clearInterval(interval)
        clearInterval(heartbeat)
        try {
          controller.close()
        } catch {
          // ignore already closed
        }
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform, no-store',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
