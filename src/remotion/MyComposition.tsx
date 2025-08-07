import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';

export const MyComposition = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps, width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: 'white' }}>
      <Sequence from={0} durationInFrames={durationInFrames}>
        <div style={{
          flex: 1,
          textAlign: 'center',
          fontSize: '7em',
          color: 'black',
        }}
        >
          The current frame is
          {' '}
          {frame}
          .
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
