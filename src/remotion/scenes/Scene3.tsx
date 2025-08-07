import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

const AirfoilShape = () => (
  <path
    d="M 10 100 C 50 50, 150 50, 290 100 S 550 150, 10 100"
    fill="rgba(0, 0, 0, 0.2)"
    stroke="black"
    strokeWidth="2"
  />
);

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const arrowLength = interpolate(frame, [0, 30], [0, 300], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
      <svg width="800" height="400" viewBox="0 0 800 400">
        <g transform="translate(200, 100)">
          <AirfoilShape />
          {/* Relative Wind Arrow */}
          <line x1="-50" y1="100" x2={-50 + arrowLength} y2="100" stroke="red" strokeWidth="4" />
          {/* Arrowhead */}
          <path d={`M ${-50 + arrowLength - 10} ${95} L ${-50 + arrowLength} ${100} L ${-50 + arrowLength - 10} ${105}`} fill="red" />
          <text x="-40" y="70" fill="red" fontSize="28">
            Relative Wind
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
