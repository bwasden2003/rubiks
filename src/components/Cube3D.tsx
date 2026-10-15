import './Cube3D.css'

import { Canvas, type ThreeEvent } from '@react-three/fiber'
import type { Facelets, FaceName } from '../lib/cube/types'
import { FACE_COLORS } from '../lib/cube/types'

type Cube3DProps = {
  facelets: Facelets
  selectedFace?: FaceName | null
  onSelectFace?: (face: FaceName) => void
}

type Vec3 = [number, number, number]

type FaceConfig = {
    normal: Vec3
    up: Vec3
    right: Vec3
    rotation: Vec3
}

const FACE_CONFIG: Record<FaceName, FaceConfig> = {
    U: {
        normal: [0, 1, 0],
        up: [0, 0, -1],
        right: [1, 0, 0],
        rotation: [-Math.PI / 2, 0, 0]
    },
    R: {
        normal: [1, 0, 0],
        up: [0, 1, 0],
        right: [0, 0, -1],
        rotation: [0, Math.PI / 2, 0]
    },
    F: {
        normal: [0, 0, 1],
        up: [0, 1, 0],
        right: [1, 0, 0],
        rotation: [0, 0, 0]
    },
    D: {
        normal: [0, -1, 0],
        up: [0, 0, 1],
        right: [1, 0, 0],
        rotation: [Math.PI / 2, 0, 0]
    },
    L: {
        normal: [-1, 0, 0],
        up: [0, 1, 0],
        right: [0, 0, 1],
        rotation: [0, -Math.PI / 2, 0]
    },
    B: {
        normal: [0, 0, -1],
        up: [0, 1, 0],
        right: [-1, 0, 0],
        rotation: [0, Math.PI, 0]
    }
}

const FACE_ORDER: FaceName[] = ['U', 'R', 'F', 'D', 'L', 'B']

function add(a: Vec3, b: Vec3): Vec3 {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

function scale(v: Vec3, s: number): Vec3 {
    return [v[0] * s, v[1] * s, v[2] * s]
}

function stickerPosition(face: FaceName, index: number): Vec3 {
    const config = FACE_CONFIG[face]
    const row = Math.floor(index / 3)
    const col = index % 3

    const spacing = 0.68
    const faceOffset = 1.03
    const localX = (col - 1) * spacing
    const localY = (1 - row) * spacing

    return add(
        add(scale(config.normal, faceOffset), scale(config.right, localX)),
        scale(config.up, localY)
    )
}

type StickerProps = {
  face: FaceName
  index: number
  color: FaceName
  onSelectFace?: (face: FaceName) => void
}

function Sticker({ face, index, color, onSelectFace }: StickerProps) {
  const config = FACE_CONFIG[face]

  return (
    <mesh
      position={stickerPosition(face, index)}
      rotation={config.rotation}
      onClick={onSelectFace ? (event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation()
        onSelectFace(face)
      } : undefined}
    >
      <planeGeometry args={[0.58, 0.58]} />
      <meshStandardMaterial color={FACE_COLORS[color]} roughness={0.55} />
    </mesh>
  )
}

function FaceOutline({ face }: { face: FaceName }) {
  const config = FACE_CONFIG[face]
  const width = 2.02
  const thickness = 0.04
  const edge = (width - thickness) / 2

  const bars: {
    position: Vec3
    size: [number, number]
  }[] = [
    { position: [0, edge, 0], size: [width, thickness] },
    { position: [0, -edge, 0], size: [width, thickness] },
    { position: [-edge, 0, 0], size: [thickness, width] },
    { position: [edge, 0, 0], size: [thickness, width] },
  ]

  return (
    <group
      position={scale(config.normal, 1.04)}
      rotation={config.rotation}
    >
      {bars.map(({ position, size }, index) => (
        <mesh
          key={index}
          position={position}
          raycast={() => null}
        >
          <planeGeometry args={size} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      ))}
    </group>
  )
}

function CubeScene({ facelets, selectedFace, onSelectFace }: Cube3DProps) {
  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[4, 6, 6]} intensity={2.5} />

      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#111111" roughness={0.8} />
      </mesh>

      {FACE_ORDER.flatMap((face) =>
        facelets[face].map((color, index) => (
          <Sticker
            key={`${face}-${index}`}
            face={face}
            index={index}
            color={color}
            onSelectFace={onSelectFace}
          />
        )),
      )}
      {selectedFace != null && (
        <FaceOutline face={selectedFace} />
      )}
    </>
  )
}

export function Cube3D({ facelets, selectedFace, onSelectFace }: Cube3DProps) {
  return (
    <div className="cube-3d">
      <Canvas camera={{ position: [3.8, 3.2, 4.8], fov: 38 }}>
        <CubeScene facelets={facelets} selectedFace={selectedFace} onSelectFace={onSelectFace} />
      </Canvas>
    </div>
  )
}
