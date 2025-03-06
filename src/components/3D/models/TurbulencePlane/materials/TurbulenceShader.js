import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

const vertex = `
  varying vec2 vUv;
  varying float vElevation;
  uniform float uTime;
  uniform float elevationIntensity;
  
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p * frequency);
      frequency *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Calcul de l'élévation avec plus d'amplitude et de détails
    float elevation = fbm(uv * 6.0 + uTime * 0.1) * (1.0 - smoothstep(0.2, 0.8, length(uv - 0.5) * 1.7)); // Terrain plat aux bords
    
    // Effet de fondu vers les bords pour un terrain plat aux extrémités
    float edgeFactor = 1.0 - smoothstep(0.4, 0.8, length(uv - 0.5) * 1.7);
    
    // Appliquer l'élévation avec une amplitude beaucoup plus importante
    pos.z += elevation * elevationIntensity;
    
    // Stocker l'élévation pour le fragment shader
    vElevation = elevation;
    
    // Calcul de la position finale
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment Shader
const fragment = `
varying vec2 vUv;
  varying float vElevation;
  uniform vec3 uColor;
  uniform vec3 lowColor;
  uniform vec3 highColor;
  uniform float uOpacity; // Paramètre d'opacité globale
  
  void main() {
    // Calcul de la distance depuis le centre pour l'effet de fade sur les bords
    float distanceFromCenter = length(vUv - 0.5) * 2.0;
    float edgeFade = 1.0 - smoothstep(0.3, 0.9, distanceFromCenter);
    
    // Création des lignes de contour colorées
    // Lignes horizontales basées sur l'élévation
    float lineThickness = 0.03; // Épaisseur des lignes
    float lineSpacing = 40.0; // Espacement des lignes
    float lineValue = abs(fract(vElevation * lineSpacing) - 0.5);
    float horizontalLines = smoothstep(lineThickness, lineThickness + 0.08, lineValue);
    
    // Contours des reliefs
    float derivatives = length(vec2(dFdx(vElevation), dFdy(vElevation))) * 15.0;
    float outline = smoothstep(0.05, 0.2, derivatives);
    
    // Dégradé de couleur pour les lignes en fonction de l'altitude
    float heightFactor = smoothstep(0.0, 0.8, vElevation);
    // vec3 lowColor = low // Bleu pour les zones basses
    vec3 highColor = vec3(1.0, 0.3, 0.7); // Rose pour les sommets
    vec3 lineColor = mix(lowColor, highColor, heightFactor);
    
    // Couleur de base noire pour les montagnes
    vec3 baseColor = vec3(0.0, 0.0, 0.0); // Noir
    
    // Application des lignes colorées sur fond noir
    float lineIntensity = (1.0 - horizontalLines) * 1.5 + outline * 0.9;
    vec3 color = mix(baseColor, lineColor, lineIntensity);
    
    // Application de l'opacité sur les bords avec effet d'apparition progressif
    float finalOpacity = edgeFade * uOpacity;
    
    // Effet de scintillement subtil pour les lignes lors de l'apparition
    if (uOpacity < 0.9) {
      // Ajouter un léger scintillement aux lignes quand l'opacité est faible
      float shimmer = sin(distanceFromCenter * 10.0 + vElevation * 20.0) * 0.5 + 0.5;
      shimmer = mix(0.7, 1.0, shimmer) * uOpacity;
      finalOpacity *= shimmer;
    }
    
    gl_FragColor = vec4(color, finalOpacity);
  }
`;

export const TurbulenceShader = shaderMaterial(
  {
    uTime: 0.0,
    uColor: new THREE.Color(0x0000),
    lowColor: new THREE.Color(0x00aaff),
    elevationIntensity: 1.4,
    uOpacity: 0.0, // Opacité initiale à 0
  },
  vertex,
  fragment,
);

// Ajouter les propriétés nécessaires pour que Three.js reconnaisse correctement le matériau
// TurbulenceShader.prototype.isMaterial = true;
// TurbulenceShader.prototype.isShaderMaterial = true;
