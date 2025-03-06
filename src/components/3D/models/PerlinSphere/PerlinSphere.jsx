import React, { useRef, useMemo, useEffect, forwardRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, extend } from "@react-three/fiber";
import { perlin3 } from "./perlin.js";
import { PerlinSphereMaterial } from "./materials/PerlinSphereShader";

extend({ PerlinSphereMaterial });

const PerlinSphere = forwardRef(({ position = [0, 0, 0], scale = 2 }, ref) => {
  const materialRef = useRef();
  const { camera } = useThree();

  // Création des données 3D pour les textures
  const textureData = useMemo(() => {
    const size = 128; // Taille de la texture 3D
    const data = new Float32Array(size * size * size);
    const noiseData = new Float32Array(size * size * size);

    // Génération de la sphère
    const generateSphere = (data, size) => {
      const center = new THREE.Vector3(0.5, 0.5, 0.5);
      const radius = 1;

      for (let z = 0; z < size; z++) {
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const position = new THREE.Vector3(x / size, y / size, z / size);
            const distance = position.distanceTo(center);
            const index = x + y * size + z * size * size;
            data[index] = 1.0 - distance / radius;
          }
        }
      }
    };

    // Fonction de bruit perlin
    const perlin = (x, y, z) => {
      return 0.5 + 0.5 * perlin3(x, y, z);
    };

    // Génération du bruit
    const generateNoise = (data, size) => {
      const scale = 4;
      const offset = Math.random() * 100; // Offset aléatoire pour la variation

      for (let z = 0; z < size; z++) {
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const index = x + y * size + z * size * size;
            // Normalisation des coordonnées dans l'intervalle [-0.5, 0.5], puis mise à l'échelle
            const nx = (x / size - 0.5) * scale + offset;
            const ny = (y / size - 0.5) * scale + offset;
            const nz = (z / size - 0.5) * scale + offset;

            data[index] = perlin(nx, ny, nz);
          }
        }
      }
    };

    generateSphere(data, size);
    generateNoise(noiseData, size);

    return { data, noiseData, size };
  }, []);

  // Création des textures 3D
  const { texture, noiseTexture } = useMemo(() => {
    const { data, noiseData, size } = textureData;

    // Texture pour la sphère
    const texture = new THREE.Data3DTexture(data, size, size, size);
    texture.format = THREE.RedFormat;
    texture.type = THREE.FloatType;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.unpackAlignment = 1;
    texture.needsUpdate = true;

    // Texture pour le bruit
    const noiseTexture = new THREE.Data3DTexture(noiseData, size, size, size);
    noiseTexture.format = THREE.RedFormat;
    noiseTexture.type = THREE.FloatType;
    noiseTexture.minFilter = THREE.LinearFilter;
    noiseTexture.magFilter = THREE.LinearFilter;
    noiseTexture.unpackAlignment = 1;
    noiseTexture.needsUpdate = true;

    return { texture, noiseTexture };
  }, [textureData]);

  // Animation et mise à jour des uniforms
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
      materialRef.current.uniforms.cameraPos.value.copy(camera.position);
    }
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <perlinSphereMaterial
        ref={materialRef}
        key="perlinSphereMaterial"
        map={texture}
        noise={noiseTexture}
        cameraPos={camera.position}
        color={new THREE.Color(0x00aaff)}
        transparent
        side={THREE.BackSide}
      />
    </mesh>
  );
});

export default PerlinSphere;
