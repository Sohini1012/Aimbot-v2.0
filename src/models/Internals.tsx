import { forwardRef } from 'react'
import type { RefObject } from 'react'
import type { Group } from 'three'
import { Pico } from './Pico'
import { Imu } from './Imu'
import { Omron } from './Omron'
import { Buttons } from './Buttons'
import { Pot } from './Pot'
import { Joystick } from './Joystick'
import { Perfboard } from './Perfboard'
import { Wiring } from './Wiring'
import { placementOf } from './placement'
import { metalMaterial, blackPlasticMaterial } from './materials'
import { mm } from './scale'

/** USB cable exiting the grip base. Power and HID data — no wireless (§7). */
const UsbTail = forwardRef<Group>(function UsbTail(_, ref) {
  return (
    <group ref={ref}>
      <mesh material={metalMaterial} castShadow>
        <boxGeometry args={[mm(12), mm(5), mm(7)]} />
      </mesh>
      <mesh position={[-mm(14), 0, 0]} material={blackPlasticMaterial} castShadow>
        <boxGeometry args={[mm(18), mm(9), mm(11)]} />
      </mesh>
    </group>
  )
})

export interface InternalRefs {
  pico: RefObject<Group>
  imu: RefObject<Group>
  omron: RefObject<Group>
  buttons: RefObject<Group>
  pot: RefObject<Group>
  joystick: RefObject<Group>
  pcb: RefObject<Group>
  wires: RefObject<Group>
  usb: RefObject<Group>
}

/** Every internal part, each in its own ref'd group at its §7 placement, so
 *  the explode timeline can drive them independently. */
export function Internals({ refs }: { refs: InternalRefs }) {
  return (
    <group>
      <group ref={refs.pcb} {...spread('pcb')}>
        <Perfboard />
      </group>
      <group ref={refs.pico} {...spread('pico')}>
        <Pico />
      </group>
      <group ref={refs.imu} {...spread('imu')}>
        <Imu />
      </group>
      <group ref={refs.omron} {...spread('omron')}>
        <Omron />
      </group>
      <group ref={refs.buttons} {...spread('buttons')}>
        <Buttons />
      </group>
      <group ref={refs.pot} {...spread('pot')}>
        <Pot />
      </group>
      <group ref={refs.joystick} {...spread('joystick')}>
        <Joystick />
      </group>
      <group ref={refs.usb} {...spread('usb')}>
        <UsbTail />
      </group>
      <group ref={refs.wires}>
        <Wiring />
      </group>
    </group>
  )
}

function spread(id: Parameters<typeof placementOf>[0]) {
  const p = placementOf(id)
  return {
    position: p.position as unknown as [number, number, number],
    rotation: (p.rotation ?? [0, 0, 0]) as unknown as [number, number, number],
  }
}
