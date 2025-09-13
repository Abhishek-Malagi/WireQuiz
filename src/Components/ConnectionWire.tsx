'use client';

import { motion } from 'framer-motion';
import { MousePosition } from '@/types/game';

interface ConnectionWireProps {
  startPos: MousePosition;
  endPos: MousePosition;
  color: string;
  isConnected: boolean;
  isCorrect?: boolean;
}

export default function ConnectionWire({ startPos, endPos, color, isConnected, isCorrect = false }: ConnectionWireProps) {
  const calculatePath = () => {
    const dx = endPos.x - startPos.x;
    const dy = endPos.y - startPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const midX = startPos.x + dx * 0.5;
    const midY = startPos.y + dy * 0.4 - Math.min(distance * 0.15, 80);
    
    const secondMidX = startPos.x + dx * 0.7;
    const secondMidY = startPos.y + dy * 0.6 - Math.min(distance * 0.05, 30);
    
    return `M ${startPos.x} ${startPos.y} Q ${midX} ${midY} ${secondMidX} ${secondMidY} T ${endPos.x} ${endPos.y}`;
  };

  const calculateSimplePath = () => {
    const dx = endPos.x - startPos.x;
    const dy = endPos.y - startPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const midX = startPos.x + dx * 0.5;
    const midY = startPos.y + dy * 0.3 - distance * 0.1;
    
    return `M ${startPos.x} ${startPos.y} Q ${midX} ${midY} ${endPos.x} ${endPos.y}`;
  };

  const path = isConnected ? calculatePath() : calculateSimplePath();

  return (
    <svg
      className="fixed inset-0 pointer-events-none z-20"
      style={{ width: '100vw', height: '100vh' }}
    >
      {/* Outer glow for connected wires */}
      {isConnected && (
        <motion.path
          d={path}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-20 blur-sm"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      )}

      {/* Main wire path */}
      <motion.path
        d={path}
        stroke={color}
        strokeWidth={isConnected ? "6" : "4"}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="filter drop-shadow-md"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: 1, 
          opacity: isConnected ? 1 : 0.8,
        }}
        transition={{ 
          duration: isConnected ? 0.6 : 0.3,
          ease: "easeOut"
        }}
        style={{
          filter: isConnected 
            ? `drop-shadow(0 0 8px ${color}60)` 
            : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
        }}
      />

      {/* Inner highlight for connected wires */}
      {isConnected && (
        <motion.path
          d={path}
          stroke="#ffffff"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-50"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        />
      )}
      
      {/* Energy pulse for correct connections */}
      {isConnected && isCorrect && (
        <motion.circle
          r="3"
          fill="#ffffff"
          className="opacity-80"
        >
          <animateMotion
            dur="2s"
            repeatCount="indefinite"
            path={path}
          />
          <animate
            attributeName="opacity"
            values="0.8;0.4;0.8"
            dur="1s"
            repeatCount="indefinite"
          />
        </motion.circle>
      )}

      {/* Connection points */}
      <motion.circle
        cx={startPos.x}
        cy={startPos.y}
        r="4"
        fill={color}
        className="opacity-80"
        animate={isConnected ? {
          r: [4, 6, 4],
          opacity: [0.8, 1, 0.8]
        } : {}}
        transition={{ duration: 1.2, repeat: isConnected ? Infinity : 0 }}
      />

      <motion.circle
        cx={endPos.x}
        cy={endPos.y}
        r="4"
        fill={isConnected ? color : "#64748b"}
        className="opacity-70"
        animate={{
          r: [4, 5, 4],
          opacity: [0.7, 0.9, 0.7]
        }}
        transition={{ duration: 1, repeat: Infinity }}
      />

      {/* Dragging wire trail effect */}
      {!isConnected && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.circle
              key={i}
              r="2"
              fill="#ffffff"
              className="opacity-40"
              cx={startPos.x + (endPos.x - startPos.x) * (0.2 + i * 0.2)}
              cy={startPos.y + (endPos.y - startPos.y) * (0.2 + i * 0.2)}
              animate={{
                opacity: [0.4, 0.8, 0.4],
                r: [2, 3, 2]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </>
      )}
    </svg>
  );
}