import React from 'react';
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// Helper Components
const Title: React.FC<{ text: string }> = ({ text }) => (
  <h1 style={{
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    fontSize: 80,
    textAlign: 'center',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
  }}
  >
    {text}
  </h1>
);

const Subtitle: React.FC<{ text: string }> = ({ text }) => (
  <p style={{
    fontFamily: 'sans-serif',
    fontSize: 40,
    textAlign: 'center',
    color: '#f1f1f1',
    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
  }}
  >
    {text}
  </p>
);

const LowerThird: React.FC<{ name: string; title: string }> = ({ name, title }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const slideIn = interpolate(frame, [0, 20], [-100, 0], { extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute',
      bottom: 50,
      left: 50,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: '10px 20px',
      borderRadius: '10px',
      transform: `translateY(${slideIn}px)`,
      opacity,
    }}
    >
      <div style={{ fontSize: 32, color: 'white', fontWeight: 'bold' }}>{name}</div>
      <div style={{ fontSize: 24, color: '#cccccc' }}>{title}</div>
    </div>
  );
};

const VoiceOverText: React.FC<{ text: string; koreanText: string }> = ({ text, koreanText }) => {
  return (
    <div style={{
      position: 'absolute',
      bottom: 150,
      width: '90%',
      left: '5%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: '15px',
      borderRadius: '8px',
      textAlign: 'center',
    }}
    >
      <p style={{ color: 'white', fontSize: 28, margin: 0 }}>{text}</p>
      <p style={{ color: '#a0a0a0', fontSize: 22, margin: '10px 0 0 0' }}>{koreanText}</p>
    </div>
  );
};

// Main Component
export const AngleOfAttackLesson: React.FC = () => {
  const { fps } = useVideoConfig();

  // Scene durations (in seconds)
  const scene1Duration = 10; // Intro

  return (
    <AbsoluteFill style={{ backgroundColor: '#eef1f4' }}>
      {/* Placeholder for voice-over audio. You will need to provide the actual audio file. */}
      {/* <Audio src={staticFile("vo_scene1.mp3")} /> */}

      {/* === SCENE 1: INTRODUCTION (0s - 10s) === */}
      <Sequence from={0} durationInFrames={scene1Duration * fps}>
        <AbsoluteFill>
          <Img src={staticFile('image.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <AbsoluteFill style={{ backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
            <Title text="Angle of Attack: The Key to Flight" />
            <Subtitle text="비행의 핵심: 받음각" />
          </AbsoluteFill>
          <LowerThird name="Your Name" title="Flight Instructor" />
          <VoiceOverText
            text="Welcome. In this lesson, we’ll explore one of the most fundamental concepts in aviation: the Angle of Attack."
            koreanText="안녕하세요. 이번 레슨에서는 항공에서 가장 기본적인 개념 중 하나인 받음각에 대해 알아보겠습니다."
          />
        </AbsoluteFill>
      </Sequence>

    </AbsoluteFill>
  );
};
