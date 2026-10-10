'use client'

import useSWR from 'swr'
import {
  ArrowUpRight,
  ExternalLink,
  Flame,
  Radio,
  RefreshCw,
  Search,
  ShieldAlert,
} from 'lucide-react'
import { useSiemStore } from '@/lib/store/useSiemStore'
import { OsintItem } from '@/types/cyber'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function NewsSection() {
  const searchQuery = useSiemStore((state) => state.searchQuery)
  const setSelectedAttack = useSiemStore((state) => state.setSelectedAttack)
  const setActiveModal = useSiemStore((state) => state.setActiveModal)

  // SWR query with automatic 15-minute revalidation and live search filtering
  const apiUrl = searchQuery
    ? `/api/osint/news?q=${encodeURIComponent(searchQuery)}`
    : '/api/osint/news'

  const { data, error, isLoading, mutate } = useSWR(apiUrl, fetcher, {
    refreshInterval: 15 * 60 * 1000, // 15 minutes
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  const newsItems: OsintItem[] = data?.news || []

  return (
    <div className="flex flex-col h-full font-mono text-xs">
      {/* Feed Column Headers */}
      <div className="feed-head !py-2 !px-3 border-b border-[#202a31] text-[7px] text-[#53636d] flex justify-between items-center">
        <div className="grid grid-cols-[70px_90px_1fr] gap-2 flex-1">
          <span>[TIMESTAMP]</span>
          <span>[THREAT_TYPE]</span>
          <span>[INTELLIGENCE SOURCE & HEADLINE]</span>
        </div>
        <button
          onClick={() => mutate()}
          title="Force refresh OSINT cache"
          className="text-[#53636d] hover:text-[var(--orange)] p-0.5"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Feed List */}
      <div className="feed-list flex-1 overflow-y-auto max-h-[190px] !px-3 divide-y divide-[#1b242c]">
        {isLoading && newsItems.length === 0 ? (
          <div className="py-6 text-center text-[var(--orange)] flex items-center justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            SYNCHRONIZING WITH CISA KEV & ALIENVAULT FEEDS...
          </div>
        ) : newsItems.length === 0 ? (
          <div className="py-6 text-center text-[#71808a]">
            NO OSINT ADVISORIES MATCH QUERY &quot;{searchQuery}&quot;
          </div>
        ) : (
          newsItems.map((item) => {
            const isCritical = item.severity === 'CRITICAL'
            const formattedTime = new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })

            return (
              <div
                key={item.id}
                className="py-2 grid grid-cols-[70px_90px_1fr] gap-2 items-center hover:bg-[#0c1218] transition-colors text-[8px]"
              >
                <time className="text-[#81919a]">{formattedTime}</time>

                <b
                  className={`truncate ${
                    isCritical ? 'text-[var(--red)] font-black' : 'text-[var(--orange)]'
                  }`}
                >
                  [{item.threatType}]
                </b>

                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="truncate flex-1">
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#e8edf1] hover:text-[var(--orange)] transition-colors inline-block truncate max-w-[280px]"
                      title={item.summary}
                    >
                      {item.title}
                    </a>
                    {item.cveId && (
                      <span className="ml-1.5 text-[7px] text-[#48a9ff] bg-[#48a9ff]/10 px-1 py-0.2 border border-[#48a9ff]/30">
                        {item.cveId}
                      </span>
                    )}
                  </div>

                  <small className="text-[#667782] text-[7px] whitespace-nowrap flex items-center gap-1 flex-shrink-0">
                    {item.sourceFeed}
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] inline-block" />
                  </small>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer with sync status */}
      <div className="feed-footer !py-2 !px-3 !mt-0 flex items-center justify-between text-[7px] text-[#62727b] border-t border-[#202a31]">
        <div className="flex items-center gap-1.5">
          <span className="status-dot green" />
          <span>
            STREAMING // {newsItems.length} ADVISORIES ACTIVE // CACHE TTL:{' '}
            {data?.ttlSeconds ? `${Math.round(data.ttlSeconds / 60)}M` : '15M'}
          </span>
        </div>
        <button
          onClick={() => setActiveModal('CVE_SEARCH')}
          className="text-[var(--orange)] hover:underline flex items-center gap-1"
        >
          QUERY KEV DATABASE <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
