import React, { useRef, useMemo, forwardRef } from "react";
import { useFrame } from "@react-three/fiber";

const Stars = forwardRef(({ count = 5000 }, ref) => {
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return positions;
  }, [count]);

  const pointsRef = useRef();

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points
      ref={(el) => {
        // Assigner la référence interne pour les animations locales
        pointsRef.current = el;
        // Assigner la référence externe pour les animations depuis le parent
        if (ref) ref.current = el;
      }}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        sizeAttenuation
        transparent
        opacity={0} // Commencer avec une opacité de 0 pour l'animation
      />
    </points>
  );
});

export default Stars;
