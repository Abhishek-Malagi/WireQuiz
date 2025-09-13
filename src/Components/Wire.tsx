'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Plug, Tag } from 'lucide-react';
import { MousePosition } from '@/types/game';

interface WireProps {
  id: number;
  question: string;
  category: string;
  isConnected: boolean;
  isCorrect: boolean;
  onDragStart: (wireId: number, startPos: MousePosition) => void;
  onDragEnd: (wireId: number, socketId: number | null) => void;
  onPositionUpdate: (wireId: number, position: MousePosition) => void;
  color: string;
  isDraggingThis: boolean;
}

export default function Wire({ 
  id, 
  question, 
  category,
  isConnected, 
  isCorrect,
  onDragStart, 
  onDragEnd, 
  onPositionUpdate,
  color, 
  isDraggingThis 
}: WireProps) {
  const plugRef = useRef<HTMLDivElement>(null);
  const [plugPosition, setPlugPosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [originalPosition, setOriginalPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const updatePlugPosition = () => {
      if (plugRef.current) {
        const rect = plugRef.current.getBoundingClientRect();
        const newPosition = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
        setPlugPosition(newPosition);
        if (!isDraggingThis) {
          setOriginalPosition(newPosition);
        }
        onPositionUpdate(id, newPosition);
      }
    };

    updatePlugPosition();
    const interval = setInterval(updatePlugPosition, 100);
    return () => clearInterval(interval);
  }, [id, onPositionUpdate, isDraggingThis]);

  return (
    <div className="flex items-center mb-4 group">
      {/* Question Card */}
      <motion.div 
        className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 text-white p-4 rounded-xl border border-slate-600 mr-4 shadow-lg"
        whileHover={{ scale: 1.02 }}
        animate={isConnected ? {
          borderColor: isCorrect ? '#22c55e' : '#ef4444'
        } : {}}
        transition={{ duration: 0.3 }}
      >
        {/* Category Tag */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Tag className="w-3 h-3 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              {category}
            </span>
          </div>
          
          {/* Wire Color Indicator */}
          <div 
            className="w-3 h-3 rounded-full border border-white/30" 
            style={{ backgroundColor: color }}
          />
        </div>
        
        {/* Question Text */}
        <p className="text-sm font-medium leading-relaxed text-gray-100">
          {question}
        </p>

        {/* Connection Status */}
        {isConnected && (
          <div className={`mt-2 flex items-center space-x-1 text-xs font-semibold ${
            isCorrect ? 'text-green-400' : 'text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isCorrect ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <span>{isCorrect ? 'Correct' : 'Incorrect'}</span>
          </div>
        )}
      </motion.div>
      
      {/* Plug */}
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
        onDragStart={() => {
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
        className={`relative cursor-grab ${isDraggingThis ? 'cursor-grabbing z-50' : ''}`}
        whileDrag={{ 
          scale: 1.2, 
          zIndex: 1000,
          rotate: [0, 2, -2, 0]
        }}
        whileHover={{ 
          scale: (isConnected && isCorrect) ? 1 : 1.1,
          rotate: [0, 1, -1, 0]
        }}
        animate={!isDraggingThis ? { 
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
        {/* Plug Body */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <motion.div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 shadow-lg ${
              isConnected && isCorrect 
                ? 'bg-green-600 border-green-400' 
                : 'bg-gradient-to-br from-red-600 to-red-700 border-red-400'
            }`}
            style={{
              backgroundColor: !isConnected ? color : undefined
            }}
            animate={isDraggingThis ? {
              borderColor: ['#ffffff', color, '#ffffff']
            } : {}}
            transition={{ duration: 0.5, repeat: isDraggingThis ? Infinity : 0 }}
          >
            <Plug className="w-6 h-6 text-white" />
          </motion.div>

          {/* Connection Glow */}
          {isConnected && isCorrect && (
            <motion.div
              className="absolute inset-0 rounded-xl blur-md"
              style={{ backgroundColor: '#22c55e' }}
              animate={{ 
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
          
          {/* Drag Indicator */}
          {isDraggingThis && (
            <motion.div
              className="absolute inset-0 border-2 border-dashed border-white rounded-xl"
              animate={{ 
                opacity: [0.5, 1, 0.5],
                rotate: [0, 360]
              }}
              transition={{ 
                opacity: { duration: 0.5, repeat: Infinity },
                rotate: { duration: 2, repeat: Infinity, ease: "linear" }
              }}
            />
          )}

          {/* Wire Attachment Point */}
          <div
            className="absolute -left-2 top-1/2 w-4 h-2 rounded-l-full border border-white/30"
            style={{ backgroundColor: color }}
          />
        </div>
      </motion.div>
    </div>
  );
}