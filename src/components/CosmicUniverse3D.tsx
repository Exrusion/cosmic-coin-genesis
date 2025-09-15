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
import { TOKEN_CONFIG } from "@/config/token";

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
  const [planets, setPlanets] = useState<{ position: [number, number, number], id: string, isNew?: boolean, createdAt?: number }[]>([]);
  const [lastMajorIncrease, setLastMajorIncrease] = useState<number>(0);
  const [totalPlanetsBorn, setTotalPlanetsBorn] = useState<number>(0);

  // Generate planet positions in a spiral pattern for large numbers
  const generatePlanetPositions = (count: number): [number, number, number][] => {
    const positions: [number, number, number][] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle for better distribution
    
    console.log(`Generating positions for ${count} planets`);
    
    for (let i = 0; i < count; i++) {
      const theta = i * goldenAngle;
      // Increase spacing significantly between planets
      const radius = 4 + i * 2.5; // Start at radius 4, increase by 2.5 for each planet
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      // Moderate vertical spread for 3D distribution
      const y = (Math.random() - 0.5) * 6; 
      
      // Ensure all values are valid numbers
      if (!isNaN(x) && !isNaN(y) && !isNaN(z) && isFinite(x) && isFinite(y) && isFinite(z)) {
        positions.push([x, y, z]);
        console.log(`Planet ${i}: position [${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}]`);
      }
    }
    
    return positions;
  };
  
  // DexScreener URL tracking
  const TRACKED_URL = TOKEN_CONFIG.url;
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
          
          // Calculate correct number of planets based on market cap
          const targetPlanetCount = Math.max(1, Math.floor(currentMarketCap / TOKEN_CONFIG.dollarsPerPlanet));
          const currentPlanetCount = planets.length;
          
          console.log('Planet Count Logic:', {
            marketCap: currentMarketCap,
            targetPlanets: targetPlanetCount,
            currentPlanets: currentPlanetCount
          });
          
          // Initialize planets on first load OR reset for new token
          if (planets.length === 0 || (previousMarketCap === 0 && currentMarketCap > 0)) {
            const positions = generatePlanetPositions(targetPlanetCount);
            const initialPlanets = positions.map((position, index) => ({
              position,
              id: `initial-planet-${index}`,
              isNew: false
            }));
            setPlanets(initialPlanets);
            setTotalPlanetsBorn(targetPlanetCount); // Reset total to match new token's market cap
            setPreviousMarketCap(0); // Reset previous market cap for new token
            
            console.log('Reset planets for new token:', {
              tokenName: tokenData.baseToken.name,
              tokenSymbol: tokenData.baseToken.symbol,
              targetPlanetCount,
              totalBorn: targetPlanetCount
            });
          } else {
            // Adjust planet count to match market cap for existing tracking
            if (targetPlanetCount !== currentPlanetCount) {
              if (targetPlanetCount > currentPlanetCount) {
                // ADD planets
                const planetsToAdd = targetPlanetCount - currentPlanetCount;
                const newPositions = generatePlanetPositions(targetPlanetCount).slice(currentPlanetCount);
                const newPlanets = newPositions.map((position, index) => ({
                  position,
                  id: `planet-${Date.now()}-${index}`,
                  isNew: true,
                  createdAt: Date.now()
                }));
                
                setPlanets(prev => [...prev, ...newPlanets]);
                setTotalPlanetsBorn(prev => Math.max(prev + planetsToAdd, targetPlanetCount));
                
                toast({
                  title: "🪐 New Planets Born!",
                  description: `Market cap $${currentMarketCap.toLocaleString()} = ${targetPlanetCount} planets (+${planetsToAdd})`,
                  duration: 5000,
                });
              } else {
                // REMOVE planets - destroy excess planets gradually (max 1-2 at a time)
                const minPlanets = 2; // Always keep at least 2 planets visible
                const maxToRemove = 2; // Never remove more than 2 planets at once
                const safeCurrentCount = Math.max(currentPlanetCount, minPlanets);
                const safeTargetCount = Math.max(targetPlanetCount, minPlanets);
                
                if (safeCurrentCount > safeTargetCount) {
                  const planetsToRemove = Math.min(safeCurrentCount - safeTargetCount, maxToRemove);
                  
                  if (planetsToRemove > 0) {
                    setPlanets(prev => prev.slice(0, -planetsToRemove));
                    
                    toast({
                      title: "💥 Planets Destroyed!",
                      description: `Market cap fell - ${planetsToRemove} planet${planetsToRemove > 1 ? 's' : ''} destroyed`,
                      duration: 5000,
                    });
                  }
                }
              }
            }
          }
          
          // Regular life events for existing planets
          if (Math.abs(change) >= TOKEN_CONFIG.lifeEventThreshold && previousMarketCap > 0) {
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
      <div className="absolute top-8 left-8 z-20 space-y-4">
        <MarketCapDisplay data={marketData} />
        
        {/* Planets Born Counter */}
        <div className="bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg p-4">
          <div className="text-white/70 text-sm mb-1">Total Planets Born</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            🪐 {totalPlanetsBorn.toLocaleString()}
          </div>
          <div className="text-white/50 text-xs mt-1">
            Active: {planets.length.toLocaleString()}
          </div>
        </div>
      </div>
      
      {/* Instructions and Controls */}
      <div className="absolute top-8 right-8 z-20 text-white/60 text-sm space-y-2">
        <div>Mouse: Orbit • Scroll: Zoom • Drag: Pan</div>
        <div>Explore the 3D universe!</div>
        <div className="flex gap-2">
          <Button 
            onClick={locatePlanets}
            size="sm"
            variant="outline"
            className="text-xs bg-black/50 border-white/20 text-white hover:bg-white/10"
          >
            🪐 Find Planets
          </Button>
          <Button 
            onClick={() => window.open('https://x.com', '_blank')}
            size="sm"
            variant="outline"
            className="text-xs bg-black/50 border-white/20 text-white hover:bg-primary/20 hover:border-primary/50"
          >
            𝕏
          </Button>
          <Button 
            onClick={() => window.open('https://pump.fun', '_blank')}
            size="sm"
            variant="outline"
            className="text-xs bg-black/50 border-white/20 text-white hover:bg-nebula-purple/20 hover:border-nebula-purple/50"
          >
            🚀 pump.fun
          </Button>
        </div>
      </div>

      {/* 3D Scene */}
      <Canvas 
        className="w-full h-full" 
        style={{ background: 'radial-gradient(ellipse at center, #0a0a0a 0%, #000000 70%, #000000 100%)' }}
        camera={{ position: [0, 5, 15], fov: 75, near: 0.1, far: 1000 }}
      >
        <Suspense fallback={null}>
          {/* Controls */}
          <OrbitControls 
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={false}
            autoRotateSpeed={0.5}
          />

          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1.5} />
          <pointLight position={[-10, -10, -10]} intensity={0.8} />
          <pointLight position={[0, 15, 0]} intensity={1} />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={1.2}
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

        </Suspense>
      </Canvas>
      
      {/* Cosmic Audio System */}
      <CosmicAudio marketTrend={marketData.trend} />
    </div>
  );
};