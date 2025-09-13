'use client';

import { motion } from 'framer-motion';
import { Lightbulb, Zap } from 'lucide-react';

interface BulbProps {
  correctConnections: number;
  totalConnections: number;
  isComplete: boolean;
}

export default function Bulb({ correctConnections, totalConnections, isComplete }: BulbProps) {
  const progressPercentage = (correctConnections / totalConnections) * 100;
  
  const getBulbIntensity = () => {
    if (correctConnections === 0) return 0;
    return (correctConnections / totalConnections) * 100;
  };

  const intensity = getBulbIntensity();

  return (
    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex flex-col items-center">
        {/* Power Display */}
        <div className="mb-3 flex items-center space-x-2 bg-slate-800/90 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-600">
          <Zap className={`w-4 h-4 ${intensity > 0 ? 'text-yellow-400' : 'text-gray-400'}`} />
          <span className={`text-sm font-bold ${intensity > 0 ? 'text-yellow-400' : 'text-gray-400'}`}>
            {correctConnections}/{totalConnections}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-24 h-2 bg-slate-700 rounded-full mb-4 overflow-hidden border border-slate-600">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          
          {intensity > 0 && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: `${progressPercentage}%` }}
            />
          )}
        </div>

        {/* Main Bulb */}
        <div className="relative">
          <motion.div
            className="relative w-20 h-20 rounded-full flex items-center justify-center"
            animate={{
              scale: isComplete ? [1, 1.1, 1] : intensity > 0 ? [1, 1.05, 1] : 1,
            }}
            transition={{
              duration: 2,
              repeat: intensity > 0 ? Infinity : 0,
              ease: "easeInOut"
            }}
            style={{
              background: intensity > 0 
                ? `radial-gradient(circle, rgba(255, 235, 59, ${intensity / 100}) 0%, rgba(255, 193, 7, ${intensity / 200}) 70%, transparent 100%)`
                : 'radial-gradient(circle, rgba(100, 116, 139, 0.3) 0%, transparent 70%)'
            }}
          >
            {/* Bulb Icon */}
            <motion.div
              animate={{
                filter: intensity > 0 
                  ? [`drop-shadow(0 0 10px rgba(255, 235, 59, ${intensity / 100}))`, `drop-shadow(0 0 20px rgba(255, 193, 7, ${intensity / 100}))`, `drop-shadow(0 0 10px rgba(255, 235, 59, ${intensity / 100}))`]
                  : 'drop-shadow(0 0 2px rgba(100, 116, 139, 0.5))'
              }}
              transition={{ duration: 2, repeat: intensity > 0 ? Infinity : 0 }}
            >
              <Lightbulb 
                className={`w-12 h-12 ${
                  intensity > 0 ? 'text-yellow-300' : 'text-slate-400'
                }`}
                fill={intensity > 0 ? 'currentColor' : 'none'}
              />
            </motion.div>

            {/* Glow Effect */}
            {intensity > 0 && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, rgba(255, 235, 59, ${intensity / 300}) 0%, transparent 60%)`
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}

            {/* Sparkles for complete circuit */}
            {isComplete && (
              <>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full"
                    style={{
                      top: `${20 + Math.random() * 60}%`,
                      left: `${20 + Math.random() * 60}%`,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.25,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </>
            )}
          </motion.div>

          {/* Electrical Ring */}
          <motion.div
            className={`absolute inset-0 rounded-full border-2 ${
              intensity > 0 ? 'border-yellow-400' : 'border-slate-600'
            }`}
            animate={intensity > 0 ? {
              rotate: [0, 360],
              borderColor: ['#facc15', '#fde047', '#facc15']
            } : {}}
            transition={{ 
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              borderColor: { duration: 2, repeat: Infinity }
            }}
          />
        </div>

        {/* Status Text */}
        <motion.div className="mt-4 text-center">
          <p className={`text-sm font-semibold ${
            isComplete ? 'text-green-400' : intensity > 0 ? 'text-yellow-400' : 'text-slate-400'
          }`}>
            {isComplete ? 'Circuit Complete!' : `${Math.round(progressPercentage)}% Powered`}
          </p>
        </motion.div>
      </div>
    </div>
  );
}