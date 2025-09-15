import { useEffect, useState, Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Planet3D } from "./Planet3D";
import { Galaxy3D } from "./Galaxy3D";
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
  const [planets, setPlanets] = useState<{ position: [number, number, number], id: string, isNew?: boolean, createdAt?: number }[]>([]);
  const [lastMajorIncrease, setLastMajorIncrease] = useState<number>(0);
  const [totalPlanetsBorn, setTotalPlanetsBorn] = useState<number>(0);
  const [galaxies, setGalaxies] = useState<{ planets: typeof planets, id: string }[]>([]);

  // Generate planet positions in a spiral pattern for large numbers
  const generatePlanetPositions = (count: number): [number, number, number][] => {
    const positions: [number, number, number][] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle for better distribution
    
    for (let i = 0; i < count; i++) {
      const theta = i * goldenAngle;
      const radius = Math.min(3 + Math.sqrt(i) * 1.2, 20); // Limit max radius to prevent disappearing
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;
      const y = (Math.random() - 0.5) * 1.5; // Keep planets more centered vertically
      
      // Ensure all values are valid numbers
      if (!isNaN(x) && !isNaN(y) && !isNaN(z) && isFinite(x) && isFinite(y) && isFinite(z)) {
        positions.push([x, y, z]);
      }
    }
    
    return positions;
  };
  
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
          
          // Calculate correct number of planets based on market cap ($5k per planet)
          const targetPlanetCount = Math.max(1, Math.floor(currentMarketCap / 5000));
          const currentPlanetCount = planets.length;
          
          console.log('Planet Count Logic:', {
            marketCap: currentMarketCap,
            targetPlanets: targetPlanetCount,
            currentPlanets: currentPlanetCount
          });
          
          // Adjust planet count to match market cap
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
              setTotalPlanetsBorn(prev => prev + planetsToAdd);
              
              toast({
                title: "🪐 New Planets Born!",
                description: `Market cap $${currentMarketCap.toLocaleString()} = ${targetPlanetCount} planets (+${planetsToAdd})`,
                duration: 5000,
              });
            } else {
              // REMOVE planets - only destroy 1 planet at a time
              setPlanets(prev => prev.slice(0, -1));
              
              toast({
                title: "💥 Planet Destroyed!",
                description: `Market cap fell by $5k - 1 planet destroyed`,
                duration: 5000,
              });
            }
          }
          
          // Initialize planets on first load if empty
          if (planets.length === 0 && targetPlanetCount > 0) {
            const positions = generatePlanetPositions(targetPlanetCount);
            const initialPlanets = positions.map((position, index) => ({
              position,
              id: `initial-planet-${index}`,
              isNew: false
            }));
            setPlanets(initialPlanets);
            setTotalPlanetsBorn(targetPlanetCount); // Count initial planets as born
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

  // Group planets into galaxies (20 planets per galaxy)
  useEffect(() => {
    const PLANETS_PER_GALAXY = 20;
    const totalGalaxies = Math.floor(planets.length / PLANETS_PER_GALAXY);
    const newGalaxies = [];
    
    for (let i = 0; i < totalGalaxies; i++) {
      const galaxyPlanets = planets.slice(i * PLANETS_PER_GALAXY, (i + 1) * PLANETS_PER_GALAXY);
      newGalaxies.push({
        planets: galaxyPlanets,
        id: `galaxy-${i}`
      });
    }
    
    setGalaxies(newGalaxies);
  }, [planets]);

  // Function to navigate to specific galaxy
  const navigateToGalaxy = (galaxyIndex: number) => {
    if (controlsRef.current && galaxyIndex < galaxies.length) {
      // Calculate galaxy position using same logic as Galaxy3D
      const galaxyPosition = [
        (galaxyIndex % 3 - 1) * 80, // X: -80, 0, 80 (3 columns)
        (Math.floor(galaxyIndex / 3) % 3 - 1) * 60, // Y: -60, 0, 60 (3 rows) 
        Math.floor(galaxyIndex / 9) * -80 - 40 // Z: layers every 9 galaxies
      ];
      
      // Move camera to focus on the galaxy
      controlsRef.current.object.position.set(
        galaxyPosition[0] + 30,
        galaxyPosition[1] + 20,
        galaxyPosition[2] + 80
      );
      controlsRef.current.target.set(
        galaxyPosition[0],
        galaxyPosition[1],
        galaxyPosition[2]
      );
      controlsRef.current.update();
    }
  };

  // Function to get universe overview
  const getUniverseOverview = () => {
    if (controlsRef.current) {
      // Position camera for overview of all galaxies
      controlsRef.current.object.position.set(0, 50, 200);
      controlsRef.current.target.set(0, 0, -100);
      controlsRef.current.update();
    }
  };

  // Function to locate planets/reset view
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
            Active: {planets.length.toLocaleString()} | Galaxies: {galaxies.length}
          </div>
        </div>
      </div>
      
      {/* Instructions and Controls */}
      <div className="absolute top-8 right-8 z-20 text-white/60 text-sm space-y-2">
        <div>Mouse: Orbit • Scroll: Zoom • Drag: Pan</div>
        <div>Explore the 3D universe!</div>
        
        {/* Navigation Controls */}
        <div className="flex flex-col gap-1">
          <Button 
            onClick={getUniverseOverview}
            size="sm"
            variant="outline"
            className="text-xs bg-black/50 border-white/20 text-white hover:bg-white/10"
          >
            🌌 Universe Overview
          </Button>
          <Button 
            onClick={locatePlanets}
            size="sm"
            variant="outline"
            className="text-xs bg-black/50 border-white/20 text-white hover:bg-white/10"
          >
            🪐 Reset View
          </Button>
        </div>

        {/* Galaxy Navigation */}
        {galaxies.length > 0 && (
          <div className="mt-2">
            <div className="text-xs text-white/40 mb-1">Navigate to Galaxy:</div>
            <div className="flex flex-wrap gap-1 max-w-32">
              {galaxies.slice(0, 12).map((galaxy, index) => (
                <Button
                  key={galaxy.id}
                  onClick={() => navigateToGalaxy(index)}
                  size="sm"
                  variant="outline"
                  className="text-xs w-8 h-6 p-0 bg-black/50 border-white/20 text-white hover:bg-white/10"
                >
                  {index + 1}
                </Button>
              ))}
              {galaxies.length > 12 && (
                <div className="text-xs text-white/40 w-full">
                  +{galaxies.length - 12} more...
                </div>
              )}
            </div>
          </div>
        )}
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
            maxDistance={500}
            autoRotate={false}
            autoRotateSpeed={0.5}
            panSpeed={2}
            rotateSpeed={1}
            zoomSpeed={1.5}
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

          {/* Galaxies with 20 planets each */}
          {galaxies.map((galaxy, index) => (
            <Galaxy3D
              key={galaxy.id}
              planets={galaxy.planets}
              galaxyIndex={index}
              lifeEvents={lifeEvents}
              marketTrend={marketData.trend}
            />
          ))}

          {/* Individual planets (not yet in galaxies) */}
          {planets.slice(galaxies.length * 20).map((planet, index) => (
            <Planet3D
              key={planet.id}
              position={planet.position}
              index={galaxies.length * 20 + index}
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