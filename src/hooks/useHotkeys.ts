import { useEffect } from 'react'
import { HOTKEY_TO_MODE } from '../atlas/modes'
import type { Mode } from '../atlas/types'

interface HotkeyOptions {
  onMode: (m: Mode) => void
  onStop: () => void
  onToggleVoice: () => void
}

/**
 * In-page hotkeys:
 *   1 / 2 / 3  -> switch mode (ignored while typing in an input/textarea)
 *   Esc        -> stop output
 *   Alt+V      -> toggle voice (works even while typing)
 *
 * NOTE: true GLOBAL/system-wide hotkeys (Wispr Flow style) require a desktop
 * shell (Electron/Python) and are out of scope for this web build.
 */
export function useHotkeys({ onMode, onStop, onToggleVoice }: HotkeyOptions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Alt+V — toggle voice, regardless of focus.
      if (e.altKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault()
        onToggleVoice()
        return
      }

      // Esc — stop output, regardless of focus.
      if (e.key === 'Escape') {
        onStop()
        return
      }

      // Don't hijack number keys while the user is typing.
      const target = e.target as HTMLElement | null
      const typing =
        !!target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return

      const mode = HOTKEY_TO_MODE[e.key]
      if (mode) {
        e.preventDefault()
        onMode(mode)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onMode, onStop, onToggleVoice])
}
