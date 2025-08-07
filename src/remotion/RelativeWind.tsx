import React from 'react';

export const RelativeWind: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: 2,
        backgroundColor: 'black',
        top: '50%',
        left: 0,
        transform: 'translateY(-50%)',
      }}
    />
  );
};
