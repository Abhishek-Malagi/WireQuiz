'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { MousePosition } from '@/types/game';

// Import assets from src/assets
import handPlug from '@/assets/hand-holding-plug.png';

interface WireProps {
  id: number;
  question: string;
  category?: string;
  isConnected: boolean;
  onDragStart: (wireId: number, startPos: MousePosition) => void;
  onDragEnd: (wireId: number, socketId: number | null) => void;
  onPositionUpdate: (wireId: number, position: MousePosition) => void;
  color: string;
  mousePosition: MousePosition;
  isDraggingThis: boolean;
}

export default function Wire({ 
  id, 
  question, 
  category, 
  isConnected, 
  onDragStart, 
  onDragEnd, 
  onPositionUpdate,
  color, 
  mousePosition, 
  isDraggingThis 
}: WireProps) {
  const plugRef = useRef<HTMLDivElement>(null);
  const [plugPosition, setPlugPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const updatePlugPosition = () => {
      if (plugRef.current) {
        const rect = plugRef.current.getBoundingClientRect();
        const newPosition = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
        setPlugPosition(newPosition);
        onPositionUpdate(id, newPosition);
      }
    };

    updatePlugPosition();
    window.addEventListener('resize', updatePlugPosition);
    window.addEventListener('scroll', updatePlugPosition);
    
    // Update position when component mounts or updates
    const interval = setInterval(updatePlugPosition, 100);
    
    return () => {
      window.removeEventListener('resize', updatePlugPosition);
      window.removeEventListener('scroll', updatePlugPosition);
      clearInterval(interval);
    };
  }, [id, onPositionUpdate]);

  return (
    <div className="relative mb-4">
      <div className="flex items-center">
        {/* Enhanced Question Card */}
        <motion.div 
          className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 text-white p-4 rounded-xl shadow-xl border-2 border-slate-500/50 min-w-[280px] lg:min-w-[320px] mr-4 relative overflow-hidden backdrop-blur-sm"
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
          animate={isConnected ? {
            borderColor: [color + '80', color + 'FF', color + '80']
          } : {}}
          transition={{ duration: 2, repeat: isConnected ? Infinity : 0 }}
        >
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-pulse duration-4000" />
          
          {/* Category badge and wire color indicator */}
          <div className="flex items-center justify-between mb-3 relative z-10">
            <motion.span 
              className="text-xs font-bold text-cyan-300 uppercase tracking-wider px-3 py-1 bg-cyan-900/40 rounded-full border border-cyan-500/30 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              {category}
            </motion.span>
            
            <motion.div 
              className="w-4 h-4 rounded-full shadow-lg border-2 border-white/30 relative" 
              style={{ backgroundColor: color }}
              animate={isConnected ? {
                scale: [1, 1.2, 1],
                boxShadow: [
                  `0 0 0 0 ${color}80`,
                  `0 0 0 8px ${color}20`,
                  `0 0 0 0 ${color}80`
                ]
              } : {}}
              transition={{ duration: 1.5, repeat: isConnected ? Infinity : 0 }}
            >
              {isConnected && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: color }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
          </div>
          
          {/* Question text */}
          <p className="text-sm font-semibold leading-relaxed relative z-10 text-gray-100">
            {question}
          </p>

          {/* Connection status indicator */}
          {isConnected && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <span className="text-white text-xs font-bold">✓</span>
            </motion.div>
          )}

          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-white to-transparent rounded-xl" />
        </motion.div>
        
        {/* Enhanced Game Asset Plug with improved drag behavior */}
        <motion.div
          ref={plugRef}
          drag
          dragMomentum={false}
          dragElastic={0.1}
          dragTransition={{ 
            bounceStiffness: 300, 
            bounceDamping: 20,
            power: 0.2,
            timeConstant: 200
          }}
          onDragStart={(event, info) => {
            onDragStart(id, plugPosition);
          }}
          onDragEnd={(event, info) => {
            const elements = document.elementsFromPoint(info.point.x, info.point.y);
            const socketElement = elements.find(el => el.classList.contains('socket-target'));
            
            if (socketElement) {
              const socketId = parseInt(socketElement.getAttribute('data-socket-id') || '0');
              onDragEnd(id, socketId);
            } else {
              onDragEnd(id, null);
            }
          }}
          className={`relative cursor-grab ${isDraggingThis ? 'cursor-grabbing z-50' : ''} flex items-center justify-center`}
          whileDrag={{ 
            scale: 1.2, 
            zIndex: 1000,
            rotate: [0, 2, -2, 0]
          }}
          whileHover={{ 
            scale: isConnected ? 1 : 1.08,
            rotate: [0, 1, -1, 0]
          }}
          animate={isConnected && !isDraggingThis ? { 
            x: 0, 
            y: 0,
            scale: 1,
            rotate: 0
          } : !isDraggingThis ? {
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0
          } : {}}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 25,
            mass: 0.8
          }}
        >
          {/* Plug container with enhanced styling */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Base plug image */}
            <Image
              src={handPlug}
              alt="Hand holding plug"
              width={80}
              height={80}
              className="object-contain drop-shadow-lg"
              priority
            />
            
            {/* Color overlay for wire matching */}
            <motion.div 
              className="absolute inset-2 mix-blend-multiply rounded-lg opacity-40"
              style={{ backgroundColor: color }}
              animate={isDraggingThis ? {
                opacity: [0.4, 0.7, 0.4]
              } : {}}
              transition={{ duration: 0.5, repeat: isDraggingThis ? Infinity : 0 }}
            />
            
            {/* Connection status glow */}
            {isConnected && (
              <motion.div
                className="absolute inset-0 rounded-full blur-md"
                style={{ backgroundColor: color }}
                animate={{ 
                  opacity: [0.2, 0.5, 0.2],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            
            {/* Drag indicator with enhanced effects */}
            {isDraggingThis && (
              <>
                <motion.div
                  className="absolute inset-0 border-2 border-dashed border-white rounded-lg"
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                    rotate: [0, 360]
                  }}
                  transition={{ 
                    opacity: { duration: 0.5, repeat: Infinity },
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" }
                  }}
                />
                
                {/* Dragging sparkles */}
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full"
                    style={{
                      top: `${25 + Math.random() * 50}%`,
                      left: `${25 + Math.random() * 50}%`,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      y: [-10, -20, -10]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </>
            )}

            {/* Wire attachment point indicator */}
            <motion.div
              className="absolute -right-1 top-1/2 w-3 h-3 rounded-full border-2 border-white shadow-md"
              style={{ backgroundColor: color }}
              animate={isDraggingThis ? {
                scale: [1, 1.3, 1],
                boxShadow: [
                  `0 0 0 0 ${color}80`,
                  `0 0 0 6px ${color}40`,
                  `0 0 0 0 ${color}80`
                ]
              } : isConnected ? {
                scale: [1, 1.1, 1]
              } : {}}
              transition={{ 
                duration: 1, 
                repeat: (isDraggingThis || isConnected) ? Infinity : 0 
              }}
            />
          </div>

          {/* Hover effect particles */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  top: `${30 + Math.random() * 40}%`,
                  left: `${30 + Math.random() * 40}%`,
                }}
                animate={{
                  opacity: [0, 0.8, 0],
                  scale: [0, 1, 0],
                  y: [0, -15, -30]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
