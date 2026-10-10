export type ThreatSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export type ThreatType =
  | 'MALWARE'
  | 'RANSOMWARE'
  | 'PHISHING'
  | 'EXPLOIT'
  | 'BOTNET'
  | 'DDoS'
  | 'ZERO_DAY'

export interface AttackEvent {
  id: string
  timestamp: string
  originCountry: string
  originCity: string
  targetCountry: string
  targetCity: string
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  threatType: ThreatType
  severity: ThreatSeverity
  threatVector: string
  latency: number
  status: 'ACTIVE' | 'BLOCKED' | 'INVESTIGATING' | 'RESOLVED'
  cveId?: string
}

export interface OsintItem {
  id: string
  timestamp: string
  title: string
  threatType: string
  severity: ThreatSeverity
  sourceUrl: string
  sourceFeed: string
  summary: string
  cveId?: string
  dateAdded?: string
}

export interface OperatorBadge {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
}

export interface ResolutionLog {
  id: string
  threatId: string
  threatType: ThreatType
  targetCountry: string
  action: string
  timestamp: string
  operator: string
}

export interface CveDetails {
  cveID: string
  vendorProject: string
  product: string
  vulnerabilityName: string
  dateAdded: string
  shortDescription: string
  requiredAction: string
  dueDate?: string
  knownRansomwareCampaignUse?: string
  notes?: string
  cvssScore?: number
  severity?: ThreatSeverity
}
