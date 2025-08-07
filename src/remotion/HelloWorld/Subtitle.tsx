import { interpolate, useCurrentFrame } from 'remotion';

export const Subtitle: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [30, 50], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        fontSize: 40,
        textAlign: 'center',
        position: 'absolute',
        bottom: 140,
        width: '100%',
        opacity,
      }}
    >
      Edit
      {' '}
      <code>src/remotion/HelloWorld.tsx</code>
      {' '}
      and save to reload.
    </div>
  );
};
