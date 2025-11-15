// API Cache utility to prevent rate limiting
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresIn: number
}

class APICache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private readonly STORAGE_KEY = "btc_tracker_api_cache"

  constructor() {
    // Load cache from localStorage on initialization
    if (typeof window !== "undefined") {
      this.loadFromStorage()
    }
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        this.cache = new Map(Object.entries(parsed))
      }
    } catch (error) {
      console.error("Failed to load API cache:", error)
    }
  }

  private saveToStorage() {
    try {
      const cacheObj = Object.fromEntries(this.cache)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cacheObj))
    } catch (error) {
      console.error("Failed to save API cache:", error)
    }
  }

  get<T>(key: string, includeExpired = false): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    const isExpired = now - entry.timestamp > entry.expiresIn
    
    if (isExpired && !includeExpired) {
      this.cache.delete(key)
      this.saveToStorage()
      return null
    }

    return entry.data as T
  }

  set<T>(key: string, data: T, expiresIn = 60000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn,
    })
    this.saveToStorage()
  }

  clear() {
    this.cache.clear()
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.STORAGE_KEY)
    }
  }

  clearExpired() {
    const now = Date.now()
    let hasChanges = false

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.expiresIn) {
        this.cache.delete(key)
        hasChanges = true
      }
    }

    if (hasChanges) {
      this.saveToStorage()
    }
  }
}

export const apiCache = new APICache()

// Cache durations
export const CACHE_DURATIONS = {
  PRICE_TICKER: 5 * 60 * 1000, // 5 minutes (increased from 1)
  MARKET_DATA: 10 * 60 * 1000, // 10 minutes (increased from 5)
  PRICE_HISTORY: 30 * 60 * 1000, // 30 minutes (increased from 10)
  NOBITEX: 2 * 60 * 1000, // 2 minutes (increased from 1)
}
