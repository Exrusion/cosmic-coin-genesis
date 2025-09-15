import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PlanetProps {
  index: number;
  lifeEvents: { type: 'birth' | 'death', id: string, timestamp: number }[];
  marketTrend: 'up' | 'down' | 'stable';
}

type LifeStage = 'empty' | 'forming' | 'growing' | 'mature' | 'dying' | 'dead';
type PlanetType = 'earth' | 'mars' | 'venus' | 'gas' | 'ice' | 'volcanic';

export const Planet = ({ index, lifeEvents, marketTrend }: PlanetProps) => {
  const [stage, setStage] = useState<LifeStage>(Math.random() > 0.7 ? 'forming' : 'empty');
  const [energy, setEnergy] = useState(50);
  const [planetType, setPlanetType] = useState<PlanetType>('earth');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    console.log(`Planet ${index}: Stage changed to ${stage}, Energy: ${energy}`);
    
    // React to life events
    const recentEvent = lifeEvents[lifeEvents.length - 1];
    if (!recentEvent) return;

    const timeSinceEvent = Date.now() - recentEvent.timestamp;
    if (timeSinceEvent > 5000) return;

    if (recentEvent.type === 'birth' && Math.random() > 0.5) {
      console.log(`Planet ${index}: Birth event triggered!`);
      setStage('forming');
      setEnergy(Math.random() * 50 + 50);
      
      // Choose random planet type based on energy
      const types: PlanetType[] = ['earth', 'mars', 'venus', 'gas', 'ice', 'volcanic'];
      setPlanetType(types[Math.floor(Math.random() * types.length)]);
      
      setTimeout(() => setStage('growing'), 1000);
      setTimeout(() => setStage('mature'), 3000);
    } else if (recentEvent.type === 'death' && stage !== 'empty') {
      console.log(`Planet ${index}: Death event triggered!`);
      setStage('dying');
      setTimeout(() => setStage('dead'), 1500);
      setTimeout(() => setStage('empty'), 3000);
    }
  }, [lifeEvents, stage, index]);

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

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prev => Math.min(3, Math.max(0.5, prev + delta)));
  };

  const getPlanetElement = () => {
    const baseScale = zoomLevel * (isHovered ? 1.1 : 1);
    
    switch (stage) {
      case 'empty':
        return (
          <div 
            className="w-16 h-16 rounded-full border border-space-light opacity-50 relative cursor-pointer transition-all duration-300"
            style={{ transform: `scale(${baseScale})` }}
            onWheel={handleWheel}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="w-full h-full rounded-full bg-gradient-to-br from-space-medium to-space-deep" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-star-glow rounded-full animate-twinkle opacity-30" />
            </div>
            {/* Orbit ring */}
            <div className="absolute -inset-4 border border-space-light/20 rounded-full animate-cosmic-rotate opacity-30" />
          </div>
        );
      
      case 'forming':
        return (
          <div 
            className="relative cursor-pointer transition-all duration-500"
            style={{ transform: `scale(${baseScale})` }}
            onWheel={handleWheel}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className={`w-16 h-16 rounded-full bg-${planetType === 'earth' ? 'planet-earth' : `planet-${planetType}`} animate-birth relative shadow-2xl`}>
              {/* Atmosphere */}
              <div className="absolute -inset-1 rounded-full bg-life-birth/20 animate-pulse-glow" />
              {/* Core energy */}
              <div className="absolute inset-4 rounded-full bg-life-energy/50 animate-twinkle" />
            </div>
          </div>
        );
      
      case 'growing':
        return (
          <div 
            className="relative cursor-pointer transition-all duration-500"
            style={{ transform: `scale(${baseScale})` }}
            onWheel={handleWheel}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className={`w-20 h-20 rounded-full bg-planet-${planetType} animate-float relative shadow-2xl`}>
              {/* Atmosphere */}
              <div className="absolute -inset-2 rounded-full bg-life-growth/30 animate-energy-pulse" />
              {/* Surface details */}
              <div className="absolute inset-2 rounded-full opacity-60 animate-cosmic-rotate"
                   style={{ 
                     background: `radial-gradient(circle at 60% 40%, transparent 30%, rgba(255,255,255,0.1) 31%, transparent 32%)`,
                     animationDuration: '20s'
                   }} 
              />
              {/* Orbital rings */}
              <div className="absolute -inset-6 border border-life-growth/20 rounded-full animate-cosmic-rotate opacity-50" />
            </div>
          </div>
        );
      
      case 'mature':
        return (
          <div 
            className="relative cursor-pointer transition-all duration-500"
            style={{ transform: `scale(${baseScale})` }}
            onWheel={handleWheel}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className={`w-24 h-24 rounded-full bg-planet-${planetType} animate-float relative shadow-2xl`}>
              {/* Atmosphere layers */}
              <div className="absolute -inset-3 rounded-full bg-life-energy/20 animate-energy-pulse" />
              <div className="absolute -inset-1 rounded-full bg-life-birth/10 animate-pulse-glow" />
              
              {/* Surface features */}
              <div className="absolute inset-1 rounded-full opacity-40 animate-cosmic-rotate"
                   style={{ 
                     background: `
                       radial-gradient(circle at 70% 30%, transparent 20%, rgba(255,255,255,0.2) 21%, transparent 22%),
                       radial-gradient(circle at 30% 70%, transparent 15%, rgba(0,0,0,0.3) 16%, transparent 17%),
                       radial-gradient(circle at 50% 20%, transparent 10%, rgba(255,255,255,0.1) 11%, transparent 12%)
                     `,
                     animationDuration: '30s'
                   }} 
              />
              
              {/* Clouds/Weather patterns */}
              <div className="absolute inset-0 rounded-full opacity-30 animate-nebula-drift"
                   style={{ 
                     background: `radial-gradient(ellipse at 40% 60%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
                   }} 
              />
              
              {/* Energy indicator glow */}
              <div 
                className="absolute -inset-4 rounded-full opacity-60 animate-pulse-glow"
                style={{ 
                  background: `radial-gradient(circle, transparent 60%, ${energy > 70 ? 'hsl(var(--life-energy))' : energy > 40 ? 'hsl(var(--life-growth))' : 'hsl(var(--life-birth))'} 61%, transparent 65%)`,
                  filter: `brightness(${energy / 100 + 0.5})`
                }}
              />
              
              {/* Orbital rings */}
              <div className="absolute -inset-8 border border-life-energy/30 rounded-full animate-cosmic-rotate" style={{ animationDuration: '40s' }} />
              <div className="absolute -inset-6 border border-life-growth/20 rounded-full animate-cosmic-rotate" style={{ animationDuration: '25s', animationDirection: 'reverse' }} />
            </div>
            
            {/* Moons */}
            <div className="absolute -inset-12">
              <div className="absolute w-3 h-3 bg-space-light rounded-full shadow-lg animate-cosmic-rotate"
                   style={{ 
                     top: '10%', 
                     left: '10%',
                     animationDuration: '15s'
                   }} />
              <div className="absolute w-2 h-2 bg-space-light/80 rounded-full shadow-lg animate-cosmic-rotate"
                   style={{ 
                     bottom: '20%', 
                     right: '15%',
                     animationDuration: '25s',
                     animationDirection: 'reverse'
                   }} />
            </div>
          </div>
        );
      
      case 'dying':
        return (
          <div 
            className="relative cursor-pointer transition-all duration-500"
            style={{ transform: `scale(${baseScale})` }}
            onWheel={handleWheel}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="w-20 h-20 rounded-full bg-planet-volcanic animate-destruction relative shadow-2xl">
              {/* Explosion effects */}
              <div className="absolute -inset-2 rounded-full bg-death-fire/60 animate-pulse-glow" />
              <div className="absolute inset-2 rounded-full bg-death-explosion/80 animate-twinkle" />
              {/* Cracks */}
              <div className="absolute inset-0 rounded-full opacity-80"
                   style={{ 
                     background: `
                       linear-gradient(45deg, transparent 45%, rgba(255,0,0,0.8) 47%, transparent 49%),
                       linear-gradient(135deg, transparent 45%, rgba(255,100,0,0.6) 47%, transparent 49%)
                     `
                   }} 
              />
            </div>
          </div>
        );
      
      case 'dead':
        return (
          <div 
            className="relative cursor-pointer transition-all duration-500"
            style={{ transform: `scale(${baseScale})` }}
            onWheel={handleWheel}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="w-12 h-12 rounded-full bg-death-void opacity-50 relative shadow-lg">
              <div className="absolute inset-1 rounded-full bg-space-deep animate-twinkle opacity-70" />
              {/* Debris field */}
              <div className="absolute -inset-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-death-void rounded-full opacity-40 animate-float"
                    style={{
                      top: `${Math.sin(i) * 40 + 50}%`,
                      left: `${Math.cos(i) * 40 + 50}%`,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {getPlanetElement()}
      
      {/* Energy/health indicator */}
      {stage === 'mature' && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-16 h-1 bg-space-medium rounded-full overflow-hidden">
            <div 
              className="h-full bg-life-energy transition-all duration-1000"
              style={{ width: `${energy}%` }}
            />
          </div>
          <div className="text-xs text-center text-muted-foreground mt-1">
            {planetType.charAt(0).toUpperCase() + planetType.slice(1)}
          </div>
        </div>
      )}
      
      {/* Zoom indicator */}
      {isHovered && zoomLevel !== 1 && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-star-glow">
          {Math.round(zoomLevel * 100)}%
        </div>
      )}
      
      {/* Cosmic dust particles around mature planets */}
      {stage === 'mature' && (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-star-glow rounded-full animate-twinkle"
              style={{
                top: `${Math.sin(i * 0.785) * 60 + 50}%`,
                left: `${Math.cos(i * 0.785) * 60 + 50}%`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};