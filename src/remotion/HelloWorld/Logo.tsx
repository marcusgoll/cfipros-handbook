import { Img, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame,
    config: {
      damping: 200,
    },
  });

  return (
    <Img
      style={{
        position: 'absolute',
        width: 500,
        height: 500,
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${scale})`,
      }}
      src="https://raw.githubusercontent.com/remotion-dev/remotion/main/packages/create-video/assets/react-logo.svg"
    />
  );
};
