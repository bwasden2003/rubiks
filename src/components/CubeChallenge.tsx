import { useEffect, useState } from 'react'
import { Cube } from '../lib/cube/cube.ts'
import type { Move } from '../lib/cube/types.ts'
import { Cube3D } from './Cube3D.tsx'

const KEY_MOVES: Record<string, Move> = {
  u: 'U',
  r: 'R',
  f: 'F',
  d: 'D',
  l: 'L',
  b: 'B',
}

export function CubeChallenge() {
  const [moves, setMoves] = useState<Move[]>([])

  const cube = new Cube().applyAlg(moves)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const move = KEY_MOVES[event.key.toLowerCase()]

      if (move) {
        setMoves((current) => [...current, event.shiftKey ? (`${move}'` as Move) : move])
        return
      }

      if (event.key === 'Backspace') {
        setMoves((current) => current.slice(0, -1))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <main className="game-shell">
      <Cube3D facelets={cube.toFacelets()} />
    </main>
  )
}
