'use client'

/**
 * GeminiAurora — full-page animated AI-style gradient background.
 *
 * Inspired by Gemini's marketing site: large flowing gradient blobs,
 * conic shimmer sweeps, grain overlay, and color cycling. Pure CSS so
 * it stays cheap to render behind the 3D canvas.
 *
 * Layered structure (back → front):
 *   1. base wash — deep indigo/black with subtle radial fade
 *   2. aurora blobs — 4 large blurred gradient circles drifting on
 *      different rhythms + keyframes (color + position + scale)
 *   3. conic sweep — slow rotating conic gradient that reads as
 *      "AI shimmer"
 *   4. grain — SVG noise overlay for depth
 *   5. vignette — darkens edges so center content stays readable
 */

export default function GeminiAurora() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#0F0608]"
    >
      {/* Base radial wash — warm pink/orange glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(244,63,94,0.22), transparent 60%), radial-gradient(ellipse 70% 50% at 50% 100%, rgba(251,146,60,0.14), transparent 70%)',
        }}
      />

      {/* Drifting gradient blobs — warm palette */}
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
      <div className="aurora-blob aurora-blob-4" />

      {/* Conic shimmer — slow sweep (warm) */}
      <div className="aurora-conic" />

      {/* Grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.10] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          backgroundSize: '220px 220px',
        }}
      />

      {/* Edge vignette for readability (warm-tinted) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 55%, rgba(15,6,8,0.55) 90%, rgba(15,6,8,0.95) 100%)',
        }}
      />

      {/* Inline keyframes */}
      <style jsx>{`
        .aurora-blob {
          position: absolute;
          border-radius: 9999px;
          filter: blur(80px);
          opacity: 0.55;
          will-change: transform, filter, opacity;
        }
        .aurora-blob-1 {
          width: 55vw;
          height: 55vw;
          left: -10vw;
          top: -10vw;
          background: radial-gradient(circle at 30% 30%, #F43F5E 0%, transparent 65%);
          animation: drift1 22s ease-in-out infinite alternate;
        }
        .aurora-blob-2 {
          width: 50vw;
          height: 50vw;
          right: -12vw;
          top: 5vw;
          background: radial-gradient(circle at 50% 50%, #FB923C 0%, transparent 65%);
          animation: drift2 26s ease-in-out infinite alternate;
        }
        .aurora-blob-3 {
          width: 60vw;
          height: 60vw;
          left: 10vw;
          bottom: -20vw;
          background: radial-gradient(circle at 50% 50%, #EC4899 0%, transparent 65%);
          animation: drift3 30s ease-in-out infinite alternate;
          opacity: 0.42;
        }
        .aurora-blob-4 {
          width: 40vw;
          height: 40vw;
          right: 5vw;
          bottom: -10vw;
          background: radial-gradient(circle at 50% 50%, #FBBF24 0%, transparent 60%);
          animation: drift4 28s ease-in-out infinite alternate;
          opacity: 0.32;
        }
        .aurora-conic {
          position: absolute;
          inset: -25%;
          background: conic-gradient(
            from 0deg at 50% 50%,
            transparent 0deg,
            rgba(244, 63, 94, 0.10) 60deg,
            rgba(251, 146, 60, 0.12) 120deg,
            rgba(236, 72, 153, 0.08) 180deg,
            rgba(251, 191, 36, 0.06) 240deg,
            transparent 300deg,
            transparent 360deg
          );
          animation: spin-conic 60s linear infinite;
          mix-blend-mode: screen;
          opacity: 0.7;
        }
        @keyframes drift1 {
          0% {
            transform: translate(0, 0) scale(1);
            filter: blur(80px);
          }
          100% {
            transform: translate(18vw, 14vh) scale(1.18);
            filter: blur(110px);
          }
        }
        @keyframes drift2 {
          0% {
            transform: translate(0, 0) scale(1.05);
            filter: blur(80px);
          }
          100% {
            transform: translate(-16vw, 12vh) scale(0.9);
            filter: blur(100px);
          }
        }
        @keyframes drift3 {
          0% {
            transform: translate(0, 0) scale(1);
            filter: blur(90px);
          }
          100% {
            transform: translate(-12vw, -10vh) scale(1.2);
            filter: blur(120px);
          }
        }
        @keyframes drift4 {
          0% {
            transform: translate(0, 0) scale(1);
            filter: blur(80px);
          }
          100% {
            transform: translate(14vw, -16vh) scale(1.1);
            filter: blur(105px);
          }
        }
        @keyframes spin-conic {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .aurora-blob,
          .aurora-conic {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
