import { useEffect, useState } from "react";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  brightness: number;
  speed: number;
}

export const StarField = () => {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars: Star[] = [];
      for (let i = 0; i < 200; i++) {
        newStars.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 3 + 1,
          brightness: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.5 + 0.1,
        });
      }
      setStars(newStars);
    };

    generateStars();
    window.addEventListener('resize', generateStars);
    return () => window.removeEventListener('resize', generateStars);
  }, []);

  useEffect(() => {
    const animateStars = () => {
      setStars(prevStars =>
        prevStars.map(star => ({
          ...star,
          y: star.y <= 0 ? window.innerHeight : star.y - star.speed,
        }))
      );
    };

    const interval = setInterval(animateStars, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-star-glow animate-twinkle"
          style={{
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            opacity: star.brightness,
            boxShadow: `0 0 ${star.size * 2}px hsl(var(--star-glow) / 0.6)`,
          }}
        />
      ))}
      
      {/* Shooting Stars */}
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={`shooting-${index}`}
          className="absolute w-1 h-1 bg-star-glow rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 50}%`,
            animation: `shooting-star ${3 + Math.random() * 3}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
      
      <style>{`
        @keyframes shooting-star {
          0% {
            transform: translateX(-100px) translateY(-100px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(1000px) translateY(1000px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};