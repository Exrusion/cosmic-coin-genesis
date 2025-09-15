import { useEffect, useState } from "react";

export const LoadingScreen = () => {
  const [dots, setDots] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 15 + 5;
      });
    }, 200);

    return () => {
      clearInterval(dotInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      {/* Animated background stars */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Central loading content */}
      <div className="relative text-center space-y-8">
        {/* Cosmic logo/title */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
            LIFEOFCOIN
          </h1>
          <p className="text-white/70 text-xl">
            Initializing Cosmic Universe{dots}
          </p>
        </div>

        {/* Spinning planet loader */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-80 mx-auto space-y-2">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <p className="text-white/50 text-sm">
            Loading 3D Universe... {Math.min(Math.round(progress), 100)}%
          </p>
        </div>

        {/* Loading phases */}
        <div className="text-white/40 text-sm">
          {progress < 30 && "Generating star fields..."}
          {progress >= 30 && progress < 60 && "Creating planetary systems..."}
          {progress >= 60 && progress < 90 && "Initializing market data..."}
          {progress >= 90 && "Almost ready..."}
        </div>
      </div>
    </div>
  );
};