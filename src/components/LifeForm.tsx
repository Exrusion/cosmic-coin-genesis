import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LifeFormProps {
  index: number;
  lifeEvents: { type: 'birth' | 'death', id: string, timestamp: number }[];
  marketTrend: 'up' | 'down' | 'stable';
}

type LifeStage = 'empty' | 'forming' | 'growing' | 'mature' | 'dying' | 'dead';

export const LifeForm = ({ index, lifeEvents, marketTrend }: LifeFormProps) => {
  const [stage, setStage] = useState<LifeStage>(Math.random() > 0.7 ? 'forming' : 'empty'); // Some start with life
  const [energy, setEnergy] = useState(50);

  useEffect(() => {
    console.log(`LifeForm ${index}: Stage changed to ${stage}, Energy: ${energy}`);
    
    // React to life events
    const recentEvent = lifeEvents[lifeEvents.length - 1];
    if (!recentEvent) return;

    const timeSinceEvent = Date.now() - recentEvent.timestamp;
    if (timeSinceEvent > 5000) return; // Only react to recent events

    if (recentEvent.type === 'birth' && Math.random() > 0.5) { // Increased chance
      console.log(`LifeForm ${index}: Birth event triggered!`);
      setStage('forming');
      setEnergy(Math.random() * 50 + 50);
      
      setTimeout(() => setStage('growing'), 1000);
      setTimeout(() => setStage('mature'), 3000);
    } else if (recentEvent.type === 'death' && stage !== 'empty') {
      console.log(`LifeForm ${index}: Death event triggered!`);
      setStage('dying');
      setTimeout(() => setStage('dead'), 1500);
      setTimeout(() => setStage('empty'), 3000);
    }
  }, [lifeEvents, stage]);

  useEffect(() => {
    // Gradual energy changes based on market trend
    const interval = setInterval(() => {
      setEnergy(prev => {
        if (marketTrend === 'up') return Math.min(100, prev + Math.random() * 2);
        if (marketTrend === 'down') return Math.max(0, prev - Math.random() * 2);
        return prev + (Math.random() - 0.5) * 0.5;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [marketTrend]);

  const getLifeFormElement = () => {
    switch (stage) {
      case 'empty':
        return (
          <div className="w-16 h-16 rounded-full border-2 border-space-light opacity-50 relative">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-space-medium to-space-deep" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-star-glow rounded-full animate-twinkle opacity-30" />
            </div>
          </div>
        );
      
      case 'forming':
        return (
          <div className="w-16 h-16 rounded-full bg-life-birth animate-birth relative overflow-hidden">
            <div className="absolute inset-2 rounded-full bg-life-growth animate-pulse-glow" />
            <div className="absolute inset-4 rounded-full bg-life-energy animate-twinkle" />
          </div>
        );
      
      case 'growing':
        return (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-life-birth to-life-growth animate-float relative">
            <div className="absolute inset-2 rounded-full bg-life-energy animate-energy-pulse" />
            <div className="absolute -inset-1 rounded-full bg-life-birth opacity-20 animate-pulse-glow" />
          </div>
        );
      
      case 'mature':
        return (
          <div className="w-24 h-24 rounded-full bg-life relative animate-float">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-life-energy via-life-growth to-life-birth animate-cosmic-rotate" 
                 style={{ animationDuration: '8s' }} />
            <div className="absolute inset-3 rounded-full bg-life-energy animate-energy-pulse" />
            <div 
              className="absolute -inset-2 rounded-full bg-life-birth opacity-30 animate-pulse-glow"
              style={{ filter: `brightness(${energy / 100 + 0.5})` }}
            />
          </div>
        );
      
      case 'dying':
        return (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-death-fire to-death-explosion animate-destruction relative">
            <div className="absolute inset-2 rounded-full bg-death-explosion animate-pulse-glow" />
            <div className="absolute inset-4 rounded-full bg-death-fire animate-twinkle" />
          </div>
        );
      
      case 'dead':
        return (
          <div className="w-12 h-12 rounded-full bg-death-void opacity-50 relative">
            <div className="absolute inset-1 rounded-full bg-space-deep animate-twinkle" />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {getLifeFormElement()}
      
      {/* Energy indicator */}
      {stage === 'mature' && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-16 h-1 bg-space-medium rounded-full overflow-hidden">
            <div 
              className="h-full bg-life-energy transition-all duration-1000"
              style={{ width: `${energy}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Cosmic dust particles around mature life */}
      {stage === 'mature' && (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-star-glow rounded-full animate-twinkle"
              style={{
                top: `${Math.sin(i) * 40 + 50}%`,
                left: `${Math.cos(i) * 40 + 50}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};