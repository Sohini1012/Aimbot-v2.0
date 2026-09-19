import { Environment, ContactShadows, Lightformer } from '@react-three/drei'

/**
 * Product-shot lighting.
 *
 * What makes a white object read as a solid form rather than a flat cut-out is
 * that its faces differ from each other: a bright key on one side, a cool fill
 * on the other, and a hard rim separating the silhouette from the background.
 * A single key plus ambient — which is what this was — gives you none of that,
 * and the shell came out looking like untextured polystyrene.
 *
 * The environment is built from lightformers rather than an HDR preset because
 * drei's presets fetch multiple megabytes from a CDN and suspend the whole
 * scene behind that request.
 */
export function Lighting({ shadows = true }: { shadows?: boolean }) {
  return (
    <>
      {/* low ambient — the environment does the soft lifting, not this */}
      <ambientLight intensity={0.22} />

      {/* key, high and front-right */}
      <directionalLight
        position={[4.5, 6, 4]}
        intensity={2.4}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />

      {/* amber rim, behind and low — separates the silhouette from the ground */}
      <directionalLight position={[-5, 1.2, -4.5]} intensity={3.2} color="#f5a623" />

      {/* cool fill opposite the key, so the shadow side has shape in it */}
      <directionalLight position={[-3.5, 1.5, 3]} intensity={0.75} color="#aab4d0" />

      {/* narrow top kicker — catches the rail teeth and the slide edge */}
      <spotLight
        position={[0, 5.5, 1.5]}
        angle={0.7}
        penumbra={0.8}
        intensity={22}
        distance={14}
        color="#ffffff"
      />

      <Environment resolution={256}>
        {/* broad soft box overhead */}
        <Lightformer
          form="rect"
          intensity={2.0}
          position={[0, 4.5, 2]}
          scale={[10, 5, 1]}
          rotation={[-Math.PI / 2, 0, 0]}
          color="#ffffff"
        />
        {/* amber wrap, camera left */}
        <Lightformer
          form="rect"
          intensity={2.6}
          position={[-4.5, 1, -2]}
          scale={[5, 7, 1]}
          rotation={[0, Math.PI / 2, 0]}
          color="#f5a623"
        />
        {/* cool bounce, camera right */}
        <Lightformer
          form="rect"
          intensity={1.1}
          position={[4.5, 0.5, -1]}
          scale={[5, 6, 1]}
          rotation={[0, -Math.PI / 2, 0]}
          color="#c9d2e8"
        />
        {/* thin strip low and front — the specular line along the barrel */}
        <Lightformer
          form="rect"
          intensity={1.8}
          position={[0, -1.5, 3.5]}
          scale={[7, 0.6, 1]}
          color="#ffffff"
        />
      </Environment>

      {shadows && (
        <ContactShadows
          position={[0, -1.25, 0]}
          opacity={0.55}
          scale={13}
          blur={2.2}
          far={4.5}
          resolution={1024}
          color="#000000"
        />
      )}
    </>
  )
}
