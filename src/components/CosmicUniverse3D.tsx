import { useEffect, useState, Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Planet3D } from "./Planet3D";
import { StarField3D } from "./StarField3D";
import { MarketCapDisplay } from "./MarketCapDisplay";
import { CosmicAudio } from "./CosmicAudio";
import { DexScreenerService } from "@/services/DexScreenerService";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface MarketData {
  marketCap: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  tokenName?: string;
  tokenSymbol?: string;
  price?: string;
  priceChange24h?: number;
}

// Initial planet positions in 3D space
const initialPlanetPositions: [number, number, number][] = [
  [-8, 2, -5], [0, 3, -8], [8, 1, -5],
  [-6, -1, 0], [0, 0, 0], [6, 2, 0],
  [-4, 1, 5], [2, -2, 8], [7, 0, 6]
];

export const CosmicUniverse3D = () => {
  const controlsRef = useRef<any>(null);
  const { toast } = useToast();
  const [marketData, setMarketData] = useState<MarketData>({
    marketCap: 0,
    change: 0,
    trend: 'stable'
  });
  
  const [lifeEvents, setLifeEvents] = useState<{ type: 'birth' | 'death', id: string, timestamp: number }[]>([]);
  const [previousMarketCap, setPreviousMarketCap] = useState<number>(0);
  const [planets, setPlanets] = useState<{ position: [number, number, number], id: string, isNew?: boolean, createdAt?: number }[]>(() => {
    // Initialize with planets immediately to avoid empty state
    return initialPlanetPositions.map((position, index) => ({
      position,
      id: `initial-planet-${index}`,
      isNew: false
    }));
  });
  const [lastMajorIncrease, setLastMajorIncrease] = useState<number>(0);
  
  // DexScreener URL tracking
  const TRACKED_URL = "https://dexscreener.com/solana/fxksrhfikhka1pkpdehbdx3yxtdnjheqwnumdlrvzkwx";
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
          
          console.log('Market Cap Update:', {
            raw: tokenData.marketCap,
            formatted: currentMarketCap,
            change,
            timestamp: new Date().toISOString()
          });
          
          // Check for +5k increase to create new planets OR -5k decrease to destroy one planet
          const marketCapChange = currentMarketCap - lastMajorIncrease;
          
          if (marketCapChange >= 5000 && previousMarketCap > 0) {
            // CREATE NEW PLANET for +$5k increase
            const trendDirection = marketData.trend === 'up' ? 1 : marketData.trend === 'down' ? -1 : 0;
            const newPlanetPosition: [number, number, number] = [
              (Math.random() - 0.5) * 20 + (trendDirection * 5),
              (Math.random() - 0.5) * 10,
              (Math.random() - 0.5) * 20 + (trendDirection * 3)
            ];
            
            const newPlanet = {
              position: newPlanetPosition,
              id: `planet-${Date.now()}`,
              isNew: true,
              createdAt: Date.now()
            };
            
            setPlanets(prev => [...prev, newPlanet]);
            setLastMajorIncrease(currentMarketCap);
            
            toast({
              title: "🪐 New Planet Born!",
              description: `+$${marketCapChange.toLocaleString()} market cap increase created a new world!`,
              duration: 5000,
            });
          } else if (marketCapChange <= -5000 && previousMarketCap > 0) {
            // DESTROY ONE PLANET for -$5k decrease
            setPlanets(prev => {
              if (prev.length > 1) { // Keep at least 1 planet
                // Remove the most recently added planet (last in array)
                const updatedPlanets = prev.slice(0, -1);
                return updatedPlanets;
              }
              return prev;
            });
            setLastMajorIncrease(currentMarketCap);
            
            toast({
              title: "💥 Planet Destroyed!",
              description: `$${Math.abs(marketCapChange).toLocaleString()} market cap decrease destroyed a world!`,
              duration: 5000,
            });
          }
          
          // Regular life events for existing planets
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
    
    // Poll every 10 seconds for updates  
    const interval = setInterval(fetchTokenData, 10000);
    
    return () => clearInterval(interval);
  }, [TOKEN_ADDRESS, previousMarketCap, toast]);

  // Remove "new" status after 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlanets(prev => prev.map(planet => {
        if (planet.isNew && planet.createdAt && Date.now() - planet.createdAt > 30000) {
          return { ...planet, isNew: false };
        }
        return planet;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [planets.length]);

  // Function to locate planets
  const locatePlanets = () => {
    if (controlsRef.current) {
      // Reset camera to default position where planets are visible
      controlsRef.current.reset();
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Market Cap Display - 2D Overlay */}
      <div className="absolute top-8 left-8 z-20">
        <MarketCapDisplay data={marketData} />
      </div>
      
      {/* Instructions and Controls */}
      <div className="absolute top-8 right-8 z-20 text-white/60 text-sm space-y-2">
        <div>Mouse: Orbit • Scroll: Zoom • Drag: Pan</div>
        <div>Explore the 3D universe!</div>
        <Button 
          onClick={locatePlanets}
          size="sm"
          variant="outline"
          className="text-xs bg-black/50 border-white/20 text-white hover:bg-white/10"
        >
          🪐 Find Planets
        </Button>
      </div>

      {/* 3D Scene */}
      <Canvas className="w-full h-full">
        <Suspense fallback={null}>
          {/* Camera and Controls */}
          <PerspectiveCamera 
            makeDefault 
            position={[0, 0, 15]} 
            fov={75}
            near={0.1}
            far={1000}
          />
          <OrbitControls 
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={50}
            autoRotate={false}
            autoRotateSpeed={0.5}
          />

          {/* Lighting */}
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={0.8}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />

          {/* Star Field Background */}
          <StarField3D />

          {/* Planets */}
          {planets.map((planet, index) => (
            <Planet3D
              key={planet.id}
              position={planet.position}
              index={index}
              lifeEvents={lifeEvents}
              marketTrend={marketData.trend}
              isNewPlanet={planet.isNew}
            />
          ))}

          {/* Nebula effects */}
          <mesh position={[0, 0, -20]} rotation={[0, 0, 0]}>
            <planeGeometry args={[60, 60]} />
            <meshBasicMaterial 
              color="#4A90E2" 
              transparent 
              opacity={0.02}
            />
          </mesh>
          
          <mesh position={[15, 10, -15]} rotation={[0.3, 0.3, 0]}>
            <sphereGeometry args={[8, 16, 16]} />
            <meshBasicMaterial 
              color="#FF6B6B" 
              transparent 
              opacity={0.03}
            />
          </mesh>
        </Suspense>
      </Canvas>
      
      {/* Cosmic Audio System */}
      <CosmicAudio marketTrend={marketData.trend} />
    </div>
  );
};