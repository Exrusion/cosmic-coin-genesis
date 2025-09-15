interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity?: {
    usd?: number;
    base?: number;
    quote?: number;
  };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
}

interface DexScreenerResponse {
  schemaVersion: string;
  pairs: DexScreenerPair[];
}

export class DexScreenerService {
  private static readonly BASE_URL = 'https://api.dexscreener.com/latest/dex';
  
  static parseTokenAddress(url: string): string | null {
    // Extract token address from DexScreener URL
    // Format: https://dexscreener.com/solana/[token-address]
    const match = url.match(/\/solana\/([a-zA-Z0-9]+)$/);
    return match ? match[1] : null;
  }
  
  static async getTokenData(tokenAddress: string): Promise<DexScreenerPair | null> {
    try {
      console.log('Fetching token data for:', tokenAddress);
      
      const response = await fetch(`${this.BASE_URL}/pairs/solana/${tokenAddress}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: DexScreenerResponse = await response.json();
      console.log('DexScreener response:', data);
      
      if (data.pairs && data.pairs.length > 0) {
        return data.pairs[0]; // Return the first pair
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching token data:', error);
      return null;
    }
  }
  
  static formatMarketCap(marketCap: number | undefined): number {
    if (!marketCap) return 0;
    return Math.round(marketCap);
  }
  
  static calculateChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return current - previous;
  }
  
  static determineTrend(priceChange: number): 'up' | 'down' | 'stable' {
    if (priceChange > 0.05) return 'up'; // 5% or more increase
    if (priceChange < -0.05) return 'down'; // 5% or more decrease
    return 'stable';
  }
}