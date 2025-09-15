import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

interface ParticleSystemProps {
  type: 'birth' | 'death';
  position: { x: number; y: number };
}

export const ParticleSystem = ({ type, position }: ParticleSystemProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    // Generate initial particles
    const initialParticles: Particle[] = [];
    const particleCount = type === 'birth' ? 20 : 30;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = type === 'birth' ? Math.random() * 3 + 1 : Math.random() * 5 + 2;
      
      initialParticles.push({
        id: i,
        x: position.x,
        y: position.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: type === 'birth' ? 60 : 40,
        size: Math.random() * 4 + 2,
      });
    }
    
    setParticles(initialParticles);

    // Auto-cleanup after animation
    const cleanup = setTimeout(() => {
      setIsActive(false);
    }, type === 'birth' ? 3000 : 2000);

    return () => clearTimeout(cleanup);
  }, [type, position]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setParticles(prevParticles => 
        prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life + 1,
            vy: particle.vy + 0.1, // gravity for death particles
          }))
          .filter(particle => particle.life < particle.maxLife)
      );
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [isActive]);

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-15">
      {particles.map((particle) => {
        const progress = particle.life / particle.maxLife;
        const opacity = type === 'birth' 
          ? Math.sin(progress * Math.PI) // fade in and out for birth
          : 1 - progress; // fade out for death
        
        const scale = type === 'birth'
          ? 0.5 + Math.sin(progress * Math.PI) * 0.5 // pulsing growth
          : 1 - progress * 0.5; // shrinking

        return (
          <div
            key={particle.id}
            className={`absolute rounded-full ${
              type === 'birth' 
                ? 'bg-life-energy shadow-[0_0_10px_hsl(var(--life-energy))]' 
                : 'bg-death-explosion shadow-[0_0_8px_hsl(var(--death-explosion))]'
            }`}
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size * scale,
              height: particle.size * scale,
              opacity,
              transform: `translate(-50%, -50%) scale(${scale})`,
              filter: type === 'birth' ? 'brightness(1.5)' : 'brightness(2)',
            }}
          />
        );
      })}
      
      {/* Central explosion/creation effect */}
      <div
        className={`absolute rounded-full ${
          type === 'birth'
            ? 'bg-life-birth animate-birth'
            : 'bg-death-fire animate-destruction'
        }`}
        style={{
          left: position.x,
          top: position.y,
          width: type === 'birth' ? 40 : 60,
          height: type === 'birth' ? 40 : 60,
          transform: 'translate(-50%, -50%)',
          boxShadow: type === 'birth'
            ? '0 0 40px hsl(var(--life-birth)), 0 0 80px hsl(var(--life-energy) / 0.5)'
            : '0 0 60px hsl(var(--death-fire)), 0 0 120px hsl(var(--death-explosion) / 0.5)',
        }}
      />
    </div>
  );
};