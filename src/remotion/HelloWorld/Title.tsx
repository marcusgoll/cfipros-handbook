import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Title: React.FC<{
  titleText: string;
  titleColor: string;
}> = ({ titleText, titleColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame,
  });

  return (
    <h1
      style={{
        color: titleColor,
        fontSize: 100,
        textAlign: 'center',
        position: 'absolute',
        bottom: 160,
        width: '100%',
        transform: `scale(${scale})`,
      }}
    >
      {titleText}
    </h1>
  );
};
