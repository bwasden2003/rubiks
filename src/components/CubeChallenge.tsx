import { useEffect, useState } from 'react'
import type { Move } from '../lib/cube/types.ts'
import { Cube3D } from './Cube3D.tsx'
import { generateChallenge } from '../lib/challenge/generator.ts'
import type { AttemptState } from '../lib/game/attempt.ts'
import { applyMove, createAttempt, undoMove, resetAttempt, getElapsedMs } from '../lib/game/attempt.ts'

const KEY_MOVES: Record<string, Move> = {
  u: 'U',
  r: 'R',
  f: 'F',
  d: 'D',
  l: 'L',
  b: 'B',
}

export function CubeChallenge() {
  // get the current date to use for the seed
  const [now, setNow] = useState(() => new Date())
  const seed = now.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });

  const [attempt, setAttempt] = useState<AttemptState>(() => createAttempt(generateChallenge(seed, 3)))

  // Effect to handle keyboard input for moves, undo, and reset
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target

      // Leave typing and editable content alone.
      if (
        target instanceof HTMLElement &&
        (target.closest('input, textarea, select') || target.isContentEditable)
      ) {
        return
      }

      // Leave browser and operating-system shortcuts alone.
      if (event.ctrlKey || event.altKey || event.metaKey) return

      const move = KEY_MOVES[event.key.toLowerCase()]
      
      if (move) {
        event.preventDefault()
        const selectedMove: Move = event.shiftKey ? `${move}'` as Move : move
        setAttempt((current) => applyMove(current, selectedMove, new Date()))
        return
      }

      if (event.key === 'Backspace') {
        setAttempt((current) => undoMove(current))
      }

      if (event.key === 'Escape') {
        setAttempt((current) => resetAttempt(current))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Effect to update the current time every tenth of a second for the timer
  useEffect(() => {
    if (attempt.status !== 'playing') return

    const interval = window.setInterval(() => {
      setNow(new Date())
    }, 100)
    
    return () => window.clearInterval(interval)
  }, [attempt.status])

  return (
    <main className="game-shell">
      <p>Timer: {Math.max(0, getElapsedMs(attempt, now))} ms</p>
      <Cube3D facelets={attempt.currentCube.toFacelets()} />
      <Cube3D facelets={attempt.targetCube.toFacelets()} />
      {attempt.status === 'completed' && (
        <p>Completed in {Math.max(0, getElapsedMs(attempt, now))} ms!</p>
      )}
      <p>Status: {attempt.status}</p>
      <p>Moves: {attempt.moves.length}</p>
      {/* possibly change to display the target number of moves, would need to store difficulty */}
      <p>Target Moves: {attempt.challenge.referenceMoves.join(' ')}</p>
    </main>
  )
}
