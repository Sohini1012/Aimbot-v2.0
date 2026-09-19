import type { SectionMeta, TeamMember, BomEntry } from './types'

export const SECTIONS: readonly SectionMeta[] = [
  { id: 'hero', numeral: '00', title: 'AIMBOT v2.0' },
  { id: 'problem', numeral: '01', title: 'The Problem' },
  { id: 'inside', numeral: '02', title: 'Inside the Shell' },
  { id: 'parts', numeral: '02b', title: 'Parts' },
  { id: 'firmware', numeral: '03', title: 'Firmware' },
  { id: 'game', numeral: '04', title: 'The Game' },
  { id: 'build', numeral: '05', title: 'Build Log' },
  { id: 'team', numeral: '06', title: 'Team' },
]

export const HERO = {
  eyebrow: 'DSU DEVHACK 3.0 / OPEN INNOVATION',
  title: 'AIMBOT v2.0',
  pitch: 'Aim with your arm, not your wrist. Built from e-waste, for hands that shake.',
  scrollCue: 'SCROLL',
} as const

export const MATERIALISE_LINE = 'Built from e-waste. Aimed at accessibility.' as const
export const REASSEMBLE_LINE = 'One device. No drivers. Any game.' as const

export const STATS = [
  { value: '< ₹1500', label: 'TOTAL BUILD COST' },
  { value: '500 Hz', label: 'IMU SAMPLE RATE' },
  { value: '0', label: 'DRIVERS REQUIRED' },
] as const

export const PROBLEM = {
  numeral: '01',
  title: 'The wrist is the bottleneck',
  lead: 'A mouse demands sub-millimetre precision from the smallest muscles you have.',
  points: [
    'Tremor, cerebral palsy, MS and RSI all attack exactly that movement.',
    'Adaptive controllers are costly, scarce in India, and rarely built for pointing.',
    'AIMBOT moves aiming to the arm and shoulder — bigger, steadier muscles.',
    'What tremor is left gets filtered in firmware. The OS just sees a mouse.',
  ],
  annotation: 'the wrist is the bottleneck',
} as const

export const INSIDE = {
  numeral: '02',
  title: 'Inside the shell',
  lead: 'A Nerf Retaliator, because a toy already solved the ergonomics.',
  points: [
    'Grip, trigger, foregrip and stock — all sized for a hand, all in the right places.',
    'Everything inside cost a few hundred rupees, or came out of dead electronics.',
    'The trigger switch was salvaged from a Logitech mouse that had died.',
  ],
} as const

export const GAME_SECTION = {
  numeral: '04',
  title: 'The game',
  lead: 'An aim trainer is the honest way to test a pointing device. Nowhere to hide.',
  points: [
    'Hit the targets. It scores accuracy, reaction time and streak.',
    'RAW IMU injects a real tremor signal — watch the crosshair shake.',
    'FILTERED (1€) steadies it, without going sluggish on fast flicks.',
    'Hold space to clutch. Arrows aim, Enter fires.',
  ],
  rawLabel: 'RAW IMU',
  filteredLabel: 'FILTERED (1€)',
  clutchHint: 'HOLD SPACE TO CLUTCH',
  demoPoster: 'DEMO — AIMBOT v2.0',
  demoMissing: 'FOOTAGE DROPS AT DEMO DAY',
} as const

export const BUILD_LOG = {
  numeral: '05',
  title: 'Build log',
  lead: '36 hours at DSU Ramanagara.',
  eWasteNote:
    'The trigger switch came out of a dead mouse. Buying it new would have cost more than that mouse is now worth.',
  timeline: [
    { at: 'H+00', what: 'Shell teardown, cavity measured, part placement decided' },
    { at: 'H+06', what: 'Pico flashed, MPU-9250 talking over I²C, raw quaternion on serial' },
    { at: 'H+14', what: 'Madgwick fusion stable, first HID mouse reports to the host' },
    { at: 'H+21', what: 'Tremor visible in the logs; 1 Euro filter implemented and tuned' },
    { at: 'H+28', what: 'Clutch, pot and joystick wired into the thumb cluster' },
    { at: 'H+36', what: 'Sealed, tested against the aim trainer, demo rehearsed' },
  ],
} as const

/** Real figures supplied by the team. Salvaged and already-owned items are 0;
 *  nothing here is estimated. */
export const BOM: readonly BomEntry[] = [
  {
    item: 'Nerf N-Strike Elite Retaliator (shell)',
    qty: 1,
    sourcing: 'reused',
    cost: 0,
    note: 'Already owned — not bought for this build.',
  },
  { item: 'Raspberry Pi Pico (RP2040)', qty: 1, sourcing: 'bought', cost: 380 },
  { item: 'MPU-9250 9-DoF IMU breakout', qty: 1, sourcing: 'bought', cost: 300 },
  {
    item: 'Omron D2FC micro-switch',
    qty: 1,
    sourcing: 'e-waste',
    cost: 0,
    note: 'Harvested from a dead Logitech mouse.',
  },
  {
    item: '6 × 6 mm tactile push button',
    qty: 10,
    sourcing: 'bought',
    cost: 20,
    note: '₹2 each. Ten bought, four wired into the build, the rest spares.',
  },
  { item: '10k rotary potentiometer', qty: 1, sourcing: 'bought', cost: 15 },
  { item: 'KY-023 analog thumb joystick module', qty: 1, sourcing: 'bought', cost: 40 },
  { item: 'Zero PCB / perfboard', qty: 1, sourcing: 'bought', cost: 35 },
  { item: 'Dupont jumper wires', qty: 1, sourcing: 'bought', cost: 40 },
  { item: 'Single-strand hookup wire', qty: 1, sourcing: 'bought', cost: 60 },
  { item: 'USB cable', qty: 1, sourcing: 'bought', cost: 15 },
]

export const BOM_TOTAL = BOM.reduce((sum, row) => sum + (row.cost ?? 0), 0)

export const BOM_TOTAL_NOTE =
  'Target was under ₹1500. The shell and the trigger switch cost nothing — one was already on the shelf, the other came out of a dead mouse.' as const

export const TEAM: readonly TeamMember[] = [
  { name: 'Shaik Luqman', role: 'Lead — firmware, sensor fusion, site' },
  { name: 'Sohini', role: 'Hardware, build and integration' },
  { name: 'Samyuktha Sammathgowd', role: 'Hardware, testing and demo' },
]

export const EVENT = {
  team: 'Prompt Engineers',
  college: 'DSATM Bengaluru',
  hackathon: 'DSU DevHack 3.0',
  track: 'Open Innovation',
  phase: 'Shortlisted for Phase 2',
  venue: 'DSU Ramanagara',
  dates: '18–19 September 2026',
  duration: '36-hour continuous build',
} as const

export const REPO_URL = 'https://github.com/Sohini1012/Aimbot-v2.0' as const
