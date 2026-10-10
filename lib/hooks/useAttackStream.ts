'use client'

import { useEffect, useRef } from 'react'
import { useSiemStore } from '@/lib/store/useSiemStore'
import { AttackEvent } from '@/types/cyber'

export function useAttackStream() {
  const addAttack = useSiemStore((state) => state.addAttack)
  const setInitialAttacks = useSiemStore((state) => state.setInitialAttacks)
  const setConnectionStatus = useSiemStore((state) => state.setConnectionStatus)
  const eventSourceRef = useRef<EventSource | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let isMounted = true

    function connect() {
      if (!isMounted) return

      try {
        const es = new EventSource('/api/stream/attacks')
        eventSourceRef.current = es

        es.onopen = () => {
          if (!isMounted) return
          setConnectionStatus('CONNECTED')
        }

        es.addEventListener('initial', (e: MessageEvent) => {
          if (!isMounted) return
          try {
            const data: AttackEvent[] = JSON.parse(e.data)
            setInitialAttacks(data)
          } catch (err) {
            console.error('Failed to parse initial attack stream payload:', err)
          }
        })

        es.addEventListener('attack', (e: MessageEvent) => {
          if (!isMounted) return
          try {
            const data: AttackEvent = JSON.parse(e.data)
            addAttack(data)
          } catch (err) {
            console.error('Failed to parse attack event:', err)
          }
        })

        es.onerror = () => {
          if (!isMounted) return
          setConnectionStatus('RECONNECTING')
          es.close()
          eventSourceRef.current = null

          // Exponential backoff reconnect
          retryTimeoutRef.current = setTimeout(() => {
            if (isMounted) connect()
          }, 3000)
        }
      } catch (err) {
        setConnectionStatus('OFFLINE')
        retryTimeoutRef.current = setTimeout(() => {
          if (isMounted) connect()
        }, 5000)
      }
    }

    connect()

    return () => {
      isMounted = false
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [addAttack, setInitialAttacks, setConnectionStatus])
}
