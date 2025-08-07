import React from 'react';
import { AbsoluteFill, Sequence, staticFile } from 'remotion';

const scenes = [
  { duration: 120, vo: { en: 'Welcome to CFI PROs. Today, we’re diving deep into one of the most fundamental concepts in aviation: the Angle of Attack.', ko: 'CFI PROs에 오신 것을 환영합니다. 오늘 우리는 항공에서 가장 기본적인 개념 중 하나인 받음각에 대해 깊이 알아볼 것입니다.' } },
  { duration: 150, vo: { en: 'First, let’s understand the basic structure of a wing, known as an airfoil.', ko: '먼저, 에어포일이라고 알려진 날개의 기본 구조를 이해해 보겠습니다.' } },
  // ... more scenes
];

const Subtitle: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: 'absolute', bottom: 50, width: '100%', textAlign: 'center', fontSize: '2.5em', color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: 10 }}>
    {text}
  </div>
);

const Scene1: React.FC<{ vo: { en: string; ko: string } }> = ({ vo }) => (
  <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
    <img src={staticFile('image.png')} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
    <div style={{ color: 'white', fontSize: '6em', textAlign: 'center' }}>Angle of Attack</div>
    <Subtitle text={vo.en} />
  </AbsoluteFill>
);

export const AirfoilExplainer: React.FC = () => {
  let totalFrames = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: 'white' }}>
      {scenes.map((scene, i) => {
        const startFrame = totalFrames;
        totalFrames += scene.duration;
        if (i === 0) {
          return (
            <Sequence key={i} from={startFrame} durationInFrames={scene.duration}>
              <Scene1 vo={scene.vo} />
            </Sequence>
          );
        }
        return null;
      })}
    </AbsoluteFill>
  );
};
