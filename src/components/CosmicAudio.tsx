import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

interface CosmicAudioProps {
  marketTrend?: 'up' | 'down' | 'stable';
}

export const CosmicAudio = ({ marketTrend = 'stable' }: CosmicAudioProps) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);
  const masterGainRef = useRef<GainNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);

  const initializeAudio = () => {
    if (audioContextRef.current) return;

    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.connect(audioContextRef.current.destination);
      masterGainRef.current.gain.setValueAtTime(volume, audioContextRef.current.currentTime);
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  };

  const createCosmicAmbience = () => {
    if (!audioContextRef.current || !masterGainRef.current) return;

    // Clear existing oscillators
    stopAudio();

    const ctx = audioContextRef.current;
    const masterGain = masterGainRef.current;

    // Create multiple layers of ambient sound
    const frequencies = [40, 60, 80, 120, 180]; // Deep space frequencies
    const newOscillators: OscillatorNode[] = [];
    const newGainNodes: GainNode[] = [];

    frequencies.forEach((freq, index) => {
      // Create oscillator
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filterNode = ctx.createBiquadFilter();

      // Configure oscillator
      oscillator.type = index < 2 ? 'sine' : 'triangle';
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

      // Add subtle frequency modulation for organic feel
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.1 + Math.random() * 0.2, ctx.currentTime);
      lfo.type = 'sine';
      lfoGain.gain.setValueAtTime(2 + Math.random() * 3, ctx.currentTime);
      
      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);
      lfo.start();

      // Configure filter for warmth
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime);
      filterNode.Q.setValueAtTime(0.5, ctx.currentTime);

      // Configure gain
      const baseVolume = (0.1 - index * 0.015) * volume;
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(baseVolume, ctx.currentTime + 2 + Math.random() * 2);

      // Connect the chain
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(masterGain);

      // Store references
      newOscillators.push(oscillator);
      newGainNodes.push(gainNode);

      // Start oscillator
      oscillator.start();
    });

    // Add subtle white noise for texture
    const bufferSize = 4096;
    const whiteNoise = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = whiteNoise.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoiseSource = ctx.createBufferSource();
    const whiteNoiseGain = ctx.createGain();
    const whiteNoiseFilter = ctx.createBiquadFilter();

    whiteNoiseSource.buffer = whiteNoise;
    whiteNoiseSource.loop = true;
    whiteNoiseFilter.type = 'lowpass';
    whiteNoiseFilter.frequency.setValueAtTime(100, ctx.currentTime);
    whiteNoiseGain.gain.setValueAtTime(0.05 * volume, ctx.currentTime);

    whiteNoiseSource.connect(whiteNoiseFilter);
    whiteNoiseFilter.connect(whiteNoiseGain);
    whiteNoiseGain.connect(masterGain);
    whiteNoiseSource.start();

    newOscillators.push(whiteNoiseSource as any);
    newGainNodes.push(whiteNoiseGain);

    oscillatorsRef.current = newOscillators;
    gainNodesRef.current = newGainNodes;
  };

  const stopAudio = () => {
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Oscillator might already be stopped
      }
    });
    oscillatorsRef.current = [];
    gainNodesRef.current = [];
  };

  const toggleAudio = async () => {
    if (!isPlaying) {
      initializeAudio();
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      createCosmicAmbience();
      setIsPlaying(true);
    } else {
      stopAudio();
      setIsPlaying(false);
    }
  };

  // Adjust volume based on market trend
  useEffect(() => {
    if (!masterGainRef.current || !audioContextRef.current) return;

    let targetVolume = volume;
    if (marketTrend === 'up') {
      targetVolume = Math.min(volume * 1.2, 0.5);
    } else if (marketTrend === 'down') {
      targetVolume = volume * 0.7;
    }

    masterGainRef.current.gain.exponentialRampToValueAtTime(
      Math.max(targetVolume, 0.01),
      audioContextRef.current.currentTime + 1
    );
  }, [marketTrend, volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleAudio}
          className="text-white hover:text-primary"
        >
          {isPlaying ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
        <input
          type="range"
          min="0"
          max="0.5"
          step="0.05"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(volume / 0.5) * 100}%, rgba(255,255,255,0.2) ${(volume / 0.5) * 100}%, rgba(255,255,255,0.2) 100%)`
          }}
        />
        <span className="text-xs text-white/70 min-w-[3rem]">
          {Math.round(volume * 200)}%
        </span>
      </div>
    </div>
  );
};