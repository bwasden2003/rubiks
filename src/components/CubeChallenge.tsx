import { useEffect, useState } from 'react'
import { Cube } from '../lib/cube/cube.ts'
import type { Move } from '../lib/cube/types.ts'
import { Cube3D } from './Cube3D.tsx'
import type { Challenge } from '../lib/challenge/types.ts'
import { generateChallenge } from '../lib/challenge/generator.ts'

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

  // get the current date to use for the seed
  const today = new Date();
  const seed = today.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });

  const [challenge, setChallenge] = useState<Challenge>(generateChallenge(seed, 3))

  useEffect(() => {
    setChallenge(generateChallenge(seed, 3))
  }, [])

  // this is the user's cube so it's the starting state we give them + the moves they make
  const startingCube = new Cube().applyAlg(challenge.startMoves.concat(moves))

  // this is the target cube so it's the starting moves + the reference moves
  const targetCube = new Cube().applyAlg(challenge.startMoves.concat(challenge.referenceMoves))


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
      <Cube3D facelets={startingCube.toFacelets()} />
      <Cube3D facelets={targetCube.toFacelets()} />
      <p>Moves: {moves.join(' ')}</p>
      <p>Target Moves: {challenge.referenceMoves.join(' ')}</p>
    </main>
  )
}
