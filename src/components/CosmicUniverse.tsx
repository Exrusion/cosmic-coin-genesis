import { useEffect, useState } from "react";
import { StarField } from "./StarField";
import { Planet } from "./Planet";
import { MarketCapDisplay } from "./MarketCapDisplay";
import { ParticleSystem } from "./ParticleSystem";
import { DexScreenerService } from "@/services/DexScreenerService";
import { useToast } from "@/components/ui/use-toast";

interface MarketData {
  marketCap: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  tokenName?: string;
  tokenSymbol?: string;
  price?: string;
  priceChange24h?: number;
}

export const CosmicUniverse = () => {
  const { toast } = useToast();
  const [marketData, setMarketData] = useState<MarketData>({
    marketCap: 0,
    change: 0,
    trend: 'stable'
  });
  
  const [lifeEvents, setLifeEvents] = useState<{ type: 'birth' | 'death', id: string, timestamp: number }[]>([]);
  const [previousMarketCap, setPreviousMarketCap] = useState<number>(0);
  
  // DexScreener URL tracking
  const TRACKED_URL = "https://dexscreener.com/solana/fs9et2zacvw3nn3a8a1wn5acifgkbudcuvwgynjs2fag";
  const TOKEN_ADDRESS = DexScreenerService.parseTokenAddress(TRACKED_URL);

  // Fetch real token data
  useEffect(() => {
    const fetchTokenData = async () => {
      if (!TOKEN_ADDRESS) {
        toast({
          title: "Error",
          description: "Invalid token address",
          variant: "destructive",
        });
        return;
      }

      try {
        const tokenData = await DexScreenerService.getTokenData(TOKEN_ADDRESS);
        
        if (tokenData) {
          const currentMarketCap = DexScreenerService.formatMarketCap(tokenData.marketCap);
          const change = previousMarketCap > 0 ? currentMarketCap - previousMarketCap : 0;
          
          // Check for significant changes (1k threshold for more sensitivity)
          if (Math.abs(change) >= 1000 && previousMarketCap > 0) {
            console.log('Life event triggered! Change:', change, 'Previous:', previousMarketCap, 'Current:', currentMarketCap);
            const event = {
              type: (change > 0 ? 'birth' : 'death') as 'birth' | 'death',
              id: Date.now().toString(),
              timestamp: Date.now()
            };
            
            setLifeEvents(prev => [...prev.slice(-10), event]);
            
            toast({
              title: change > 0 ? "🌟 Life Created!" : "💥 Life Destroyed!",
              description: `Market cap changed by ${change > 0 ? '+' : ''}$${Math.abs(change).toLocaleString()}`,
              duration: 5000,
            });
          }
          
          console.log('Market data updated:', {
            marketCap: currentMarketCap,
            change: change,
            trend: DexScreenerService.determineTrend(tokenData.priceChange.h24 / 100),
            tokenName: tokenData.baseToken.name,
            previousMarketCap
          });
          
          setMarketData({
            marketCap: currentMarketCap,
            change: change,
            trend: DexScreenerService.determineTrend(tokenData.priceChange.h24 / 100),
            tokenName: tokenData.baseToken.name,
            tokenSymbol: tokenData.baseToken.symbol,
            price: parseFloat(tokenData.priceUsd).toFixed(6),
            priceChange24h: tokenData.priceChange.h24
          });
          
          setPreviousMarketCap(currentMarketCap);
        }
      } catch (error) {
        console.error('Error fetching token data:', error);
        toast({
          title: "Connection Error",
          description: "Failed to fetch live data. Retrying...",
          variant: "destructive",
        });
      }
    };

    // Initial fetch
    fetchTokenData();
    
    // Poll every 30 seconds for updates
    const interval = setInterval(fetchTokenData, 30000);
    
    return () => clearInterval(interval);
  }, [TOKEN_ADDRESS, previousMarketCap, toast]);

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
      
      {/* Planets Container */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="grid grid-cols-3 gap-20">
          {Array.from({ length: 9 }).map((_, index) => (
            <Planet
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