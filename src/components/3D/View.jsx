import React from "react";
import { View as ViewThree, OrbitControls, Stage } from "@react-three/drei";
import Scene from "./Scene";
import { Effects } from "./Effects";

export default function View() {
  return (
    <ViewThree className="fixed top-0 z-50 h-screen w-screen">
      <OrbitControls />
      <Scene />
    </ViewThree>
  );
}
