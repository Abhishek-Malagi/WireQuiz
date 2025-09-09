'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Zap, Power } from 'lucide-react';

// Import assets from src/assets
import bulbGlowing from '@/assets/bulb-glowing.png';
import bulbOff from '@/assets/bulb-off.png';

interface BulbProps {
  isGlowing: boolean;
  correctConnections: number;
  totalConnections: number;
}

export default function Bulb({ isGlowing, correctConnections, totalConnections }: BulbProps) {
  const progressPercentage = (correctConnections / totalConnections) * 100;

  return (
    <div className="flex flex-col items-center">
      {/* Enhanced Power Indicator */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center mb-3">
          <motion.div
            animate={{
              scale: isGlowing ? [1, 1.2, 1] : 1,
              rotate: isGlowing ? [0, 360] : 0
            }}
            transition={{
              duration: 2,
              repeat: isGlowing ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            <Zap className={`w-6 h-6 mr-3 ${isGlowing ? 'text-yellow-400' : 'text-gray-400'}`} />
          </motion.div>
          <span className={`text-lg font-bold ${isGlowing ? 'text-yellow-400' : 'text-gray-300'}`}>
            POWER: {correctConnections}/{totalConnections}
          </span>
        </div>
        
        {/* Enhanced Progress Bar */}
        <div className="relative w-40 h-3 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
          <motion.div
            className={`h-full rounded-full transition-all duration-500 ${
              isGlowing 
                ? 'bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500' 
                : 'bg-gradient-to-r from-blue-500 to-cyan-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          
          {/* Progress bar glow effect */}
          {isGlowing && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ width: `${progressPercentage}%` }}
            />
          )}
        </div>

        {/* Progress percentage */}
        <div className="mt-2">
          <span className={`text-sm font-semibold ${isGlowing ? 'text-yellow-300' : 'text-gray-400'}`}>
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
      </div>

      {/* Game Asset Bulb with Enhanced Effects */}
      <motion.div
        animate={{
          scale: isGlowing ? [1, 1.08, 1] : 1,
          rotate: isGlowing ? [0, 3, -3, 0] : 0,
        }}
        transition={{
          duration: 2.5,
          repeat: isGlowing ? Infinity : 0,
          ease: "easeInOut"
        }}
        className="relative w-32 h-32"
      >
        <Image
          src={isGlowing ? bulbGlowing : bulbOff}
          alt={isGlowing ? "Glowing bulb" : "Off bulb"}
          width={128}
          height={128}
          className="object-contain drop-shadow-lg"
          priority
        />
        
        {/* Enhanced Glow Effect */}
        {isGlowing && (
          <>
            <motion.div
              animate={{
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.4, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-yellow-400 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                opacity: [0.1, 0.4, 0.1],
                scale: [1.2, 1.8, 1.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-yellow-300 rounded-full blur-2xl"
            />
          </>
        )}

        {/* Enhanced Sparkle Effects */}
        {isGlowing && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 bg-yellow-200 rounded-full"
                style={{
                  top: `${15 + Math.random() * 70}%`,
                  left: `${15 + Math.random() * 70}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
              />
            ))}

            {/* Floating sparkles around bulb */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`float-${i}`}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{
                  top: `${-20 + Math.random() * 140}%`,
                  left: `${-20 + Math.random() * 140}%`,
                }}
                animate={{
                  y: [-20, -40, -20],
                  x: [0, Math.random() * 20 - 10, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut"
                }}
              />
            ))}
          </>
        )}

        {/* Power indicator ring */}
        <motion.div
          className={`absolute inset-0 rounded-full border-2 ${
            isGlowing ? 'border-yellow-300' : 'border-gray-600'
          }`}
          animate={isGlowing ? {
            rotate: [0, 360],
            borderColor: ['#fde047', '#facc15', '#fde047']
          } : {}}
          transition={{ duration: 4, repeat: isGlowing ? Infinity : 0, ease: "linear" }}
        />
      </motion.div>
      
      {/* Enhanced Status Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 text-center"
      >
        <motion.p 
          className={`text-xl font-bold transition-all duration-500 ${
            isGlowing ? 'text-yellow-400' : 'text-gray-300'
          }`}
          animate={isGlowing ? {
            textShadow: [
              "0 0 20px rgba(250, 204, 21, 0.8)",
              "0 0 40px rgba(250, 204, 21, 0.4)",
              "0 0 20px rgba(250, 204, 21, 0.8)"
            ]
          } : {}}
          transition={{ duration: 2, repeat: isGlowing ? Infinity : 0 }}
        >
          {isGlowing ? '🎉 Circuit Complete! 🎉' : 'Connect all wires correctly'}
        </motion.p>

        {!isGlowing && correctConnections > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3"
          >
            <div className="bg-blue-900/30 backdrop-blur-sm px-4 py-2 rounded-full inline-block border border-blue-500/30">
              <p className="text-sm text-blue-300 font-semibold">
                ⚡ {correctConnections} of {totalConnections} connections correct
              </p>
            </div>
          </motion.div>
        )}

        {isGlowing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-3"
          >
            <div className="bg-yellow-900/30 backdrop-blur-sm px-4 py-2 rounded-full inline-block border border-yellow-400/30">
              <p className="text-sm text-yellow-200 font-semibold">
                ✨ All systems powered! Energy flowing perfectly! ✨
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}