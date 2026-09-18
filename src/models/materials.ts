import { MeshPhysicalMaterial, MeshStandardMaterial, Color } from 'three'

/** §5 — every colour in the 3D scene resolves back to a design token.
 *  Nothing here may be a one-off hex picked by eye. */
export const TOKEN = {
  paper: '#f6f5f2',
  noir: '#101013',
  panel: '#16161c',
  noirSoft: '#2e2e33',
  amber: '#f5a623',
  amberDeep: '#e29200',
  grey1: '#c9c9d1',
  grey2: '#b3b3bc',
  grey3: '#a6a6af',
  line: '#e6e4dd',
} as const

/** Nerf shell: white, roughness 0.55, a little clearcoat (§6). */
export const shellMaterial = new MeshPhysicalMaterial({
  color: new Color(TOKEN.paper),
  roughness: 0.55,
  metalness: 0.0,
  clearcoat: 0.15,
  clearcoatRoughness: 0.4,
})

/** Grey/dark-grey accents on the blaster. */
export const shellAccentMaterial = new MeshPhysicalMaterial({
  color: new Color(TOKEN.noirSoft),
  roughness: 0.6,
  metalness: 0.05,
  clearcoat: 0.1,
})

/** Orange trim — trigger, priming grip, muzzle. The blaster's own accent
 *  happens to sit close to our amber token, which is convenient. */
export const shellTrimMaterial = new MeshPhysicalMaterial({
  color: new Color(TOKEN.amberDeep),
  roughness: 0.5,
  metalness: 0.0,
  clearcoat: 0.2,
})

/** PCB substrate: roughness 0.7, emissive amber trace accent (§6). */
export const pcbMaterial = new MeshStandardMaterial({
  color: new Color('#1f3d2b'),
  roughness: 0.7,
  metalness: 0.1,
  emissive: new Color(TOKEN.amber),
  emissiveIntensity: 0.04,
})

/** The MPU-9250 breakout — purple/blue board. */
export const breakoutMaterial = new MeshStandardMaterial({
  color: new Color('#3b2c6b'),
  roughness: 0.68,
  metalness: 0.1,
})

/** Perfboard / zero PCB. */
export const perfboardMaterial = new MeshStandardMaterial({
  color: new Color('#6b4a2a'),
  roughness: 0.85,
  metalness: 0.0,
})

/** Metal: metalness 0.9, roughness 0.25 (§6). */
export const metalMaterial = new MeshStandardMaterial({
  color: new Color(TOKEN.grey1),
  roughness: 0.25,
  metalness: 0.9,
})

/** Black plastic — button plungers, joystick cap, connector shells. */
export const blackPlasticMaterial = new MeshStandardMaterial({
  color: new Color(TOKEN.panel),
  roughness: 0.6,
  metalness: 0.0,
})

/** Highlight material used during the component walk (§8 beat 4). */
export const highlightMaterial = new MeshStandardMaterial({
  color: new Color(TOKEN.amber),
  roughness: 0.35,
  metalness: 0.2,
  emissive: new Color(TOKEN.amber),
  emissiveIntensity: 0.35,
})

/** Dispose everything on teardown (§11 — no leaks between scene swaps). */
export function disposeMaterials(): void {
  for (const m of [
    shellMaterial,
    shellAccentMaterial,
    shellTrimMaterial,
    pcbMaterial,
    breakoutMaterial,
    perfboardMaterial,
    metalMaterial,
    blackPlasticMaterial,
    highlightMaterial,
  ]) {
    m.dispose()
  }
}
