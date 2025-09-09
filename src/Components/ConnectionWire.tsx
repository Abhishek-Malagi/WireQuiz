'use client';

import { motion } from 'framer-motion';
import { MousePosition } from '@/types/game';

interface ConnectionWireProps {
  startPos: MousePosition;
  endPos: MousePosition;
  color: string;
  isConnected: boolean;
}

export default function ConnectionWire({ startPos, endPos, color, isConnected }: ConnectionWireProps) {
  const calculatePath = () => {
    const dx = endPos.x - startPos.x;
    const dy = endPos.y - startPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Create a more dynamic curve based on distance and direction
    const midX = startPos.x + dx * 0.5;
    const midY = startPos.y + dy * 0.4 - Math.min(distance * 0.15, 100);
    
    // Add secondary control point for more natural curve
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
      className="fixed inset-0 pointer-events-none z-30"
      style={{ width: '100vw', height: '100vh' }}
    >
      {/* Main wire path with enhanced styling */}
      <motion.path
        d={path}
        stroke={color}
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="filter drop-shadow-lg"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: 1, 
          opacity: isConnected ? 1 : 0.7,
          strokeWidth: isConnected ? 8 : 5
        }}
        transition={{ 
          duration: isConnected ? 0.8 : 0.2,
          ease: "easeOut"
        }}
        style={{
          filter: isConnected ? `drop-shadow(0 0 12px ${color}60) drop-shadow(0 0 24px ${color}30)` : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
        }}
      />

      {/* Outer glow effect for connected wires */}
      {isConnected && (
        <motion.path
          d={path}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-30 blur-sm"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      )}

      {/* Inner highlight for connected wires */}
      {isConnected && (
        <motion.path
          d={path}
          stroke="#ffffff"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-60"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        />
      )}
      
      {/* Energy pulse effect for connected wires */}
      {isConnected && (
        <>
          <motion.circle
            r="4"
            fill={color}
            className="opacity-80 drop-shadow-md"
          >
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              path={path}
            />
            <animate
              attributeName="opacity"
              values="0.8;0.4;0.8"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </motion.circle>

          {/* Secondary smaller pulse */}
          <motion.circle
            r="2"
            fill="#ffffff"
            className="opacity-90"
          >
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              path={path}
              begin="0.5s"
            />
          </motion.circle>

          {/* Tertiary pulse for extra effect */}
          <motion.circle
            r="3"
            fill={color}
            className="opacity-50"
          >
            <animateMotion
              dur="4s"
              repeatCount="indefinite"
              path={path}
              begin="1s"
            />
            <animate
              attributeName="r"
              values="3;6;3"
              dur="2s"
              repeatCount="indefinite"
            />
          </motion.circle>
        </>
      )}

      {/* Dragging wire sparkle effects */}
      {!isConnected && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.circle
              key={i}
              r="2"
              fill="#ffffff"
              className="opacity-60"
              cx={startPos.x + (endPos.x - startPos.x) * (0.3 + i * 0.2)}
              cy={startPos.y + (endPos.y - startPos.y) * (0.3 + i * 0.2)}
              animate={{
                opacity: [0.6, 1, 0.6],
                r: [2, 4, 2]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </>
      )}

      {/* Wire connection points */}
      <motion.circle
        cx={startPos.x}
        cy={startPos.y}
        r="6"
        fill={color}
        className="opacity-80"
        animate={isConnected ? {
          r: [6, 8, 6],
          opacity: [0.8, 1, 0.8]
        } : {}}
        transition={{ duration: 1.5, repeat: isConnected ? Infinity : 0 }}
      />

      {/* End point indicator */}
      <motion.circle
        cx={endPos.x}
        cy={endPos.y}
        r="5"
        fill={isConnected ? color : "#ffffff"}
        className="opacity-70"
        animate={isConnected ? {
          r: [5, 7, 5],
          opacity: [0.7, 1, 0.7]
        } : {
          r: [5, 6, 5],
          opacity: [0.7, 0.9, 0.7]
        }}
        transition={{ duration: 1, repeat: Infinity }}
      />

      {/* Connection success burst effect */}
      {isConnected && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.circle
              key={`burst-${i}`}
              cx={endPos.x}
              cy={endPos.y}
              r="2"
              fill={color}
              className="opacity-60"
              animate={{
                r: [2, 8, 0],
                opacity: [0.6, 0.2, 0],
                cx: endPos.x + Math.cos((i * 60) * Math.PI / 180) * 15,
                cy: endPos.y + Math.sin((i * 60) * Math.PI / 180) * 15
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1
              }}
            />
          ))}
        </>
      )}

      {/* Connection status indicators at path intervals */}
      {isConnected && (
        <>
          {[0.25, 0.5, 0.75].map((position, i) => (
            <motion.circle
              key={`marker-${i}`}
              r="1"
              fill={color}
              className="opacity-40"
            >
              <animateMotion
                dur="0.1s"
                fill="freeze"
                path={path}
                keyTimes="0;1"
                values={`0;${position}`}
              />
              <animate
                attributeName="opacity"
                values="0.4;0.8;0.4"
                dur="2s"
                repeatCount="indefinite"
                begin={`${i * 0.5}s`}
              />
            </motion.circle>
          ))}
        </>
      )}
    </svg>
  );
}
