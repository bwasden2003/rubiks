import './CubeFace.css'

import type { FaceName } from '../lib/cube/types.ts'

type CubeFaceProps = {
    facelets: FaceName[]
} 

export function CubeFace({ facelets }: CubeFaceProps) {
    return (
        <div className="cube-face">
            {facelets.map((color, index) => (
                <div key={index} className={`facelet facelet--${color}`} />
            ))}
        </div>
    )
}