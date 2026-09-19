import type { FirmwareStage } from './types'

/** §7 — the firmware pipeline, the technical heart of the project. */
export const FIRMWARE_PIPELINE: readonly FirmwareStage[] = [
  {
    index: 1,
    label: 'I²C read @ 500 Hz',
    detail: 'Accel, gyro and magnetometer, straight off the IMU.',
  },
  {
    index: 2,
    label: 'Madgwick / Mahony fusion',
    detail:
      'Fuses to a stable quaternion. Gyro drift corrected by accel and mag.',
  },
  {
    index: 3,
    label: 'Quaternion delta → cursor delta',
    detail: 'Orientation change becomes yaw/pitch, then cursor movement.',
  },
  {
    index: 4,
    label: '1 Euro filter',
    detail:
      'Adaptive low-pass. Kills tremor when slow, stays sharp when fast.',
  },
  {
    index: 5,
    label: 'Clutch gate',
    detail:
      'Hold to freeze tracking and reposition your arm. Like lifting a mouse.',
  },
  {
    index: 6,
    label: 'Sensitivity scalar',
    detail: 'The dial sets sensitivity live, before output.',
  },
  {
    index: 7,
    label: 'USB HID report',
    detail:
      'Standard HID. Every game, zero drivers, zero config.',
  },
]

/** §7 — the design decision worth showing. */
export const WHY_NOT_WIFI = {
  heading: 'Why not Wi-Fi?',
  body: 'We tried offloading to a networked Pi and rejected it. A pointing aid that lags is worse than none. Everything runs on the Pico, wired — milliseconds are the one thing this project cannot spend.',
} as const

/** The real 1 Euro filter, quoted on the site because it is our actual
 *  algorithm (Casiez, Roussel & Vogel, CHI 2012). Kept in sync by hand with
 *  src/game/oneEuroFilter.ts — see the test that asserts they agree. */
export const ONE_EURO_SNIPPET = `class OneEuroFilter:
    """Casiez et al., CHI 2012. Adaptive low-pass:
    cutoff rises with speed, so slow drift is smoothed hard
    and fast flicks pass through almost untouched."""

    def __init__(self, freq, mincutoff=1.0, beta=0.007, dcutoff=1.0):
        self.freq = freq
        self.mincutoff = mincutoff
        self.beta = beta
        self.dcutoff = dcutoff
        self.x_prev = None
        self.dx_prev = 0.0

    def _alpha(self, cutoff):
        tau = 1.0 / (2 * math.pi * cutoff)
        te = 1.0 / self.freq
        return 1.0 / (1.0 + tau / te)

    def __call__(self, x):
        if self.x_prev is None:
            self.x_prev = x
            return x

        # derivative, itself low-passed at a fixed cutoff
        dx = (x - self.x_prev) * self.freq
        a_d = self._alpha(self.dcutoff)
        dx_hat = a_d * dx + (1 - a_d) * self.dx_prev

        # the adaptive part: cutoff scales with speed
        cutoff = self.mincutoff + self.beta * abs(dx_hat)
        a = self._alpha(cutoff)
        x_hat = a * x + (1 - a) * self.x_prev

        self.x_prev = x_hat
        self.dx_prev = dx_hat
        return x_hat` as const

export const CLUTCH_SNIPPET = `# The clutch: hold to suspend tracking entirely.
# Without this, a user with limited range of motion runs out
# of arm before they run out of screen.
if clutch.value:            # active-low, pulled up
    dx = dy = 0             # report no motion
    fusion.hold()           # freeze the reference orientation
else:
    dx, dy = delta_from_quaternion(q, q_prev)
    dx = filt_x(dx) * sens
    dy = filt_y(dy) * sens

mouse.move(int(dx), int(dy))` as const
