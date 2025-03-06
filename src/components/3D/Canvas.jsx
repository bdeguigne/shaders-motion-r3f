import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { View, Loader, OrbitControls, Fisheye } from "@react-three/drei";
import { Effects } from "./Effects";

const ViewCanvas = () => {
  return (
    <>
      <Canvas
        className="fixed top-0 left-0 z-0"
        style={{
          width: "100vw",
          height: "100vh",
          position: "fixed",
        }}
        camera={{
          fov: 45,
          near: 0.1,
          far: 2000,
          position: [1, 2.5, 4],
        }}
        dpr={1.5}
        gl={{
          antialias: true,
        }}
      >
        <Suspense fallback={null}>
          <View.Port />
        </Suspense>

        <Effects />
      </Canvas>
      <Loader />
    </>
  );
};

export default ViewCanvas;
