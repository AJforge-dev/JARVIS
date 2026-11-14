import React from 'react';
import { NeuralNetworkVisualizer } from './NeuralNetworkVisualizer';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'dictating';

interface OrbProps {
  state: OrbState;
  size?: number;
  className?: string;
  audioLevel?: number;
}

export const Orb: React.FC<OrbProps> = ({ state, size = 64, className = '', audioLevel = 0 }) => {
  // For medium to large displays (hero or overlay), render the spreading neural network!
  if (size >= 80) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <NeuralNetworkVisualizer state={state} size={size} audioLevel={audioLevel} />
      </div>
    );
  }

  // Compact indicator icon
  const getColors = () => {
    switch (state) {
      case 'listening':
      case 'dictating':
        return { core: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' };
      case 'thinking':
        return { core: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' };
      case 'speaking':
        return { core: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)' };
      default:
        return { core: '#38bdf8', glow: 'rgba(56, 189, 248, 0.2)' };
    }
  };

  const { core, glow } = getColors();

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute rounded-full transition-all duration-300"
        style={{
          width: size * 1.4,
          height: size * 1.4,
          backgroundColor: glow,
          filter: 'blur(8px)',
          animation: state !== 'idle' ? 'pulse 1.5s infinite ease-in-out' : 'none'
        }}
      />
      <div
        className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-lg transition-all duration-300"
        style={{ backgroundColor: core }}
      />
    </div>
  );
};
