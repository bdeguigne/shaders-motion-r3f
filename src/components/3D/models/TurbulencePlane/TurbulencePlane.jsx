import React, { useRef, useMemo, forwardRef } from "react";
import { TurbulenceShader } from "./materials/TurbulenceShader";
import { extend, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Enregistrer le shader comme un élément React
extend({ TurbulenceShader });

const TurbulencePlane = forwardRef((props, ref) => {
  // Référence au matériau pour pouvoir le mettre à jour
  const materialRef = useRef();

  // Créer une instance du matériau pour s'assurer qu'il est correctement initialisé
  const turbulenceMaterial = useMemo(() => {
    const material = new TurbulenceShader();
    // Initialiser les uniforms manuellement si nécessaire
    // Configuration essentielle pour le displacement

    // Initialiser elevationIntensity à 0 pour l'animation
    if (material.uniforms && material.uniforms.elevationIntensity) {
      material.uniforms.elevationIntensity.value = 0;
    }

    // Activer le displacement
    material.wireframe = false;
    material.transparent = true;
    material.side = THREE.DoubleSide;

    return material;
  }, []);

  // Mettre à jour le temps du shader à chaque frame
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
      // L'intensité sera animée par GSAP, donc on ne la met plus à jour ici
    }
  });

  return (
    <mesh
      ref={ref}
      position={[0, -0.04, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      {...props}
    >
      <planeGeometry args={[5, 5, 256, 256]} />
      <primitive
        object={turbulenceMaterial}
        ref={materialRef}
        attach="material"
      />
    </mesh>
  );
});

export default TurbulencePlane;
