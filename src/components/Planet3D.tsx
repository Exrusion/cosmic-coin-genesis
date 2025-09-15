import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Ring } from '@react-three/drei';
import * as THREE from 'three';

interface Planet3DProps {
  position: [number, number, number];
  index: number;
  lifeEvents: { type: 'birth' | 'death', id: string, timestamp: number }[];
  marketTrend: 'up' | 'down' | 'stable';
}

type LifeStage = 'empty' | 'forming' | 'growing' | 'mature' | 'dying' | 'dead';
type PlanetType = 'earth' | 'mars' | 'venus' | 'gas' | 'ice' | 'volcanic';

export const Planet3D = ({ position, index, lifeEvents, marketTrend }: Planet3DProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  
  const [stage, setStage] = useState<LifeStage>(Math.random() > 0.7 ? 'forming' : 'empty');
  const [energy, setEnergy] = useState(50);
  const [planetType, setPlanetType] = useState<PlanetType>('earth');
  const [rotationSpeed, setRotationSpeed] = useState(Math.random() * 0.02 + 0.01);

  // Planet colors based on type
  const getColorByType = (type: PlanetType) => {
    switch (type) {
      case 'earth': return '#4A90E2';
      case 'mars': return '#CD5C5C';
      case 'venus': return '#FFA500';
      case 'gas': return '#FFD700';
      case 'ice': return '#87CEEB';
      case 'volcanic': return '#FF4500';
      default: return '#888888';
    }
  };

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
  const color = getColorByType(planetType);

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
          color={color}
          roughness={0.8}
          metalness={0.2}
        />
      </Sphere>

      {/* Atmosphere for mature planets */}
      {stage === 'mature' && (
        <Sphere ref={atmosphereRef} args={[size + 0.1, 32, 32]}>
          <meshStandardMaterial 
            color={color}
            transparent 
            opacity={0.2}
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
    </group>
  );
};