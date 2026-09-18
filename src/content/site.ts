import type { SectionMeta, TeamMember, BomEntry } from './types'

export const SECTIONS: readonly SectionMeta[] = [
  { id: 'hero', numeral: '00', title: 'AIMBOT v2.0' },
  { id: 'problem', numeral: '01', title: 'The Problem' },
  { id: 'inside', numeral: '02', title: 'Inside the Shell' },
  { id: 'firmware', numeral: '03', title: 'Firmware' },
  { id: 'game', numeral: '04', title: 'The Game' },
  { id: 'build', numeral: '05', title: 'Build Log' },
  { id: 'team', numeral: '06', title: 'Team' },
]

export const HERO = {
  eyebrow: 'DSU DEVHACK 3.0 / OPEN INNOVATION',
  title: 'AIMBOT v2.0',
  pitch: 'An adaptive inertial controller built from e-waste, aimed at gamers whose hands do not hold still.',
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
  title: 'Aiming is a fine-motor task, and not every hand can do it',
  body: [
    'A mouse asks for sub-millimetre precision from the small muscles of the hand and wrist. For players with essential tremor, cerebral palsy, multiple sclerosis or repetitive strain injury, that is precisely the movement that is hardest to produce and hold.',
    'Adaptive controllers exist. They are also expensive, regionally scarce, and usually built around movement categories rather than around the specific problem of pointing — the thing a shooter actually asks you to do.',
    'AIMBOT v2.0 takes the opposite approach. It moves aiming off the wrist and onto the whole arm and shoulder, which are larger, stronger and steadier muscle groups, then filters what remains of the tremor in firmware. The result presents to the computer as an ordinary mouse.',
  ],
  annotation: 'the wrist is the bottleneck',
} as const

export const INSIDE = {
  numeral: '02',
  title: 'Inside the shell',
  body: [
    'The body is a Nerf N-Strike Elite Retaliator — a toy, chosen because it already solves the ergonomics. It has a grip, a trigger, a foregrip and a stock, all sized for a human hand and all in the right places.',
    'Everything inside it was either bought for a few hundred rupees or pulled out of dead electronics. The trigger switch came out of a Logitech mouse that had stopped working.',
  ],
} as const

export const GAME_SECTION = {
  numeral: '04',
  title: 'The game',
  body: [
    'We built an aim trainer for the controller to drive. An aim trainer is the honest way to demonstrate a pointing device: it isolates exactly the thing the hardware claims to improve, and it scores it. No level design, no story, nowhere for a bad input device to hide.',
    'Targets spawn in the arena, you put the crosshair on them, and it records accuracy, reaction time and streak. What matters here is the toggle: switch the input to a raw simulated IMU signal and the crosshair shakes. Switch the 1 Euro filter on and it steadies — without going sluggish when you flick to the next target.',
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
  body: [
    'Thirty-six continuous hours at DSU Ramanagara. The shell was opened, the cavity measured, the perfboard cut to fit the space behind the magazine well, and the trigger linkage reworked twice before the Omron sat at the right depth.',
  ],
  eWasteNote:
    'The Omron micro-switch, the jumper wires and the perfboard came out of dead hardware. Buying the switch new would have cost more than the mouse it came from is now worth.',
  timeline: [
    { at: 'H+00', what: 'Shell teardown, cavity measured, part placement decided' },
    { at: 'H+06', what: 'Pico flashed, MPU-9250 talking over I²C, raw quaternion on serial' },
    { at: 'H+14', what: 'Madgwick fusion stable, first HID mouse reports to the host' },
    { at: 'H+21', what: 'Tremor visible in the logs; 1 Euro filter implemented and tuned' },
    { at: 'H+28', what: 'Clutch, pot and joystick wired into the thumb cluster' },
    { at: 'H+36', what: 'Sealed, tested against the aim trainer, demo rehearsed' },
  ],
} as const

/** §16: costs are not in the source-of-truth document. Left null deliberately —
 *  the table renders a dash until the real figures are supplied. */
export const BOM: readonly BomEntry[] = [
  { item: 'Nerf N-Strike Elite Retaliator (shell)', qty: 1, sourcing: 'reused', cost: null },
  { item: 'Raspberry Pi Pico (RP2040)', qty: 1, sourcing: 'bought', cost: null },
  { item: 'MPU-9250 9-DoF IMU breakout', qty: 1, sourcing: 'bought', cost: null },
  { item: 'Omron D2FC micro-switch (from a dead Logitech mouse)', qty: 1, sourcing: 'e-waste', cost: null },
  { item: '6 × 6 mm tactile push button', qty: 5, sourcing: 'bought', cost: null },
  { item: '10k rotary potentiometer', qty: 1, sourcing: 'bought', cost: null },
  { item: 'KY-023 analog thumb joystick module', qty: 1, sourcing: 'bought', cost: null },
  { item: 'Zero PCB / perfboard', qty: 1, sourcing: 'e-waste', cost: null },
  { item: 'Dupont jumper wires', qty: 1, sourcing: 'e-waste', cost: null },
  { item: 'Micro-USB cable', qty: 1, sourcing: 'reused', cost: null },
]

export const BOM_TOTAL_NOTE = 'Target under ₹1500. Actual build ≈ ₹900–1200.' as const

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
