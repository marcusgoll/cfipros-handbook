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

const Label: React.FC<{ text: string; x: number; y: number; color: string; delay: number }>
  = ({ text, x, y, color, delay }) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [delay, delay + 30], [0, 1], { extrapolateRight: 'clamp' });
    return (
      <text x={x} y={y} fill={color} fontSize="24" style={{ opacity }}>
        {text}
      </text>
    );
  };

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
      <svg width="800" height="400" viewBox="0 0 800 400">
        <g transform="translate(200, 100)">
          <AirfoilShape />

          {/* Leading Edge */}
          <circle cx="10" cy="100" r="5" fill="blue" />
          <Label text="Leading Edge" x={20} y={90} color="blue" delay={30} />

          {/* Trailing Edge */}
          <circle cx="290" cy="100" r="5" fill="green" />
          <Label text="Trailing Edge" x={200} y={90} color="green" delay={60} />

          {/* Chord Line */}
          <line x1="10" y1="100" x2="290" y2="100" stroke="purple" strokeWidth="2" />
          <Label text="Chord Line" x={100} y={125} color="purple" delay={90} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
