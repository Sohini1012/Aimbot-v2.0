import type { HardwarePart } from './types'

/** §7 — content source of truth. Every spec on the site comes from here.
 *  Nothing in this file may be invented. */
export const HARDWARE: readonly HardwarePart[] = [
  {
    id: 'pico',
    name: 'Raspberry Pi Pico (RP2040)',
    short: 'PICO',
    role: 'The brain. Runs all sensor fusion and DSP on-device, and presents to the host as a USB HID mouse.',
    placement: 'Inside the Nerf shell, behind the magazine well.',
    note: 'Everything runs here. Nothing is offloaded, nothing is networked.',
    inWalk: true,
  },
  {
    id: 'imu',
    name: 'MPU-9250 (9-DoF IMU)',
    short: 'MPU-9250',
    role: 'Accelerometer, gyroscope and magnetometer. Supplies the orientation that becomes cursor motion.',
    placement: 'Mounted flat mid-body, along the top rail axis so it shares the barrel line.',
    note: 'Mounting it on the barrel axis means the cursor tracks where the gun actually points.',
    inWalk: true,
  },
  {
    id: 'omron',
    name: 'Omron micro-switch',
    short: 'OMRON',
    role: 'The primary trigger. Real mouse-click feel and debounce characteristics, reused from e-waste.',
    placement: 'Bonded directly behind the Nerf trigger so the stock trigger actuates it.',
    note: 'Harvested from a dead Logitech mouse. The click you feel is the click that mouse used to make.',
    inWalk: true,
  },
  {
    id: 'buttons',
    name: '4 × tactile push buttons',
    short: 'BUTTONS',
    role: 'Reload and clutch under the right thumb; grenade and aux under the left, forward on the body.',
    placement:
      'Split across both sides of the shell — reload and clutch right, grenade and aux left and forward.',
    note: 'The clutch is the important one: hold it and tracking suspends, so you can reposition your arm without moving the cursor.',
    inWalk: true,
  },
  {
    id: 'pot',
    name: '10k potentiometer',
    short: 'POT',
    role: 'Live sensitivity and DPI dial — the accessibility knob. Tune tremor damping without touching software.',
    placement: 'Recessed in the foregrip, thumb-reachable.',
    note: 'No menus, no config file. Turn the dial mid-game and the response changes under your hand.',
    inWalk: true,
  },
  {
    id: 'joystick',
    name: 'Analog thumb joystick',
    short: 'JOYSTICK',
    role: 'Movement axis (WASD emulation), so the controller is usable one-handed.',
    placement: 'On the front stability handle, under the supporting thumb.',
    inWalk: true,
  },
  {
    id: 'wires',
    name: 'Dupont jumper wires',
    short: 'WIRING',
    role: 'I²C (SDA/SCL) to the IMU, GPIO to the buttons, ADC to the pot and joystick.',
    placement: 'Routed loosely along the shell interior.',
    note: 'The routing is honest, not tidied for the render. This is what the inside actually looks like.',
    inWalk: true,
  },
  {
    id: 'pcb',
    name: 'Zero PCB',
    short: 'PCB',
    role: 'Carries the Pico and the button matrix.',
    placement: 'Floor of the shell cavity.',
    inWalk: false,
  },
  {
    id: 'usb',
    name: 'Wired USB',
    short: 'USB',
    role: 'Power and HID data. No wireless — deliberate: zero pairing latency, zero battery.',
    placement: 'Out of the grip base.',
    inWalk: false,
  },
]

export const WALK_ORDER: readonly HardwarePart['id'][] = [
  'pico',
  'imu',
  'omron',
  'buttons',
  'pot',
  'joystick',
  'wires',
]
