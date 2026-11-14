import React from 'react';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'dictating';

interface OrbProps {
  state: OrbState;
  size?: number;
  className?: string;
}

export const Orb: React.FC<OrbProps> = ({ state, size = 64, className = '' }) => {
  const getGradient = () => {
    switch (state) {
      case 'listening':
        return {
          inner: '#00dcff',
          outer: '#2563eb',
          glow: 'rgba(0, 220, 255, 0.45)'
        };
      case 'thinking':
        return {
          inner: '#c084fc',
          outer: '#8b5cf6',
          glow: 'rgba(192, 132, 252, 0.45)'
        };
      case 'speaking':
        return {
          inner: '#38bdf8',
          outer: '#3b82f6',
          glow: 'rgba(56, 189, 248, 0.45)'
        };
      case 'dictating':
        return {
          inner: '#f59e0b',
          outer: '#ef4444',
          glow: 'rgba(245, 158, 11, 0.45)'
        };
      default:
        return {
          inner: '#38bdf8',
          outer: '#1d4ed8',
          glow: 'rgba(56, 189, 248, 0.25)'
        };
    }
  };

  const colors = getGradient();

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer ambient blur glow */}
      <div
        className="absolute rounded-full transition-all duration-500 pointer-events-none"
        style={{
          width: size * 1.35,
          height: size * 1.35,
          backgroundColor: colors.glow,
          filter: 'blur(16px)',
          animation: state !== 'idle' ? 'pulseGlow 1.8s infinite ease-in-out' : 'none'
        }}
      />

      {/* SVG Orb Rings */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="relative z-10 transition-transform duration-300"
      >
        <defs>
          <radialGradient id="orbGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={colors.inner} stopOpacity="1" />
            <stop offset="70%" stopColor={colors.outer} stopOpacity="0.85" />
            <stop offset="100%" stopColor="#070a0f" stopOpacity="0.9" />
          </radialGradient>

          <filter id="orbGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Orbit Rings */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={colors.inner}
          strokeWidth="1.2"
          strokeDasharray="4 6"
          opacity="0.35"
          className={state === 'thinking' ? 'animate-spin' : ''}
          style={{ transformOrigin: '50% 50%', animationDuration: '6s' }}
        />

        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={colors.outer}
          strokeWidth="1.5"
          opacity="0.5"
        />

        {/* Center Main Sphere */}
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="url(#orbGradient)"
          filter="url(#orbGlow)"
        />

        {/* Inner soundwave or core glow */}
        <circle
          cx="50"
          cy="50"
          r="14"
          fill="#ffffff"
          opacity={state === 'speaking' || state === 'listening' ? '0.85' : '0.45'}
          className={state === 'speaking' || state === 'listening' ? 'animate-ping' : ''}
          style={{ transformOrigin: '50% 50%', animationDuration: '1.2s' }}
        />
      </svg>
    </div>
  );
};
