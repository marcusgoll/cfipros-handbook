import { Composition, registerRoot } from 'remotion';
import { MyComposition } from './MyComposition';

const RemotionRoot = () => (
  <>
    <Composition
      id="MyComposition"
      component={MyComposition}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);

registerRoot(RemotionRoot);
