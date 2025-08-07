import { interpolate, useCurrentFrame } from 'remotion';
import { Airfoil } from './Airfoil';
import { RelativeWind } from './RelativeWind';

export const AngleOfAttack: React.FC = () => {
  const frame = useCurrentFrame();
  const angle = interpolate(frame, [0, 150], [0, 20]);

  return (
    <div style={{ flex: 1, backgroundColor: 'lightblue' }}>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <Airfoil angle={angle} />
        <RelativeWind />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          fontSize: 40,
          color: 'black',
        }}
      >
        Angle of Attack:
        {' '}
        {angle.toFixed(2)}
        °
      </div>
    </div>
  );
};
