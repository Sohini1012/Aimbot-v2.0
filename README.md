# AIMBOT v2.0

An adaptive inertial game controller built from upcycled e-waste, aimed at players
with fine-motor disabilities and RSI — and the scroll-driven 3D site that presents it.

Built by **Prompt Engineers** (DSATM Bengaluru) for **DSU DevHack 3.0**, Open Innovation
track. Shortlisted for Phase 2 — a 36-hour continuous build at DSU Ramanagara,
18–19 September 2026.

---

## The hardware

A Nerf N-Strike Elite Retaliator with a Raspberry Pi Pico inside it. The shell was
chosen because it already solves the ergonomics: grip, trigger, foregrip and stock,
all sized for a human hand and all in the right places.

Aiming is a fine-motor task. For players with essential tremor, cerebral palsy, MS or
RSI, sub-millimetre precision from the wrist is the hardest movement to produce and
hold. AIMBOT moves aiming onto the arm and shoulder — larger, steadier muscle groups —
then filters what remains of the tremor in firmware. The computer sees an ordinary mouse.

### Bill of materials

| Item | Qty | Source | ₹ |
|---|---:|---|---:|
| Nerf Retaliator (shell) | 1 | already owned | 0 |
| Raspberry Pi Pico (RP2040) | 1 | bought | 380 |
| MPU-9250 9-DoF IMU | 1 | bought | 300 |
| Omron D2FC micro-switch | 1 | e-waste | 0 |
| 6×6 mm tactile push button | 10 | bought | 20 |
| 10k rotary potentiometer | 1 | bought | 15 |
| KY-023 thumb joystick | 1 | bought | 40 |
| Zero PCB / perfboard | 1 | bought | 35 |
| Dupont jumper wires | 1 | bought | 40 |
| Single-strand hookup wire | 1 | bought | 60 |
| USB cable | 1 | bought | 15 |
| **Total spent** | | | **905** |

The trigger switch came out of a dead Logitech mouse. Buying it new would have cost
more than the mouse it came from is now worth.

### Firmware pipeline

Everything runs on the Pico. Nothing is offloaded.

1. Read the MPU-9250 over I²C at **500 Hz**
2. **Madgwick/Mahony fusion** → stable quaternion, gyro drift corrected by accel + mag
3. Quaternion delta → yaw/pitch deltas → 2D cursor deltas
4. **1 Euro filter** — adaptive low-pass; suppresses tremor at low speed, stays
   responsive at high speed. This is the accessibility feature.
5. **Clutch gate** — hold to suspend tracking and reposition your arm, like lifting a
   mouse off the mat. Critical for limited range of motion.
6. Potentiometer ADC → live sensitivity scalar
7. Emit **USB HID mouse reports** — zero drivers, works in every game

We evaluated offloading the fusion to a networked Raspberry Pi over Wi-Fi and rejected
it. The added latency defeats the purpose: a pointing aid that lags is worse than none.

### Control layout

- **Omron micro-switch** — primary trigger, bonded behind the Nerf trigger
- **MPU-9250** — mid-body, on the top rail axis so it shares the barrel line
- **Reload / clutch** — right-hand thumb cluster
- **Grenade / aux** — left side, forward on the body
- **Potentiometer** — recessed in the foregrip
- **Joystick** — front stability handle, for one-handed movement

---

## The site

A scroll-driven 3D presentation of the build. The gun assembles, explodes to reveal its
internals, walks through each component, traces the signal path, reassembles, and hands
off into a playable aim trainer — all driven by scroll position.

The 3D is **procedural**: every part is authored as parametric three.js geometry in
`src/models/`, at real millimetre scale against a 154 mm/unit shell datum. No model is
downloaded, and no product photography ships in the site.

### Running it

```bash
npm install
npm run dev
```

```bash
npm run build && npm run preview
```

Requires Node ≥ 20.11.

### Layout

```
src/
  components/      UI and page sections
  scene/           canvas stage, camera rig, beat timeline, explode map
  models/          one file per hardware part
  game/            aim trainer engine, 1 euro filter, HUD
  hooks/           lenis, scroll beats, reduced motion, simplified path
  content/         all copy and the BOM, as typed data
  styles/          design tokens
docs/
  REFERENCES.md    research behind the geometry proportions
```

All site copy lives in `src/content/` so wording can be edited without touching
components.

### The 1 Euro filter

`src/game/oneEuroFilter.ts` is a real implementation of Casiez, Roussel & Vogel
(CHI 2012) — not a smoothing stand-in. The site quotes it as our actual algorithm, so
it has to be the truth. The browser version takes a timestamp because
`requestAnimationFrame` is not fixed-rate; the firmware version runs fixed at 500 Hz.

The in-page trainer demonstrates it: toggle **RAW IMU** to inject a synthetic tremor
signal, then **FILTERED (1€)** to switch the filter in. The crosshair steadies without
going sluggish when you flick to the next target. The sparkline shows both traces on a
shared scale.

### Performance

One WebGL context for the whole page. ~150 draw calls at full explode, 60fps on an M2.
three.js is split out and lazy-loaded so the hero text paints before the model arrives —
initial JS excluding the 3D chunk is ~65 KB gzipped.

### Accessibility

The project is about accessibility, so the site cannot be hypocritical about it.

- Every fact shown in the canvas also exists as real DOM text. A screen reader gets the
  whole teardown without the 3D.
- The canvas carries a per-beat `aria-label` describing what is on screen.
- The trainer is fully playable with the keyboard — arrows to aim, Enter to fire, space
  to clutch.
- `prefers-reduced-motion` drops Lenis, removes the scrubs, and stops the trainer from
  running until started deliberately.
- Narrow viewports get a simplified render path.

---

## Tooling

`someting.py` captures the Pico's CSV jitter log over serial, with a phase timer for the
hold-still / tremor / fast-swing test protocol. Needs `pyserial`.

```bash
python3 someting.py --list
python3 someting.py --port /dev/tty.usbmodem14201 --secs 60 --out run1.csv
```

---

## Credits

**Prompt Engineers** — DSATM Bengaluru

- Shaik Luqman — lead; firmware, sensor fusion, site
- Sohini — hardware, build and integration
- Samyuktha Sammathgowd — hardware, testing and demo

DSU DevHack 3.0, Open Innovation.
