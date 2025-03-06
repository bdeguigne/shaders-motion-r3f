import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import {
  Environment,
  Float,
  Box,
  MeshReflectorMaterial,
  ContactShadows,
} from "@react-three/drei";
import { useGSAP } from "@gsap/react";
import { useFrame, useThree } from "@react-three/fiber";
import Stars from "./Stars";
import TurbulencePlane from "./models/TurbulencePlane/TurbulencePlane";
import PerlinSphere from "./models/PerlinSphere/PerlinSphere";
import { Effects } from "./Effects";
import { gsap } from "gsap";

export default function Scene() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const cameraPosition = useRef(new THREE.Vector3(0, 0, 5));
  const targetPosition = useRef(new THREE.Vector3(0, 0, 0));

  // Définir les paramètres de la caméra comme constantes pour réutilisation
  const CAMERA_INITIAL_X = -2; // Décalé vers la gauche pour laisser place au texte
  const CAMERA_INITIAL_Y = 3;
  const CAMERA_INITIAL_Z = 4;
  const CAMERA_LOOK_AT = new THREE.Vector3(0, 0, 0);

  // Références pour les anneaux lumineux et le plan de turbulence
  const ringHaloRef = useRef();
  const turbulencePlaneRef = useRef();
  const starsRef = useRef();
  const perlinSphereRef = useRef();

  // Animation des anneaux lumineux et rotation du groupe de sphères
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (ringHaloRef.current && ringHaloRef.current.material) {
      // Variation de l'opacité pour l'anneau de halo
      ringHaloRef.current.material.opacity = 0.8 + Math.sin(t * 1.2) * 0.2;
    }
  });

  useEffect(() => {
    // Configuration initiale de la caméra avec une position plus élevée
    camera.position.set(CAMERA_INITIAL_X, CAMERA_INITIAL_Y, CAMERA_INITIAL_Z);
    camera.lookAt(CAMERA_LOOK_AT); // Viser le centre
  }, [camera]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Animation de la caméra basée sur la souris
    const radius = 5;
    const theta = mouse.current.x * Math.PI * 0.2;
    const phi = mouse.current.y * Math.PI * 0.1;

    // Ajout d'un décalage en hauteur (offset Y) pour maintenir la caméra plus haute
    const heightOffset = 2.0; // Ajustez cette valeur selon vos préférences

    // const x = radius * Math.sin(theta) * 0.5;
    // const y = radius * Math.sin(phi) * 0.5 + heightOffset; // Ajout de l'offset en hauteur
    // const z = radius;

    // cameraPosition.current.set(x, y, z);
    // camera.position.lerp(cameraPosition.current, 0.02);

    // Ajuster le point de visée légèrement vers le bas
    targetPosition.current.set(0, -0.2, 0); // Viser un peu plus bas que le centre
    camera.lookAt(targetPosition.current);
  });

  useGSAP(() => {
    if (!ringHaloRef.current || !turbulencePlaneRef.current) return;

    // Création d'une timeline pour séquencer les animations avec répétition
    const tl = gsap.timeline({
      repeat: -1, // -1 signifie répéter indéfiniment
      onRepeat: () => {
        // Réinitialiser les éléments pour le prochain cycle
        if (turbulencePlaneRef.current && turbulencePlaneRef.current.material) {
          turbulencePlaneRef.current.material.uniforms.uOpacity.value = 0;
          turbulencePlaneRef.current.visible = true;
        }

        if (ringHaloRef.current) {
          ringHaloRef.current.scale.set(0, 0, 0);
        }

        if (starsRef.current && starsRef.current.material) {
          starsRef.current.material.opacity = 0;
        }

        if (perlinSphereRef.current) {
          perlinSphereRef.current.scale.set(0, 0, 0);
        }

        // Réinitialiser la caméra à sa position initiale (décalée vers la gauche)
        camera.position.set(
          CAMERA_INITIAL_X,
          CAMERA_INITIAL_Y,
          CAMERA_INITIAL_Z,
        );
        camera.lookAt(CAMERA_LOOK_AT);
      },
    });

    // Animation du halo de lumière
    tl.to(ringHaloRef.current.scale, {
      x: 2.1,
      y: 2.1,
      z: 2.1,
      delay: 0.5,
      duration: 1,
      ease: "power2.inOut",
    });

    // Animation du plan de turbulence après le halo
    // S'assurer que les paramètres d'apparition sont initialisés à 0
    if (turbulencePlaneRef.current.material.uniforms.uOpacity) {
      turbulencePlaneRef.current.material.uniforms.uOpacity.value = 0;
    }
    if (turbulencePlaneRef.current.material.uniforms.elevationIntensity) {
      turbulencePlaneRef.current.material.uniforms.elevationIntensity.value = 0;
    }
    tl.to(
      turbulencePlaneRef.current.material.uniforms.uOpacity,
      {
        value: 1.0,
        duration: 1.0,
        ease: "power2.inOut",
      },
      "<+0.2", // Démarrer après le début de l'animation du halo
    );
    tl.to(
      turbulencePlaneRef.current.material.uniforms.elevationIntensity,
      {
        value: 1.4,
        duration: 1.5,
        ease: "power4.inOut",
      },
      "<+0.4", // Commencer avant la fin de l'animation d'apparition
    );

    // Animation pour décaler la caméra vers la gauche
    tl.to(
      camera.position,
      {
        x: CAMERA_INITIAL_X - 1.5, // Décaler encore plus vers la gauche
        duration: 1.5,
        ease: "power2.inOut",
      },
      "<+0.2",
    );

    // Animation de l'intensité d'élévation pour faire disparaître progressivement le plan
    tl.to(
      turbulencePlaneRef.current.material.uniforms.elevationIntensity,
      {
        value: 0.0,
        duration: 1.5,
        ease: "power4.inOut",
      },
      ">+2.5", // Démarrer après la fin de l'animation d'apparition
    );

    // Animation de l'opacité pour faire disparaître progressivement le plan
    tl.to(
      turbulencePlaneRef.current.material.uniforms.uOpacity,
      {
        value: 0.0,
        duration: 1.0,
        ease: "power4.inOut",
        onComplete: () => {
          if (turbulencePlaneRef.current) {
            turbulencePlaneRef.current.visible = false;
          }
        },
      },
      "<+.4", // Démarrer après la fin de l'animation d'apparition
    );

    tl.to(
      ringHaloRef.current.scale,
      {
        x: 1.4,
        y: 1.4,
        z: 1.4,
        duration: 1,
        ease: "power2.inOut",
      },
      "<+0.4",
    );

    // Animation de l'apparition des étoiles après la disparition du plan
    // D'abord, s'assurer que les étoiles sont invisibles au début
    if (starsRef.current && starsRef.current.material) {
      starsRef.current.material.opacity = 0;
    }

    // Puis les faire apparaitre progressivement
    tl.to(
      starsRef.current.material,
      {
        opacity: 0.8,
        duration: 2.5,
        ease: "power1.inOut",
      },
      ">-0.5", // Commencer un peu avant la fin de l'animation précédente
    );

    // Animation de l'apparition de la sphère
    if (perlinSphereRef.current && perlinSphereRef.current.scale) {
      // perlinSphereRef.current.scale.set(0, 0, 0);
    }

    tl.to(
      perlinSphereRef.current.scale,
      {
        x: 1.5,
        y: 1.5,
        z: 1.5,
        duration: 1.5,
        ease: "power4.inOut",
      },
      "<-0.35",
    );

    tl.to(
      perlinSphereRef.current.scale,
      {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.5,
        ease: "power4.inOut",
      },
      ">+5.0",
    );

    // Animation de rotation 360° de la caméra autour de la scène
    // Créer un objet pour stocker la progression de la rotation
    const cameraRotation = { progress: 0 };

    // Utiliser les constantes définies pour les paramètres de la caméra
    const fixedY = CAMERA_INITIAL_Y; // Hauteur Y exacte comme dans la configuration initiale
    const fixedRadius = Math.sqrt(
      CAMERA_INITIAL_X * CAMERA_INITIAL_X + CAMERA_INITIAL_Z * CAMERA_INITIAL_Z,
    ); // Rayon calculé à partir de la position initiale

    // Point central que la caméra regarde
    const lookAtTarget = CAMERA_LOOK_AT.clone();

    // Calculer l'angle initial (basé sur la position initiale)
    const initialAngle = Math.atan2(CAMERA_INITIAL_X, CAMERA_INITIAL_Z);

    // Animer la rotation complète (360 degrés)
    tl.to(
      cameraRotation,
      {
        progress: 1, // Animer de 0 à 1 (progression complète)
        duration: 2,
        ease: "power4.inOut",
        onStart: function () {
          // Positionner la caméra au point de départ exact pour éviter tout saut
          camera.position.set(
            CAMERA_INITIAL_X,
            CAMERA_INITIAL_Y,
            CAMERA_INITIAL_Z,
          );
          camera.lookAt(lookAtTarget);
        },
        onUpdate: function () {
          // Calculer l'angle actuel en fonction de la progression
          const currentAngle =
            initialAngle + cameraRotation.progress * Math.PI * 2;

          // Positionner la caméra sur un cercle parfait avec les paramètres fixes
          // Ajuster le rayon et décaler le centre pour garder la scène décalée vers la gauche
          const offsetX = -1.5; // Décalage du centre du cercle vers la gauche
          camera.position.x = Math.sin(currentAngle) * fixedRadius + offsetX;
          camera.position.z = Math.cos(currentAngle) * fixedRadius;
          camera.position.y = fixedY; // Fixer la hauteur exactement comme au début

          // Orienter la caméra vers le point légèrement en dessous du centre
          camera.lookAt(lookAtTarget);
        },
      },
      ">-1.25", // Commencer un peu avant la fin de l'animation précédente
    );

    tl.to(
      starsRef.current.material,
      {
        opacity: 0,
        duration: 0.5,
        ease: "power1.inOut",
      },
      ">-1.25",
    );

    tl.to(
      ringHaloRef.current.scale,
      {
        x: 0,
        y: 0,
        z: 0,
        delay: 0.5,
        duration: 0.75,
        ease: "power2.inOut",
      },
      ">-1.5",
    );

    // Ajouter une pause à la fin pour marquer la fin du cycle
    // tl.to({}, { });
  }, []);

  return (
    <>
      <group>
        <color attach="background" args={["#15151a"]} />
        <mesh
          ref={ringHaloRef}
          scale={0}
          position={[0, -0.04, 0]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2.5]}
        >
          <ringGeometry args={[1, 1.05, 100, 1]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={1}
            toneMapped={false}
            transparent={true}
            opacity={0.5}
          />
        </mesh>

        <TurbulencePlane ref={turbulencePlaneRef} />

        <PerlinSphere ref={perlinSphereRef} position={[0, 0, 0]} scale={0} />

        <Stars ref={starsRef} />

        <Environment preset="dawn" />
        <Effects />
      </group>
    </>
  );
}
