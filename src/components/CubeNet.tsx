import './CubeNet.css'

import { CubeFace } from "./CubeFace";
import type { Facelets, FaceName } from "../lib/cube/types";

type CubeNetProps = {
    facelets: Facelets
}

const NET_FACES: FaceName[] = ['U', 'R', 'F', 'D', 'L', 'B']

export function CubeNet({ facelets }: CubeNetProps) {
    return (
        <div className="cube-net">
            {NET_FACES.map((face) => (
                <div key={face} className={`cube-net__face cube-net__face--${face}`}>
                    <CubeFace facelets={facelets[face]} />
                </div>
            ))}
        </div>
    )
}