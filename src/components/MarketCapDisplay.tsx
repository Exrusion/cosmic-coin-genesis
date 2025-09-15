import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MarketData {
  marketCap: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  tokenName?: string;
  tokenSymbol?: string;
  price?: string;
  priceChange24h?: number;
}

interface MarketCapDisplayProps {
  data: MarketData;
}

export const MarketCapDisplay = ({ data }: MarketCapDisplayProps) => {
  const formatMarketCap = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatChange = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${formatMarketCap(value)}`;
  };

  return (
    <Card className="relative p-6 bg-card/80 backdrop-blur-md border-space-light overflow-hidden">
      {/* Cosmic glow effect */}
      <div className={cn(
        "absolute inset-0 opacity-20 transition-all duration-1000",
        data.trend === 'up' && "bg-life animate-energy-pulse",
        data.trend === 'down' && "bg-death animate-pulse-glow",
        data.trend === 'stable' && "bg-nebula-purple"
      )} />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className={cn(
            "w-3 h-3 rounded-full animate-pulse-glow",
            data.trend === 'up' && "bg-life-birth",
            data.trend === 'down' && "bg-death-fire",
            data.trend === 'stable' && "bg-nebula-blue"
          )} />
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            LIFEOFCOIN
          </h2>
          <p className="text-xs text-muted-foreground">LIFEOFCOIN</p>
        </div>
        
        <div className="space-y-3">
          {data.price && (
            <div className="text-lg font-semibold text-foreground">
              ${data.price}
              {data.priceChange24h !== undefined && (
                <span className={cn(
                  "ml-2 text-sm",
                  data.priceChange24h >= 0 ? "text-life-birth" : "text-death-fire"
                )}>
                  ({data.priceChange24h >= 0 ? '+' : ''}{data.priceChange24h.toFixed(2)}%)
                </span>
              )}
            </div>
          )}
          
          <div className="text-2xl font-bold text-foreground animate-float">
            {data.marketCap > 0 ? formatMarketCap(data.marketCap) : 'Loading...'}
          </div>
          
          <div className={cn(
            "flex items-center gap-2 text-sm font-medium transition-colors duration-500",
            data.trend === 'up' && "text-life-birth",
            data.trend === 'down' && "text-death-fire",
            data.trend === 'stable' && "text-muted-foreground"
          )}>
            <span className={cn(
              "inline-block w-0 h-0 transition-transform duration-500",
              data.trend === 'up' && "border-l-4 border-r-4 border-b-4 border-transparent border-b-life-birth transform rotate-0",
              data.trend === 'down' && "border-l-4 border-r-4 border-t-4 border-transparent border-t-death-fire transform rotate-0",
              data.trend === 'stable' && "w-2 h-2 bg-muted-foreground rounded-full border-0"
            )} />
            
            <span className={cn(
              "transition-all duration-500",
              Math.abs(data.change) >= 5000 && "animate-energy-pulse"
            )}>
              {formatChange(data.change)}
            </span>
            
            {Math.abs(data.change) >= 5000 && (
              <span className={cn(
                "text-xs px-2 py-1 rounded-full animate-pulse-glow",
                data.trend === 'up' && "bg-life-birth/20 text-life-birth",
                data.trend === 'down' && "bg-death-fire/20 text-death-fire"
              )}>
                {data.trend === 'up' ? 'LIFE CREATED' : 'LIFE DESTROYED'}
              </span>
            )}
          </div>
        </div>
        
        {/* Energy bar */}
        <div className="mt-4 relative">
          <div className="w-full h-2 bg-space-medium rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-1000 rounded-full",
                data.trend === 'up' && "bg-life animate-energy-pulse",
                data.trend === 'down' && "bg-death animate-pulse-glow", 
                data.trend === 'stable' && "bg-nebula-blue"
              )}
              style={{ 
                width: `${Math.min(100, Math.max(10, (data.marketCap / 100000) * 100))}%` 
              }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Universal Energy Level
          </div>
        </div>
      </div>
    </Card>
  );
};