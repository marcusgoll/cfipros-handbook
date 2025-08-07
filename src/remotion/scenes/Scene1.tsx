import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

const Title: React.FC<{ text: string }> = ({ text }) => (
  <h1 style={{ fontSize: '5em', color: 'white', textAlign: 'center' }}>{text}</h1>
);

const Subtitle: React.FC<{ text: string }> = ({ text }) => (
  <p style={{ fontSize: '2.5em', color: 'white', textAlign: 'center', margin: 0 }}>{text}</p>
);

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const backgroundUrl = staticFile('image.png'); // Assuming a background image in public/

  return (
    <AbsoluteFill>
      <Img src={backgroundUrl} width={width} height={height} style={{ objectFit: 'cover' }} />
      <AbsoluteFill style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
        <Title text="The Angle of Attack" />
        <Subtitle text="Mastering the Critical Relationship Between Wing and Wind" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
