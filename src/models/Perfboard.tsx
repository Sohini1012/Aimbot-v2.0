import { useMemo } from 'react'
import { DIM, mm } from './scale'
import { perfboardMaterial, blackPlasticMaterial } from './materials'
import { Instanced, type InstanceSpec } from './Instanced'

/**
 * Zero PCB — carries the Pico and the button matrix, cut to fit the shell
 * cavity floor. The 2.54 mm hole matrix reads as perfboard from a sparse grid
 * of instanced holes; drawing all several hundred as meshes cost more draw
 * calls than the rest of the scene combined.
 */
export function Perfboard() {
  const { l, w, t } = DIM.perfboard

  const holes = useMemo<InstanceSpec[]>(() => {
    const cols = 14
    const rows = 6
    const pitch = mm(4.2)
    const out: InstanceSpec[] = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        out.push({
          position: [(c - (cols - 1) / 2) * pitch, t / 2, (r - (rows - 1) / 2) * pitch],
        })
      }
    }
    return out
  }, [t])

  return (
    <group>
      <mesh castShadow receiveShadow material={perfboardMaterial}>
        <boxGeometry args={[l, t, w]} />
      </mesh>

      <Instanced instances={holes} material={blackPlasticMaterial}>
        <cylinderGeometry args={[mm(0.7), mm(0.7), t * 1.2, 6]} />
      </Instanced>
    </group>
  )
}
