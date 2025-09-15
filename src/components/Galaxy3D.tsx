import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Planet3D } from "./Planet3D";
import * as THREE from "three";

interface Galaxy3DProps {
  planets: { position: [number, number, number], id: string, isNew?: boolean, createdAt?: number }[];
  galaxyIndex: number;
  lifeEvents: { type: 'birth' | 'death', id: string, timestamp: number }[];
  marketTrend: 'up' | 'down' | 'stable';
}

export const Galaxy3D = ({ planets, galaxyIndex, lifeEvents, marketTrend }: Galaxy3DProps) => {
  const galaxyRef = useRef<THREE.Group>(null);
  
  // Galaxy positioning - spread galaxies in a grid pattern
  const galaxyPosition: [number, number, number] = [
    (galaxyIndex % 3 - 1) * 40, // X: -40, 0, 40
    Math.floor(galaxyIndex / 3) % 2 * 30 - 15, // Y: -15, 15
    Math.floor(galaxyIndex / 6) * -30 - 20 // Z: deeper for more galaxies
  ];

  // Slow galaxy rotation
  useFrame((state) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y += 0.001;
    }
  });

  // Arrange planets in a circular pattern within the galaxy
  const arrangePlanetsInGalaxy = (planetList: typeof planets) => {
    return planetList.map((planet, index) => {
      const angle = (index / planetList.length) * Math.PI * 2;
      const radius = 8 + Math.sin(index * 0.5) * 2; // Varying radius for spiral effect
      const height = Math.sin(index * 0.3) * 1.5; // Slight vertical variation
      
      return {
        ...planet,
        position: [
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ] as [number, number, number]
      };
    });
  };

  const arrangedPlanets = arrangePlanetsInGalaxy(planets);

  return (
    <group ref={galaxyRef} position={galaxyPosition}>
      {/* Galaxy core glow */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial 
          color="#FFD700" 
          transparent 
          opacity={0.6}
        />
      </mesh>
      
      {/* Galaxy disk */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[6, 12, 32]} />
        <meshBasicMaterial 
          color="#4A90E2" 
          transparent 
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Outer galaxy ring */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[10, 14, 32]} />
        <meshBasicMaterial 
          color="#9B59B6" 
          transparent 
          opacity={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Planets within the galaxy */}
      {arrangedPlanets.map((planet, index) => (
        <Planet3D
          key={planet.id}
          position={planet.position}
          index={index}
          lifeEvents={lifeEvents}
          marketTrend={marketTrend}
          isNewPlanet={planet.isNew}
        />
      ))}
    </group>
  );
};