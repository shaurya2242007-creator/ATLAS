import type { Mode, ModeConfig, OrbState } from './types'

export const MODES: Record<Mode, ModeConfig> = {
  quick:  { id: 'quick',  label: 'Quick',  hotkey: '1', colorA: '#a78bfa', colorB: '#7c5cff',
    systemAppend: 'MODE: QUICK. Answer in ~120 words max. Punchy, high-signal, one insight, no preamble.' },
  deep:   { id: 'deep',   label: 'Deep',   hotkey: '2', colorA: '#b47cff', colorB: '#7d3cff',
    systemAppend: "MODE: DEEP RESEARCH. Structure as three spoken sections: Overview -> Depth -> The Hidden Layer. Cite conversationally ('a 2023 MIT study found…'). If LIVE WEB RESULTS are supplied, synthesize + cite them and flag where sources conflict." },
  visual: { id: 'visual', label: 'Visual', hotkey: '3', colorA: '#caa8ff', colorB: '#c86bff',
    systemAppend: 'MODE: VISUAL. Explain, and when the concept is spatial/structural/dynamic, vividly describe what a 3D visualization should show.' },
}

// State tint blended over the mode base — strictly monochromatic violet/lavender.
export const STATE_TINT: Record<OrbState, string | null> = {
  idle: null,
  listening: '#a78bfa',
  thinking: '#8b5cff',
  speaking: '#b57cff',
}

export const MODE_ORDER: Mode[] = ['quick', 'deep', 'visual']
export const HOTKEY_TO_MODE: Record<string, Mode> = { '1': 'quick', '2': 'deep', '3': 'visual' }
