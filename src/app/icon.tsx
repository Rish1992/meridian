import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0F1B2D',
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
          position: 'relative',
          flexDirection: 'column',
        }}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontSize: 20,
            fontWeight: 800,
            fontFamily: 'sans-serif',
            lineHeight: 1,
            marginBottom: 2,
          }}
        >
          M
        </span>
        <div
          style={{
            position: 'absolute',
            bottom: 4,
            left: 6,
            right: 6,
            height: 2,
            background: '#2563EB',
            borderRadius: 1,
          }}
        />
      </div>
    ),
    { ...size }
  )
}
