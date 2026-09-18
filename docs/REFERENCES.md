# Reference notes

Research backing the procedural geometry in `src/models/`. Per §6 of the build spec,
these references drive **proportions of geometry we author** — no downloaded model is
used, and no product photography ships in the site.

Two kinds of entry below, and the difference matters:

- **Confirmed** — sourced from a manufacturer datasheet or equivalent. Safe to treat as spec.
- **Derived** — proportions read off reference imagery to get the silhouette right.
  These are modelling assumptions, not manufacturer figures. Where a real measurement
  would be better, it is flagged.

---

## Nerf N-Strike Elite Retaliator — the shell

**Confirmed**

- Released 1 August 2012, N-Strike Elite series. Slide-action, clip-system blaster.
- Marketed as "4-in-1": ships with detachable **stock**, **barrel extension** and
  **stability handle / assault grip**, plus a 12-dart quick-reload clip.
- The stock, barrel extension and assault grip snap on and off without tools.
- The barrel extension twist-locks onto the muzzle.
- Colour: **white** main body, **grey / dark-grey** accents, **orange** trim on the
  trigger, priming grip and muzzle.

**Derived — silhouette proportions** (unitless, relative to overall body length = 1.0)

| Feature | Proportion | Note |
|---|---|---|
| Main body (muzzle to stock mount) | 1.00 | reference datum |
| Barrel extension | ~0.28 | twist-locks forward of the muzzle |
| Stock | ~0.30 | rear, snaps to the body |
| Body height at the grip | ~0.42 | including the grip |
| Top rail — long and flat | ~0.62 of body length | the IMU mounts along this axis |
| Magazine well | forward of the trigger guard | angled slightly forward |
| Foregrip | under the barrel, ahead of the mag well | angled |

> **Open item:** these are read off imagery. The team has the physical blaster — a tape
> measure over the real unit (overall length, body height, grip circumference, rail
> length) would let the model be dimensionally honest rather than proportionally close.
> Ask Shaik for the numbers and replace this table.

**Silhouette notes for modelling**

- Long flat top rail running most of the body length.
- Magazine well sits *forward* of the trigger guard, canted slightly forward.
- Angled foregrip below the barrel line.
- Stock is a skeletal shape, not a solid block — it has a cut-out.
- The priming grip (slide) sits above and behind the mag well.

---

## Raspberry Pi Pico (RP2040)

**Confirmed**

- Single-sided PCB, **51 × 21 × 1 mm**.
- Micro-USB port **overhangs the top edge**.
- Dual castellated / through-hole pins along both long edges — 40 pins total.
- Green solder mask; silver RP2040 package; BOOTSEL button on the top face.

Source: Raspberry Pi Pico documentation; matches §7 of the build spec.

---

## MPU-9250 breakout

**Confirmed**

- The MPU-9250 die itself is a **3 × 3 × 1 mm** QFN package.
- 9-DoF: 3-axis accelerometer, 3-axis gyroscope, 3-axis magnetometer.

**Derived**

- Common breakout boards are roughly **15 × 25 mm**, purple or blue solder mask,
  with an 8–10 pin single-row header along one long edge. Board size varies by
  manufacturer — no single canonical figure exists.

---

## Remaining parts — derived

| Part | Proportions / colour | Note |
|---|---|---|
| 10k rotary potentiometer | blue or silver body, knurled shaft, 3 pins | body ≈ 10 mm across, shaft ≈ 6 mm |
| Tactile push button | **6 × 6 mm**, 4 legs, black plunger | standard through-hole part, 5 used |
| Omron D2FC micro-switch | white/black body, metal lever, 3 pins | ≈ 12.8 × 5.8 × 6.5 mm is the common D2FC footprint |
| KY-023 thumb joystick | black cap, blue PCB, 5 pins | module ≈ 26 × 34 mm |
| Dupont jumper wires | multicoloured silicone | routing is allowed to look organic — it is not a CAD render |
| Zero PCB / perfboard | brown or green, 2.54 mm hole matrix | cut to fit the shell cavity |

---

## Colour discipline

Model colours come from the design tokens in `src/styles/index.css`, not from
sampled photography. The white shell reads as `--color-paper`-adjacent, the amber
highlight is `--color-amber`, and dark parts sit near `--color-noir`.

---

## Sources

- [Retaliator — Nerf Wiki](https://nerf.fandom.com/wiki/Retaliator)
- [Nerf N-Strike Elite Retaliator official instructions — Hasbro](https://instructions.hasbro.com/en-us/instruction/nerf-n-strike-elite-retaliator)
- [Review: Nerf Elite Retaliator — Blaster Hub](https://blasterhub.com/2015/11/review-nerf-elite-retaliator-20m-aussie-grey-trigger/)
- [Raspberry Pi Pico pinout, datasheet and specifications — Components101](https://components101.com/development-boards/raspberry-pi-pico-pinout-datasheet-specifications)
- [Pico microcontroller boards — Raspberry Pi Documentation](https://raspberrypi.com/documentation/microcontrollers/raspberry-pi-pico.html)
