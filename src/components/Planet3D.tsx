import { useRef, useEffect, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Sphere, Ring } from '@react-three/drei';
import * as THREE from 'three';

// Import texture assets
import moonTexture from '@/assets/textures/moon-texture.png';
import gasGiantTexture from '@/assets/textures/gas-giant-texture.jpg';
import venusTexture from '@/assets/textures/venus-texture.jpeg';
import marsTexture from '@/assets/textures/mars-texture.jpg';
import rockyTexture from '@/assets/textures/rocky-texture.jpg';
import marsSurfaceTexture from '@/assets/textures/mars-surface-texture.jpg';

interface Planet3DProps {
  position: [number, number, number];
  index: number;
  lifeEvents: { type: 'birth' | 'death', id: string, timestamp: number }[];
  marketTrend: 'up' | 'down' | 'stable';
  isNewPlanet?: boolean;
}

type LifeStage = 'empty' | 'forming' | 'growing' | 'mature' | 'dying' | 'dead';
type PlanetType = 'earth' | 'mars' | 'venus' | 'gas' | 'ice' | 'volcanic';

export const Planet3D = ({ position, index, lifeEvents, marketTrend, isNewPlanet = false }: Planet3DProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  const [stage, setStage] = useState<LifeStage>('mature'); // Always start mature for visibility
  const [energy, setEnergy] = useState(100);
  const [planetType, setPlanetType] = useState<PlanetType>(() => {
    const types: PlanetType[] = ['earth', 'mars', 'venus', 'gas', 'ice', 'volcanic'];
    return types[Math.floor(Math.random() * types.length)];
  });
  const [rotationSpeed, setRotationSpeed] = useState(Math.random() * 0.02 + 0.01);
  
  // Orbital parameters
  const orbitalRadius = Math.sqrt(position[0] ** 2 + position[2] ** 2);
  const orbitalSpeed = (0.1 + Math.random() * 0.2) / Math.max(orbitalRadius, 1); // Slower for distant planets
  const initialAngle = Math.atan2(position[2], position[0]);

  // Auto-evolve new planets to show textures immediately
  useEffect(() => {
    if (isNewPlanet && stage === 'forming') {
      const timer1 = setTimeout(() => setStage('growing'), 1000);
      const timer2 = setTimeout(() => setStage('mature'), 2500);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isNewPlanet, stage]);

  // Load textures for different planet types
  const getTextureByType = (type: PlanetType) => {
    switch (type) {
      case 'earth': return useLoader(THREE.TextureLoader, rockyTexture);
      case 'mars': return useLoader(THREE.TextureLoader, marsTexture);
      case 'venus': return useLoader(THREE.TextureLoader, venusTexture);
      case 'gas': return useLoader(THREE.TextureLoader, gasGiantTexture);
      case 'ice': return useLoader(THREE.TextureLoader, moonTexture);
      case 'volcanic': return useLoader(THREE.TextureLoader, marsSurfaceTexture);
      default: return useLoader(THREE.TextureLoader, moonTexture);
    }
  };

  const texture = getTextureByType(planetType);

  const getSize = () => {
    switch (stage) {
      case 'empty': return 0.8;
      case 'forming': return 1.2;
      case 'growing': return 1.8;
      case 'mature': return 2.2; // Much larger for visibility
      case 'dying': return 1.8;
      case 'dead': return 1.2;
      default: return 0.8;
    }
  };

  // React to life events
  useEffect(() => {
    const recentEvent = lifeEvents[lifeEvents.length - 1];
    if (!recentEvent) return;

    const timeSinceEvent = Date.now() - recentEvent.timestamp;
    if (timeSinceEvent > 5000) return;

    if (recentEvent.type === 'birth' && Math.random() > 0.5) {
      setStage('forming');
      setEnergy(Math.random() * 50 + 50);
      
      const types: PlanetType[] = ['earth', 'mars', 'venus', 'gas', 'ice', 'volcanic'];
      setPlanetType(types[Math.floor(Math.random() * types.length)]);
      
      setTimeout(() => setStage('growing'), 1000);
      setTimeout(() => setStage('mature'), 3000);
    } else if (recentEvent.type === 'death' && stage !== 'empty') {
      setStage('dying');
      setTimeout(() => setStage('dead'), 1500);
      setTimeout(() => setStage('empty'), 3000);
    }
  }, [lifeEvents, stage]);

  // Energy changes based on market trend
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prev => {
        if (marketTrend === 'up') return Math.min(100, prev + Math.random() * 2);
        if (marketTrend === 'down') return Math.max(0, prev - Math.random() * 2);
        return prev + (Math.random() - 0.5) * 0.5;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [marketTrend]);

  // Animation loop
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Orbital motion around center with bounds checking
    if (orbitalRadius > 0.5) {
      const angle = initialAngle + state.clock.elapsedTime * orbitalSpeed;
      const newX = Math.cos(angle) * Math.min(orbitalRadius, 25); // Limit max distance
      const newZ = Math.sin(angle) * Math.min(orbitalRadius, 25);
      
      // Ensure positions are valid numbers
      if (!isNaN(newX) && !isNaN(newZ) && isFinite(newX) && isFinite(newZ)) {
        groupRef.current.position.x = newX;
        groupRef.current.position.z = newZ;
        // Keep original Y position with floating animation
        groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.1;
      }
    } else {
      // For center planet or very close planets, just do floating animation
      groupRef.current.position.set(
        position[0], 
        position[1] + Math.sin(state.clock.elapsedTime + index) * 0.1, 
        position[2]
      );
    }
    
    // Planet rotation on its axis
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed * delta;
    }
    
    if (atmosphereRef.current && stage === 'mature') {
      atmosphereRef.current.rotation.y += rotationSpeed * 0.5 * delta;
    }
    
    if (ringRef.current && stage === 'mature') {
      ringRef.current.rotation.z += rotationSpeed * 2 * delta;
    }
  });

  // Initialize group position on mount
  useEffect(() => {
    if (groupRef.current) {
      if (orbitalRadius > 0.5) {
        groupRef.current.position.set(
          Math.cos(initialAngle) * orbitalRadius,
          position[1],
          Math.sin(initialAngle) * orbitalRadius
        );
      } else {
        groupRef.current.position.set(position[0], position[1], position[2]);
      }
    }
  }, []);

  const size = getSize();

  if (stage === 'empty') {
    return (
      <group ref={groupRef} position={[0, 0, 0]}>
        <Sphere ref={meshRef} args={[size, 16, 16]}>
          <meshStandardMaterial 
            color="#333333" 
            transparent 
            opacity={0.3}
            wireframe
          />
        </Sphere>
        {/* Small twinkling core */}
        <Sphere args={[0.05, 8, 8]}>
          <meshBasicMaterial color="#ffffff" />
        </Sphere>
      </group>
    );
  }

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Main planet */}
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial 
          map={texture}
          roughness={0.6}
          metalness={0.1}
          emissive="#111111" // Slight glow for visibility
          emissiveIntensity={0.1}
        />
      </Sphere>

      {/* Atmosphere for mature planets */}
      {stage === 'mature' && (
        <Sphere ref={atmosphereRef} args={[size + 0.1, 32, 32]}>
          <meshStandardMaterial 
            map={texture}
            transparent 
            opacity={0.15}
            side={THREE.BackSide}
          />
        </Sphere>
      )}

      {/* Orbital rings for gas giants */}
      {planetType === 'gas' && stage === 'mature' && (
        <Ring ref={ringRef} args={[size + 0.2, size + 0.4, 32]}>
          <meshStandardMaterial 
            color="#888888" 
            transparent 
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </Ring>
      )}

      {/* Energy glow effect */}
      {stage === 'mature' && (
        <Sphere args={[size + 0.05, 16, 16]}>
          <meshBasicMaterial 
            color={energy > 70 ? '#00ff00' : energy > 40 ? '#ffff00' : '#ff6600'}
            transparent 
            opacity={0.1}
          />
        </Sphere>
      )}

      {/* Death/explosion effects */}
      {stage === 'dying' && (
        <Sphere args={[size + 0.2, 16, 16]}>
          <meshBasicMaterial 
            color="#ff0000"
            transparent 
            opacity={0.5}
          />
        </Sphere>
      )}

      {/* New Planet Marker */}
      {isNewPlanet && (
        <>
          {/* Glowing ring marker */}
          <Ring args={[size + 0.3, size + 0.5, 32]} rotation={[Math.PI / 2, 0, 0]}>
            <meshBasicMaterial 
              color="#00ff00"
              transparent 
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </Ring>
          
          {/* Pulsing outer glow */}
          <Sphere args={[size + 0.15, 16, 16]}>
            <meshBasicMaterial 
              color="#00ff00"
              transparent 
              opacity={0.2}
            />
          </Sphere>
          
          {/* New planet label */}
          <mesh position={[0, size + 1, 0]}>
            <planeGeometry args={[1.5, 0.3]} />
            <meshBasicMaterial 
              color="#000000" 
              transparent 
              opacity={0.8}
            />
          </mesh>
        </>
      )}
    </group>
  );
};