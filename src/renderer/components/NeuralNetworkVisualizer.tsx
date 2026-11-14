import React, { useEffect, useRef } from 'react';
import { OrbState } from './Orb';

interface NeuralNetworkVisualizerProps {
  state: OrbState;
  audioLevel?: number; // 0 to 1
  size?: number; // dimension in px
}

interface Neuron {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  radius: number;
  layer: number;
  charge: number;
  connections: number[];
}

interface SynapsePulse {
  from: number;
  to: number;
  progress: number;
  speed: number;
  color: string;
}

export const NeuralNetworkVisualizer: React.FC<NeuralNetworkVisualizerProps> = ({
  state,
  audioLevel = 0,
  size = 400
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;

    // Generate neural network graph with central nucleus and spreading layers
    const neurons: Neuron[] = [];
    const totalNeurons = 48;
    const layers = 4;

    // Central core neuron
    neurons.push({
      x: centerX,
      y: centerY,
      baseX: centerX,
      baseY: centerY,
      vx: 0,
      vy: 0,
      radius: 6,
      layer: 0,
      charge: 1,
      connections: []
    });

    // Radial spreading layers
    for (let l = 1; l <= layers; l++) {
      const count = l * 8 + 4;
      const radius = (size / 2.3) * (l / layers);
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (l * 0.4);
        const jitter = (Math.random() - 0.5) * 20;
        const x = centerX + Math.cos(angle) * (radius + jitter);
        const y = centerY + Math.sin(angle) * (radius + jitter);
        neurons.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: 2.5 + Math.random() * 2,
          layer: l,
          charge: Math.random(),
          connections: []
        });
      }
    }

    // Connect neurons based on distance & layer hierarchy
    for (let i = 0; i < neurons.length; i++) {
      for (let j = i + 1; j < neurons.length; j++) {
        const dx = neurons[i].x - neurons[j].x;
        const dy = neurons[i].y - neurons[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = size * 0.22;
        if (dist < maxDist && Math.abs(neurons[i].layer - neurons[j].layer) <= 1) {
          neurons[i].connections.push(j);
        }
      }
    }

    // Active action potential pulses traveling along synapses
    const pulses: SynapsePulse[] = [];

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, size, size);

      // Energy factor based on assistant state and microphone volume
      let activityBoost = 1.0;
      let pulseChance = 0.08;
      let coreColor = 'rgba(6, 182, 212, 1)'; // Cyan
      let pulseColor = '#22d3ee';

      if (state === 'listening' || state === 'dictating') {
        activityBoost = 1.8 + audioLevel * 3.0;
        pulseChance = 0.25 + audioLevel * 0.4;
        coreColor = 'rgba(56, 189, 248, 1)';
        pulseColor = '#38bdf8';
      } else if (state === 'thinking') {
        activityBoost = 2.5;
        pulseChance = 0.4;
        coreColor = 'rgba(168, 85, 247, 1)'; // Violet
        pulseColor = '#c084fc';
      } else if (state === 'speaking') {
        activityBoost = 2.8 + Math.sin(frame * 0.2) * 1.2;
        pulseChance = 0.35;
        coreColor = 'rgba(239, 68, 68, 1)'; // Aggressive Red/Amber electric core
        pulseColor = '#f87171';
      }

      // Draw outer ambient spreading wave
      const waveRadius = (size * 0.38) + Math.sin(frame * 0.05) * 8 * activityBoost;
      const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, waveRadius);
      gradient.addColorStop(0, state === 'speaking' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(6, 182, 212, 0.12)');
      gradient.addColorStop(0.5, 'rgba(14, 165, 233, 0.05)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Update neuron positions (gentle dynamic organic oscillation)
      for (const n of neurons) {
        const spreadFactor = state === 'listening' ? 1.15 + audioLevel * 0.4 : 1.0;
        const targetX = centerX + (n.baseX - centerX) * spreadFactor;
        const targetY = centerY + (n.baseY - centerY) * spreadFactor;

        n.x += (targetX - n.x) * 0.08 + Math.sin(frame * 0.03 + n.layer) * 0.6 * activityBoost;
        n.y += (targetY - n.y) * 0.08 + Math.cos(frame * 0.03 + n.layer) * 0.6 * activityBoost;
      }

      // Draw synaptic connections (lines)
      for (let i = 0; i < neurons.length; i++) {
        const n1 = neurons[i];
        for (const targetIdx of n1.connections) {
          const n2 = neurons[targetIdx];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = size * 0.28;
          const alpha = Math.max(0, 1 - dist / maxDist) * 0.35 * (activityBoost * 0.6);

          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.strokeStyle = state === 'speaking' 
            ? `rgba(239, 68, 68, ${alpha})`
            : state === 'thinking'
            ? `rgba(168, 85, 247, ${alpha})`
            : `rgba(6, 182, 212, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Random chance to spawn a traveling synaptic pulse
          if (Math.random() < pulseChance * 0.04) {
            pulses.push({
              from: i,
              to: targetIdx,
              progress: 0,
              speed: 0.02 + Math.random() * 0.03 * activityBoost,
              color: pulseColor
            });
          }
        }
      }

      // Draw traveling action potential pulses
      for (let p = pulses.length - 1; p >= 0; p--) {
        const pulse = pulses[p];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          pulses.splice(p, 1);
          continue;
        }

        const nFrom = neurons[pulse.from];
        const nTo = neurons[pulse.to];
        if (!nFrom || !nTo) continue;

        const px = nFrom.x + (nTo.x - nFrom.x) * pulse.progress;
        const py = nFrom.y + (nTo.y - nFrom.y) * pulse.progress;

        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = pulse.color;
        ctx.shadowColor = pulse.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      // Draw Neurons (nodes)
      for (let i = 0; i < neurons.length; i++) {
        const n = neurons[i];
        const isCore = i === 0;

        ctx.beginPath();
        const r = isCore ? n.radius + Math.sin(frame * 0.1) * 2 * activityBoost : n.radius;
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);

        if (isCore) {
          ctx.fillStyle = coreColor;
          ctx.shadowColor = coreColor;
          ctx.shadowBlur = 20 * activityBoost;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          const nodeColor = state === 'speaking' ? '#fca5a5' : '#67e8f9';
          ctx.fillStyle = nodeColor;
          ctx.shadowColor = nodeColor;
          ctx.shadowBlur = 6 * activityBoost;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [state, audioLevel, size]);

  return (
    <div className="relative flex items-center justify-center select-none pointer-events-none">
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="transition-all duration-300"
      />
    </div>
  );
};
