import { Environment, ContactShadows, Lightformer } from '@react-three/drei'

/**
 * §6 — one key directional, one amber rim, a low-intensity environment, and a
 * contact shadow under the gun.
 *
 * The environment is built from lightformers rather than an HDR preset on
 * purpose: drei's presets fetch a multi-megabyte .hdr from a CDN, which both
 * blows the §11 LCP budget and suspends the whole scene behind a network round
 * trip. These are generated on the GPU, cost nothing to load, and let the amber
 * rim actually show up in the clearcoat on the white shell.
 */
export function Lighting({ shadows = true }: { shadows?: boolean }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[4, 6, 5]}
        intensity={2.2}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
      />
      {/* amber rim from behind and low — the signature light */}
      <directionalLight position={[-5, 1.5, -4]} intensity={2.4} color="#f5a623" />

      <Environment resolution={128}>
        {/* soft white key overhead */}
        <Lightformer
          form="rect"
          intensity={1.6}
          position={[0, 4, 2]}
          scale={[8, 4, 1]}
          rotation={[-Math.PI / 2, 0, 0]}
          color="#ffffff"
        />
        {/* amber wrap on the left */}
        <Lightformer
          form="rect"
          intensity={2.2}
          position={[-4, 1, -2]}
          scale={[4, 6, 1]}
          rotation={[0, Math.PI / 2, 0]}
          color="#f5a623"
        />
        {/* cool fill on the right so the white shell does not go flat */}
        <Lightformer
          form="rect"
          intensity={0.9}
          position={[4, 0.5, -1]}
          scale={[4, 5, 1]}
          rotation={[0, -Math.PI / 2, 0]}
          color="#c9c9d1"
        />
      </Environment>

      {shadows && (
        <ContactShadows
          position={[0, -1.15, 0]}
          opacity={0.45}
          scale={12}
          blur={2.4}
          far={4}
          resolution={512}
          color="#101013"
        />
      )}
    </>
  )
}
