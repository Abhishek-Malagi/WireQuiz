'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface SocketProps {
  id: number;
  answer: string;
  isConnected: boolean;
  isCorrect: boolean;
  wireColor?: string;
  onPositionUpdate?: (id: number, position: { x: number; y: number }) => void;
}

export default function Socket({ 
  id, 
  answer, 
  isConnected, 
  isCorrect, 
  wireColor, 
  onPositionUpdate 
}: SocketProps) {
  const socketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (socketRef.current && onPositionUpdate) {
        const rect = socketRef.current.getBoundingClientRect();
        onPositionUpdate(id, {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [id, onPositionUpdate]);

  return (
    <div className="flex items-center mb-4">
      {/* Enhanced Game Asset Socket */}
      <div className="relative mr-4">
        <motion.div
          ref={socketRef}
          className="socket-target relative"
          data-socket-id={id}
          whileHover={{ scale: isConnected ? 1 : 1.08 }}
          animate={isConnected && isCorrect ? {
            boxShadow: [
              '0 0 0 0 rgba(34, 197, 94, 0.8)',
              '0 0 0 20px rgba(34, 197, 94, 0.1)',
              '0 0 0 0 rgba(34, 197, 94, 0.8)'
            ]
          } : isConnected && !isCorrect ? {
            boxShadow: [
              '0 0 0 0 rgba(239, 68, 68, 0.8)',
              '0 0 0 20px rgba(239, 68, 68, 0.1)',
              '0 0 0 0 rgba(239, 68, 68, 0.8)'
            ]
          } : {}}
          transition={{ 
            duration: 1.5, 
            repeat: isConnected ? Infinity : 0,
            scale: { duration: 0.2 }
          }}
        >
          <div className="relative w-20 h-20">
            {/* Enhanced Socket Design */}
            <motion.div 
              className={`w-20 h-20 rounded-2xl border-4 ${
                isConnected 
                  ? (isCorrect 
                      ? 'border-green-400 bg-gradient-to-br from-green-50 to-green-100 shadow-green-200' 
                      : 'border-red-400 bg-gradient-to-br from-red-50 to-red-100 shadow-red-200'
                    )
                  : 'border-gray-400 bg-gradient-to-br from-gray-50 to-gray-100 hover:border-blue-400 hover:from-blue-50 hover:to-blue-100 hover:shadow-md'
              } flex items-center justify-center transition-all duration-300 backdrop-blur-sm`}
              animate={isConnected ? {
                borderWidth: [4, 6, 4],
              } : {}}
              transition={{ duration: 1, repeat: isConnected ? Infinity : 0 }}
            >
              
              {/* Socket holes representation with enhanced styling */}
              <div className="flex space-x-2">
                <motion.div 
                  className={`w-3 h-8 rounded-lg shadow-inner ${
                    isConnected ? 'bg-gray-700' : 'bg-gray-400'
                  } transition-all duration-300`}
                  animate={isConnected ? {
                    backgroundColor: ['#374151', '#1f2937', '#374151']
                  } : {}}
                  transition={{ duration: 1.5, repeat: isConnected ? Infinity : 0 }}
                />
                <motion.div 
                  className={`w-3 h-8 rounded-lg shadow-inner ${
                    isConnected ? 'bg-gray-700' : 'bg-gray-400'
                  } transition-all duration-300`}
                  animate={isConnected ? {
                    backgroundColor: ['#374151', '#1f2937', '#374151']
                  } : {}}
                  transition={{ duration: 1.5, repeat: isConnected ? Infinity : 0, delay: 0.2 }}
                />
              </div>
              
              {/* Connection indicator with enhanced effects */}
              {isConnected && wireColor && (
                <>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.4 }}
                    className="absolute inset-2 rounded-xl"
                    style={{ backgroundColor: wireColor }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Pulsing connection indicator */}
                  <motion.div
                    className="absolute inset-1 rounded-xl border-2"
                    style={{ borderColor: wireColor }}
                    animate={{
                      opacity: [0.3, 0.8, 0.3],
                      scale: [0.9, 1, 0.9]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </>
              )}

              {/* Floating particles for connection */}
              {isConnected && isCorrect && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-green-400 rounded-full"
                      style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${20 + Math.random() * 60}%`,
                      }}
                      animate={{
                        y: [-10, -25, -10],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.5,
                      }}
                    />
                  ))}
                </>
              )}
            </motion.div>
            
            {/* Enhanced Status icons */}
            {isConnected && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-xl border-2 border-white ${
                  isCorrect ? 'bg-green-500' : 'bg-red-500'
                }`}
                whileHover={{ scale: 1.1 }}
              >
                <motion.span 
                  className="text-white text-sm font-bold"
                  animate={isCorrect ? {
                    scale: [1, 1.2, 1]
                  } : {
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: isCorrect ? 1 : 0.5, 
                    repeat: Infinity 
                  }}
                >
                  {isCorrect ? '✓' : '✕'}
                </motion.span>
              </motion.div>
            )}

            {/* Socket power indicator */}
            {!isConnected && (
              <motion.div
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gray-400 rounded-full"
                animate={{
                  backgroundColor: ['#9ca3af', '#6b7280', '#9ca3af']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Enhanced Answer Card */}
      <motion.div 
        className={`relative p-4 rounded-xl shadow-xl border-2 min-w-[280px] lg:min-w-[320px] transition-all duration-300 overflow-hidden backdrop-blur-sm ${
          isConnected && isCorrect 
            ? 'bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 border-green-400 text-green-900' 
            : isConnected && !isCorrect 
            ? 'bg-gradient-to-br from-red-50 via-red-100 to-rose-100 border-red-400 text-red-900'
            : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 border-blue-300 text-blue-900 hover:shadow-xl hover:border-blue-400'
        }`}
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        }}
        animate={isConnected && isCorrect ? {
          borderColor: ['#4ade80', '#22c55e', '#4ade80']
        } : isConnected && !isCorrect ? {
          borderColor: ['#f87171', '#ef4444', '#f87171']
        } : {}}
        transition={{ duration: 2, repeat: isConnected ? Infinity : 0 }}
      >
        {/* Animated background shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-pulse duration-3000" />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <p className="text-sm font-bold leading-relaxed">{answer}</p>
            
            {/* Connection status indicator */}
            {isConnected && (
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                className={`px-2 py-1 rounded-full text-xs font-bold ${
                  isCorrect 
                    ? 'bg-green-200 text-green-800' 
                    : 'bg-red-200 text-red-800'
                }`}
              >
                {isCorrect ? 'CORRECT' : 'WRONG'}
              </motion.div>
            )}
          </div>

          {/* Wire color indicator */}
          {isConnected && wireColor && (
            <motion.div 
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="relative flex-shrink-0"
            >
              <div
                className="w-5 h-5 rounded-full border-2 border-white shadow-lg" 
                style={{ backgroundColor: wireColor }}
              />
              
              {/* Pulsing ring around color indicator */}
              <motion.div
                className="absolute inset-0 rounded-full border-2"
                style={{ borderColor: wireColor }}
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.8, 0.2, 0.8]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          )}

          {/* Socket readiness indicator */}
          {!isConnected && (
            <motion.div
              className="w-4 h-4 rounded-full bg-gray-300 border-2 border-gray-400"
              animate={{
                borderColor: ['#9ca3af', '#6b7280', '#9ca3af'],
                backgroundColor: ['#d1d5db', '#9ca3af', '#d1d5db']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>

        {/* Decorative corner accent */}
        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
          isConnected && isCorrect 
            ? 'bg-green-400' 
            : isConnected && !isCorrect 
            ? 'bg-red-400' 
            : 'bg-blue-400'
        }`} />

        {/* Success confetti */}
        {isConnected && isCorrect && (
          <>
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-green-400 rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-20, -40, -60],
                  opacity: [1, 0.5, 0],
                  scale: [1, 0.5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </>
        )}
      </motion.div>
    </div>
  );
}