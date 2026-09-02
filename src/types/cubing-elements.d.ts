import type { DetailedHTMLProps, HTMLAttributes } from 'react'

type TwistyPlayerAttributes = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  alg?: string
  background?: string
  'control-panel'?: string
  'hint-facelets'?: string
  'camera-latitude'?: string
  'camera-longitude'?: string
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'twisty-player': TwistyPlayerAttributes
    }
  }
}
