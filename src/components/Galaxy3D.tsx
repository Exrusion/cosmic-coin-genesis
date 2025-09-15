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
  
  // Galaxy positioning - spread galaxies in 3D grid pattern for accessibility
  const galaxyPosition: [number, number, number] = [
    (galaxyIndex % 3 - 1) * 80, // X: -80, 0, 80 (3 columns)
    (Math.floor(galaxyIndex / 3) % 3 - 1) * 60, // Y: -60, 0, 60 (3 rows) 
    Math.floor(galaxyIndex / 9) * -80 - 40 // Z: layers every 9 galaxies
  ];

  // Slow galaxy rotation
  useFrame((state) => {
    if (galaxyRef.current) {
      galaxyRef.current.rotation.y += 0.001;
    }
  });

  // Arrange planets in a spiral galaxy pattern
  const arrangePlanetsInGalaxy = (planetList: typeof planets) => {
    return planetList.map((planet, index) => {
      const angle = (index / planetList.length) * Math.PI * 4; // Multiple spirals
      const radius = 15 + Math.sqrt(index) * 3; // Wider spread, growing outward
      const spiralOffset = index * 0.8; // Spiral arm effect
      const height = Math.sin(index * 0.2) * 2; // Slight vertical variation
      
      return {
        ...planet,
        position: [
          Math.cos(angle + spiralOffset) * radius,
          height,
          Math.sin(angle + spiralOffset) * radius
        ] as [number, number, number]
      };
    });
  };

  const arrangedPlanets = arrangePlanetsInGalaxy(planets);

  return (
    <group ref={galaxyRef} position={galaxyPosition}>
      {/* Galaxy central bulge */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial 
          color="#FFD700" 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      {/* Inner galaxy disk */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[8, 20, 64]} />
        <meshBasicMaterial 
          color="#4A90E2" 
          transparent 
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Middle galaxy disk */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[18, 35, 64]} />
        <meshBasicMaterial 
          color="#9B59B6" 
          transparent 
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Outer galaxy disk */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[32, 50, 64]} />
        <meshBasicMaterial 
          color="#E74C3C" 
          transparent 
          opacity={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Galaxy halo */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[45, 65, 64]} />
        <meshBasicMaterial 
          color="#F39C12" 
          transparent 
          opacity={0.04}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Spiral arms effect */}
      {[0, 1, 2].map((armIndex) => (
        <mesh 
          key={armIndex}
          position={[0, 0.5, 0]} 
          rotation={[Math.PI / 2, armIndex * (Math.PI * 2 / 3), 0]}
        >
          <ringGeometry args={[10, 45, 32, 1, 0, Math.PI / 3]} />
          <meshBasicMaterial 
            color="#3498DB" 
            transparent 
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

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