import { useEffect, useState } from "react";
import { StarField } from "./StarField";
import { LifeForm } from "./LifeForm";
import { MarketCapDisplay } from "./MarketCapDisplay";
import { ParticleSystem } from "./ParticleSystem";

interface MarketData {
  marketCap: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export const CosmicUniverse = () => {
  const [marketData, setMarketData] = useState<MarketData>({
    marketCap: 45000,
    change: 0,
    trend: 'stable'
  });
  
  const [lifeEvents, setLifeEvents] = useState<{ type: 'birth' | 'death', id: string, timestamp: number }[]>([]);

  // Simulate market changes for demo
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 10000; // Random change between -5k and +5k
      const newMarketCap = Math.max(10000, marketData.marketCap + change);
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (Math.abs(change) >= 5000) {
        trend = change > 0 ? 'up' : 'down';
        
        // Trigger life event
        const event = {
          type: (change > 0 ? 'birth' : 'death') as 'birth' | 'death',
          id: Date.now().toString(),
          timestamp: Date.now()
        };
        
        setLifeEvents(prev => [...prev.slice(-10), event]); // Keep last 10 events
      }
      
      setMarketData({
        marketCap: newMarketCap,
        change,
        trend
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [marketData.marketCap]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Animated Star Field Background */}
      <StarField />
      
      {/* Nebula Effects - Very Subtle */}
      <div className="absolute inset-0 bg-nebula opacity-5 animate-nebula-drift" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-nebula opacity-3 rounded-full blur-3xl animate-cosmic-rotate" />
      
      {/* Market Cap Display */}
      <div className="absolute top-8 left-8 z-20">
        <MarketCapDisplay data={marketData} />
      </div>
      
      {/* Life Forms Container */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="grid grid-cols-3 gap-16">
          {Array.from({ length: 9 }).map((_, index) => (
            <LifeForm
              key={index}
              index={index}
              lifeEvents={lifeEvents}
              marketTrend={marketData.trend}
            />
          ))}
        </div>
      </div>
      
      {/* Particle Systems */}
      {lifeEvents.slice(-3).map((event) => (
        <ParticleSystem
          key={event.id}
          type={event.type}
          position={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight
          }}
        />
      ))}
      
      {/* Cosmic Energy Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent animate-energy-pulse" />
        <div className="absolute bottom-0 right-0 w-2 h-full bg-gradient-to-t from-transparent via-accent to-transparent animate-energy-pulse" />
      </div>
    </div>
  );
};