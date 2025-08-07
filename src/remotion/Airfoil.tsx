import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

const AirfoilShape = () => (
  <path
    d="M 10 100 C 50 50, 150 50, 290 100 S 550 150, 10 100"
    fill="rgba(0, 0, 0, 0.2)"
    stroke="black"
    strokeWidth="2"
  />
);

const AngleOfAttackIndicator = ({ angle }: { angle: number }) => (
  <g transform={`rotate(${angle} 150 100)`}>
    <line x1="0" y1="100" x2="300" y2="100" stroke="red" strokeWidth="2" />
    <text x="310" y="105" fill="red" fontSize="20">
      {angle.toFixed(1)}
      °
    </text>
  </g>
);

export const Airfoil: React.FC<{ angle?: number }> = ({ angle: propAngle }) => {
  const frame = useCurrentFrame();
  const angle = propAngle ?? Math.sin(frame / 30) * 15; // Animate angle between -15 and 15 degrees

  return (
    <AbsoluteFill style={{ backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
      <svg width="400" height="200" viewBox="0 0 400 200">
        <g transform="translate(50, 0)">
          <AirfoilShape />
          <AngleOfAttackIndicator angle={angle} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
