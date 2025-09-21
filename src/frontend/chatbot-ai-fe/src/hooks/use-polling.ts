"use client"

import { useEffect, useRef, useCallback } from "react"

export interface UsePollingOptions {
  interval?: number
  immediate?: boolean
  enabled?: boolean
}

export interface UsePollingReturn {
  start: () => void
  stop: () => void
  isPolling: boolean
}

export function usePolling(
  callback: () => Promise<boolean> | boolean,
  options: UsePollingOptions = {},
): UsePollingReturn {
  const { interval = 2000, immediate = false, enabled = true } = options

  const intervalRef = useRef<number | null>(null)
  const isPollingRef = useRef(false)
  const callbackRef = useRef(callback)

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    isPollingRef.current = false
  }, [])

  const start = useCallback(() => {
    if (!enabled || isPollingRef.current) return

    isPollingRef.current = true

    const poll = async () => {
      try {
        const shouldContinue = await callbackRef.current()
        if (!shouldContinue) {
          stop()
        }
      } catch (error) {
        console.error("Polling error:", error)
        stop()
      }
    }

    // Execute immediately if requested
    if (immediate) {
      poll()
    }

    // Set up interval
    intervalRef.current = setInterval(poll, interval)
  }, [enabled, immediate, interval, stop])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  return {
    start,
    stop,
    isPolling: isPollingRef.current,
  }
}
