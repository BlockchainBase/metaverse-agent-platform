import { useRef, useEffect, useCallback } from 'react'

/**
 * 防抖Hook
 * 用于优化频繁触发的事件（如搜索输入、窗口调整等）
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  ) as T
}


/**
 * 节流Hook
 * 用于限制函数执行频率（如滚动事件、鼠标移动等）
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T {
  const inThrottle = useRef(false)

  return useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottle.current) {
        callback(...args)
        inThrottle.current = true
        setTimeout(() => {
          inThrottle.current = false
        }, limit)
      }
    },
    [callback, limit]
  ) as T
}

/**
 * 缓存Hook
 * 用于缓存昂贵的计算结果
 */
export function useMemoizedValue<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  const ref = useRef<{ value: T; deps: React.DependencyList } | null>(null)

  if (
    !ref.current ||
    deps.length !== ref.current.deps.length ||
    deps.some((dep, i) => dep !== ref.current!.deps[i])
  ) {
    ref.current = { value: factory(), deps }
  }

  return ref.current.value
}

/**
 *  intersection observer Hook
 * 用于懒加载和虚拟滚动
 */
export function useIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) {
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(callback, options)
    return () => observerRef.current?.disconnect()
  }, [callback, options])

  const observe = useCallback((element: Element) => {
    observerRef.current?.observe(element)
  }, [])

  const unobserve = useCallback((element: Element) => {
    observerRef.current?.unobserve(element)
  }, [])

  return { observe, unobserve }
}

/**
 * 定时器Hook（带自动清理）
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay !== null) {
      const id: ReturnType<typeof setInterval> = setInterval(() => savedCallback.current?.(), delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

/**
 * WebSocket重连Hook
 */
export function useWebSocketReconnect(
  url: string,
  options: {
    maxRetries?: number
    retryDelay?: number
    onOpen?: () => void
    onMessage?: (data: any) => void
    onError?: (error: Event) => void
  } = {}
) {
  const {
    maxRetries = 5,
    retryDelay = 3000,
    onOpen,
    onMessage,
    onError
  } = options

  const wsRef = useRef<WebSocket | null>(null)
  const retryCountRef = useRef(0)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    wsRef.current = new WebSocket(url)

    wsRef.current.onopen = () => {
      retryCountRef.current = 0
      onOpen?.()
    }

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage?.(data)
      } catch {
        onMessage?.(event.data)
      }
    }

    wsRef.current.onerror = (error) => {
      onError?.(error)
    }

    wsRef.current.onclose = () => {
      if (retryCountRef.current < maxRetries) {
        reconnectTimeoutRef.current = setTimeout(() => {
          retryCountRef.current++
          connect()
        }, retryDelay * Math.pow(2, retryCountRef.current)) // 指数退避
      }
    }
  }, [url, maxRetries, retryDelay, onOpen, onMessage, onError])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    wsRef.current?.close()
  }, [])

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data))
    }
  }, [])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return { connect, disconnect, send }
}

/**
 * 性能监控Hook
 * 用于监控组件渲染性能
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0)
  const lastRenderTime = useRef(performance.now())

  useEffect(() => {
    renderCount.current++
    const now = performance.now()
    const timeSinceLastRender = now - lastRenderTime.current
    lastRenderTime.current = now

    if (renderCount.current % 10 === 0) {
      console.log(
        `[Performance] ${componentName} rendered ${renderCount.current} times. Last render: ${timeSinceLastRender.toFixed(2)}ms`
      )
    }
  })
}
