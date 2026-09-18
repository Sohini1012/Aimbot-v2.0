import { useRef } from 'react'
import { Center } from '@react-three/drei'
import type { Group } from 'three'
import { ShellHalf, Trigger } from './Shell'
import { Barrel } from './Barrel'
import { Stock } from './Stock'
import { Mag } from './Mag'

/**
 * The assembled blaster. Every part is its own <group> with a ref so the
 * explode timeline can drive them independently — nothing here is merged,
 * because beat 3 needs to move each piece along its own vector.
 *
 * <Center> recentres the traced outline (which runs x ∈ [-1.9, 2.3]) on the
 * origin, so camera framing is about the model rather than about where the
 * profile happened to be drawn. Children keep their local coordinates, which
 * is what the explode map depends on.
 */
export function Blaster() {
  const left = useRef<Group>(null)
  const right = useRef<Group>(null)

  return (
    <Center>
      <ShellHalf ref={left} side={1} />
      <ShellHalf ref={right} side={-1} />
      <Trigger />
      <Barrel />
      <Stock />
      <Mag />
    </Center>
  )
}
