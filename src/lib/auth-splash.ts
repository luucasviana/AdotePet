const SPLASH_KEY = "adotepet_auth_splash_seen"

export function hasSplashBeenSeen(): boolean {
  try {
    return sessionStorage.getItem(SPLASH_KEY) === "1"
  } catch {
    return false
  }
}

export function markSplashSeen(): void {
  try {
    sessionStorage.setItem(SPLASH_KEY, "1")
  } catch {
    // ignore — private browsing or storage unavailable
  }
}
