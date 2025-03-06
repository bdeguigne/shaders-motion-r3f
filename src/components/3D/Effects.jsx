import { useLoader } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  Noise,
  Vignette,
  DepthOfField,
} from "@react-three/postprocessing";

export function Effects() {
  //   const texture = useLoader(LUTCubeLoader, "/F-6800-STD.cube");

  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.2}
        mipmapBlur
        luminanceSmoothing={0.2}
        intensity={0.25}
      />
    </EffectComposer>
  );
}
