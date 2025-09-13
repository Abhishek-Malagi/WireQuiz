'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Power, X } from 'lucide-react';

interface SocketProps {
  id: number;
  answer: string;
  isConnected: boolean;
  isCorrect: boolean;
  wireColor?: string;
  onPositionUpdate: (id: number, position: { x: number; y: number }) => void;
  onDisconnect?: () => void;
}

export default function Socket({ 
  id, 
  answer, 
  isConnected, 
  isCorrect, 
  wireColor, 
  onPositionUpdate,
  onDisconnect 
}: SocketProps) {
  const socketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (socketRef.current) {
        const rect = socketRef.current.getBoundingClientRect();
        onPositionUpdate(id, {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        });
      }
    };

    updatePosition();
    const interval = setInterval(updatePosition, 100);
    return () => clearInterval(interval);
  }, [id, onPositionUpdate]);

  return (
    <div className="flex items-center mb-4 group">
      {/* Socket */}
      <motion.div
        ref={socketRef}
        className="socket-target relative mr-4"
        data-socket-id={id}
        whileHover={{ scale: isConnected ? 1 : 1.05 }}
        animate={isConnected ? {
          boxShadow: isCorrect 
            ? ['0 0 0 0 rgba(34, 197, 94, 0.8)', '0 0 0 15px rgba(34, 197, 94, 0.1)', '0 0 0 0 rgba(34, 197, 94, 0.8)']
            : ['0 0 0 0 rgba(239, 68, 68, 0.8)', '0 0 0 15px rgba(239, 68, 68, 0.1)', '0 0 0 0 rgba(239, 68, 68, 0.8)']
        } : {}}
        transition={{ 
          duration: 1.5, 
          repeat: isConnected ? Infinity : 0,
          scale: { duration: 0.2 }
        }}
      >
        <div className="relative w-16 h-16">
          {/* Socket Body */}
          <motion.div 
            className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center shadow-lg transition-all duration-300 ${
              isConnected 
                ? (isCorrect 
                    ? 'border-green-400 bg-gradient-to-br from-green-100 to-green-200' 
                    : 'border-red-400 bg-gradient-to-br from-red-100 to-red-200'
                  )
                : 'border-slate-400 bg-gradient-to-br from-slate-200 to-slate-300 hover:border-blue-400 hover:from-blue-100 hover:to-blue-200'
            }`}
            animate={isConnected ? {
              borderWidth: [2, 3, 2],
            } : {}}
            transition={{ duration: 1, repeat: isConnected ? Infinity : 0 }}
          >
            
            {/* Socket Holes */}
            <div className="flex flex-col space-y-1">
              <div className="flex space-x-1">
                <motion.div 
                  className={`w-2 h-6 rounded-sm shadow-inner ${
                    isConnected ? 'bg-slate-700' : 'bg-slate-500'
                  }`}
                  animate={isConnected && isCorrect ? {
                    backgroundColor: ['#374151', '#1f2937', '#374151']
                  } : {}}
                  transition={{ duration: 1.5, repeat: isConnected && isCorrect ? Infinity : 0 }}
                />
                <motion.div 
                  className={`w-2 h-6 rounded-sm shadow-inner ${
                    isConnected ? 'bg-slate-700' : 'bg-slate-500'
                  }`}
                  animate={isConnected && isCorrect ? {
                    backgroundColor: ['#374151', '#1f2937', '#374151']
                  } : {}}
                  transition={{ duration: 1.5, repeat: isConnected && isCorrect ? Infinity : 0, delay: 0.2 }}
                />
              </div>
              <div className={`w-5 h-2 rounded-sm mx-auto shadow-inner ${
                isConnected ? 'bg-slate-700' : 'bg-slate-500'
              }`} />
            </div>
            
            {/* Connection Indicator */}
            {isConnected && wireColor && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.3 }}
                className="absolute inset-2 rounded-lg"
                style={{ backgroundColor: wireColor }}
                transition={{ duration: 0.3 }}
              />
            )}

            {/* Power Icon */}
            {isConnected && (
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center border border-white shadow-lg"
                style={{ backgroundColor: isCorrect ? '#22c55e' : '#ef4444' }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                whileHover={{ scale: 1.1 }}
              >
                <Power className="w-3 h-3 text-white" />
              </motion.div>
            )}

            {/* Disconnect Button for Wrong Connections */}
            {isConnected && !isCorrect && onDisconnect && (
              <motion.button
                className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border border-white shadow-lg hover:bg-red-600"
                onClick={onDisconnect}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-3 h-3 text-white" />
              </motion.button>
            )}
          </motion.div>

          {/* Power Status Light */}
          <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-1 rounded-full ${
            isConnected && isCorrect ? 'bg-green-400' : isConnected ? 'bg-red-400' : 'bg-slate-400'
          }`}>
            {isConnected && isCorrect && (
              <motion.div
                className="w-full h-full bg-green-300 rounded-full"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Answer Card */}
      <motion.div 
        className={`flex-1 p-4 rounded-xl border shadow-lg transition-all duration-300 ${
          isConnected && isCorrect 
            ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-400 text-green-900' 
            : isConnected && !isCorrect 
            ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-400 text-red-900'
            : 'bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300 text-slate-800 hover:shadow-xl hover:border-blue-400'
        }`}
        whileHover={{ scale: 1.02 }}
        animate={isConnected && isCorrect ? {
          borderColor: ['#4ade80', '#22c55e', '#4ade80']
        } : isConnected && !isCorrect ? {
          borderColor: ['#f87171', '#ef4444', '#f87171']
        } : {}}
        transition={{ duration: 2, repeat: isConnected ? Infinity : 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <p className="font-semibold">{answer}</p>
            
            {/* Connection Status Badge */}
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
                {isCorrect ? 'CORRECT' : 'INCORRECT'}
              </motion.div>
            )}
          </div>

          {/* Wire Color Indicator */}
          {isConnected && wireColor && (
            <motion.div 
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="relative"
            >
              <div
                className="w-4 h-4 rounded-full border-2 border-white shadow-lg" 
                style={{ backgroundColor: wireColor }}
              />
              
              {/* Pulsing Ring */}
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

          {/* Socket Ready Indicator */}
          {!isConnected && (
            <motion.div
              className="w-3 h-3 rounded-full bg-slate-300 border border-slate-400"
              animate={{
                borderColor: ['#94a3b8', '#64748b', '#94a3b8'],
                backgroundColor: ['#cbd5e1', '#94a3b8', '#cbd5e1']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}