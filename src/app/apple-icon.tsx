import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0F1B2D',
          width: 180,
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 36,
          position: 'relative',
          flexDirection: 'column',
        }}
      >
        {/* Subtle inner glow ring */}
        <div
          style={{
            position: 'absolute',
            inset: 8,
            borderRadius: 28,
            border: '1px solid rgba(37, 99, 235, 0.25)',
            display: 'flex',
          }}
        />

        {/* Letter M */}
        <span
          style={{
            color: '#FFFFFF',
            fontSize: 108,
            fontWeight: 800,
            fontFamily: 'sans-serif',
            lineHeight: 1,
            letterSpacing: '-4px',
            marginBottom: 8,
          }}
        >
          M
        </span>

        {/* Electric blue accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: 36,
            right: 36,
            height: 6,
            background: 'linear-gradient(90deg, #1D4ED8, #2563EB, #3B82F6)',
            borderRadius: 3,
          }}
        />
      </div>
    ),
    { ...size }
  )
}
