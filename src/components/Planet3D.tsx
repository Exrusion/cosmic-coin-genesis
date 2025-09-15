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
  
  const [stage, setStage] = useState<LifeStage>(
    isNewPlanet ? 'forming' : (Math.random() > 0.7 ? 'forming' : 'empty')
  );
  const [energy, setEnergy] = useState(isNewPlanet ? 75 : 50);
  const [planetType, setPlanetType] = useState<PlanetType>(() => {
    if (isNewPlanet) {
      const types: PlanetType[] = ['earth', 'mars', 'venus', 'gas', 'ice', 'volcanic'];
      return types[Math.floor(Math.random() * types.length)];
    }
    return 'earth';
  });
  const [rotationSpeed, setRotationSpeed] = useState(Math.random() * 0.02 + 0.01);

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
      case 'empty': return 0.2;
      case 'forming': return 0.4;
      case 'growing': return 0.6;
      case 'mature': return 0.8;
      case 'dying': return 0.6;
      case 'dead': return 0.3;
      default: return 0.2;
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
    if (meshRef.current) {
      meshRef.current.rotation.y += rotationSpeed * delta;
    }
    
    if (atmosphereRef.current && stage === 'mature') {
      atmosphereRef.current.rotation.y += rotationSpeed * 0.5 * delta;
    }
    
    if (ringRef.current && stage === 'mature') {
      ringRef.current.rotation.z += rotationSpeed * 2 * delta;
    }

    // Floating animation
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.1;
    }
  });

  const size = getSize();

  if (stage === 'empty') {
    return (
      <group position={position}>
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
    <group position={position}>
      {/* Main planet */}
      <Sphere ref={meshRef} args={[size, 32, 32]}>
        <meshStandardMaterial 
          map={texture}
          roughness={0.8}
          metalness={0.2}
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