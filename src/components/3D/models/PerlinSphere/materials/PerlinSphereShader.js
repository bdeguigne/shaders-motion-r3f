import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";

// Vertex shader
const vertexShader = `
  varying vec3 vPosition;
  varying vec3 vOrigin;
  varying vec3 vDirection;
  
  uniform vec3 cameraPos;
  
  void main() {
    vec4 worldPosition = modelViewMatrix * vec4(position, 1.0);
    
    vPosition = position;
    vOrigin = vec3(inverse(modelMatrix) * vec4(cameraPos, 1.0)).xyz;
    vDirection = position - vOrigin;
    
    gl_Position = projectionMatrix * worldPosition;
  }
`;

// Fragment shader
const fragmentShader = `
  varying vec3 vPosition;
  varying vec3 vOrigin;
  varying vec3 vDirection;
  
  uniform sampler3D map;
  uniform sampler3D noise;
  uniform float time;
  uniform float cut;
  uniform vec3 color;
  uniform float steps;
  
  // Ray-sphere intersection
  vec2 hitSphere(vec3 origin, vec3 dir) {
    float radius = 0.5;
    float a = dot(dir, dir);
    float b = 2.0 * dot(origin, dir);
    float c = dot(origin, origin) - radius * radius;
    float discriminant = b * b - 4.0 * a * c;
    
    if (discriminant < 0.0) {
      return vec2(-1.0);
    } else {
      float disc = sqrt(discriminant);
      return vec2((-b - disc) / (2.0 * a), (-b + disc) / (2.0 * a));
    }
  }
  
  // Rotation matrix
  mat3 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat3(
      oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s,
      oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s,
      oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c
    );
  }
  
  // Sample the volume
  float sample1(vec3 p) {
    vec3 pr = p - 0.5;
    pr = rotationMatrix(vec3(0.0, 0.0, 1.0), time * 0.1) * pr;
    pr += 0.5;
    float s = texture(map, pr).r;
    
    pr = p - 0.5;
    pr = rotationMatrix(vec3(1.0, 0.0, 0.0), time * 0.2) * pr;
    pr += 0.5;
    float n = texture(noise, pr).r;
    
    return min(s, n);
  }
  
  void main() {
    vec3 rayDir = normalize(vDirection);
    vec2 bounds = hitSphere(vOrigin, rayDir);
    
    if (bounds.x >= bounds.y) discard;
    bounds.x = max(bounds.x, 0.0);
    
    vec3 p = vOrigin + bounds.x * rayDir;
    float delta = 1.0 / steps;
    
    vec4 lines = vec4(0.0);
    
    // Ray marching loop
    for (float t = bounds.x; t < bounds.y; t += delta) {
      float d = sample1(p + 0.5);
      
      // Line detection
      float e = length(vec2(dFdx(d), dFdy(d)));
      float f = abs(d - cut) - e;
      
      if (f < 0.0) {
        // Effet de pulsation avec une fonction sinusoïdale
        float pulse = 0.5 + 0.5 * sin(time * 0.5);
        // lines.rgb += vec3(0.1 + 0.2 * pulse);
        lines.rgb += vec3(0.15);
        lines.a += 0.1 * (1.0 + 0.5 * pulse);
      }
      
      p += rayDir * delta;
    }
    
    gl_FragColor = lines;
    gl_FragColor.rgb *= color;
  }
`;

// Création du shader material pour React Three Fiber
export const PerlinSphereMaterial = shaderMaterial(
  {
    map: null,
    noise: null,
    cameraPos: new THREE.Vector3(),
    time: 0.0,
    cut: 0.43,
    color: new THREE.Color(0x00aaff),
    steps: 100,
  },
  vertexShader,
  fragmentShader,
);
