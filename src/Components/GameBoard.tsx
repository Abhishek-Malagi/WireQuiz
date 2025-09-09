'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Play, Trophy, Clock, Zap, Star, MapPin, User, Book } from 'lucide-react';
import Wire from './Wire';
import Socket from './Socket';
import Bulb from './Bulb';
import ConnectionWire from './ConnectionWire';

// Game Scenario Types
interface GameScenario {
  id: number;
  title: string;
  location: string;
  story: string;
  objective: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  background: string;
  character: string;
  questions: Question[];
  unlocked: boolean;
  completed: boolean;
  stars: number;
}

interface Question {
  id: number;
  question: string;
  answer: string;
  category: string;
  contextHint?: string;
  storyRelevance: string;
  points: number;
}

interface WireConnection {
  wireId: number;
  socketId: number | null;
}

// Game scenarios
const gameScenarios: GameScenario[] = [
  {
    id: 1,
    title: "Grandma's Birthday",
    location: "Cozy Family Home",
    story: "Help restore power for Grandma's 75th birthday party!",
    objective: "Light up the birthday celebration!",
    difficulty: 'easy',
    timeLimit: 300,
    background: "cozy-house",
    character: "grandma",
    unlocked: true,
    completed: false,
    stars: 0,
    questions: [
      {
        id: 1,
        question: "What bakes birthday cakes?",
        answer: "Oven",
        category: "Kitchen",
        contextHint: "Grandma needs this appliance",
        storyRelevance: "Essential for the party",
        points: 100
      },
      {
        id: 2,
        question: "Grandma's age today?",
        answer: "75",
        category: "Math",
        contextHint: "Birthday candles needed",
        storyRelevance: "Celebration milestone",
        points: 100
      },
      {
        id: 3,
        question: "Hot wire color?",
        answer: "Black",
        category: "Safety",
        contextHint: "Electrical wire identification",
        storyRelevance: "Fixing the power",
        points: 100
      },
      {
        id: 4,
        question: "Turn off first for safety?",
        answer: "Breaker",
        category: "Safety",
        contextHint: "Safety comes first",
        storyRelevance: "Safe repair",
        points: 100
      }
    ]
  }
];

const characters = {
  grandma: {
    name: "Grandma Rose",
    avatar: "👵",
    role: "Birthday Celebrant",
    dialogue: [
      "Oh dear! The power went out before my party!",
      "Can you help me get the lights back on?",
      "The guests will be here soon!",
      "Thank you! Now I can celebrate properly!"
    ]
  }
};

const shuffleAnswers = (questions: Question[]): string[] => {
  const answers = questions.map(q => q.answer);
  const shuffled = [...answers];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const wireColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FECA57'];

// Fixed background particles - consistent positions to avoid hydration mismatch
const backgroundParticles = [
  { left: 10, top: 20 },
  { left: 25, top: 40 },
  { left: 40, top: 15 },
  { left: 55, top: 35 },
  { left: 70, top: 25 },
  { left: 85, top: 45 },
  { left: 15, top: 60 },
  { left: 30, top: 80 },
  { left: 45, top: 65 },
  { left: 60, top: 85 },
  { left: 75, top: 70 },
  { left: 90, top: 90 },
  { left: 20, top: 10 },
  { left: 35, top: 30 },
  { left: 50, top: 50 },
  { left: 65, top: 75 },
  { left: 80, top: 55 },
  { left: 95, top: 30 },
  { left: 5, top: 85 },
  { left: 50, top: 5 }
];

export default function GameBoard() {
  // Game State
  const [currentScenario, setCurrentScenario] = useState<GameScenario>(gameScenarios[0]);
  const [connections, setConnections] = useState<WireConnection[]>([]);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);
  
  // Game Progress
  const [isComplete, setIsComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [currentScore, setCurrentScore] = useState(0);
  const [lives, setLives] = useState(3);
  
  // UI States
  const [showInstructions, setShowInstructions] = useState(true);
  const [showMissionComplete, setShowMissionComplete] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Position tracking
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [draggingWireId, setDraggingWireId] = useState<number | null>(null);
  const [wirePositions, setWirePositions] = useState(new Map());
  const [socketPositions, setSocketPositions] = useState(new Map());

  // Fix hydration by only showing animations on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize game state
  const initializeGame = useCallback(() => {
    console.log('Initializing game...');
    const initialConnections = currentScenario.questions.map(q => ({ 
      wireId: q.id, 
      socketId: null 
    }));
    
    setConnections(initialConnections);
    setShuffledAnswers(shuffleAnswers(currentScenario.questions));
    setTimeLeft(currentScenario.timeLimit);
    setLives(3);
    setCurrentScore(0);
    setIsComplete(false);
    setShowMissionComplete(false);
    setGameStarted(false);
    setWirePositions(new Map());
    setSocketPositions(new Map());
    
    console.log('Game initialized with connections:', initialConnections);
  }, [currentScenario]);

  // Initialize on component mount and scenario change
  useEffect(() => {
    initializeGame();
  }, [currentScenario, initializeGame]);

  // Timer countdown
  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !isComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted && !isComplete) {
      setGameStarted(false);
      alert("Time's up! Try again.");
    }
  }, [gameStarted, timeLeft, isComplete]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    if (draggingWireId !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [draggingWireId]);

  const startGame = () => {
    console.log('Starting game...');
    setShowInstructions(false);
    setGameStarted(true);
    setStartTime(Date.now());
  };

  const resetGame = () => {
    console.log('Resetting game...');
    initializeGame();
    setShowInstructions(true);
  };

  const handleWirePositionUpdate = useCallback((wireId: number, position: any) => {
    setWirePositions(prev => new Map(prev.set(wireId, position)));
  }, []);

  const handleWireDragStart = useCallback((wireId: number, startPos: any) => {
    if (!gameStarted) {
      startGame();
    }
    setDraggingWireId(wireId);
  }, [gameStarted]);

  const handleWireConnection = useCallback((wireId: number, socketId: number | null) => {
    console.log(`Connecting wire ${wireId} to socket ${socketId}`);
    setDraggingWireId(null);
    
    // Clear any existing connection to this socket first
    setConnections(prev => {
      const clearedConnections = prev.map(conn => 
        conn.socketId === socketId ? { ...conn, socketId: null } : conn
      );
      
      // Then set the new connection
      const newConnections = clearedConnections.map(conn => 
        conn.wireId === wireId ? { ...conn, socketId } : conn
      );
      
      console.log('Updated connections:', newConnections);
      return newConnections;
    });

    // Check if connection is correct and update score/effects
    if (socketId !== null) {
      const question = currentScenario.questions.find(q => q.id === wireId);
      const isCorrect = question && shuffledAnswers[socketId - 1] === question.answer;
      
      if (isCorrect) {
        setCurrentScore(prev => prev + (question?.points || 0));
        triggerSuccessEffect();
        console.log('Correct connection!');
      } else {
        setLives(prev => Math.max(0, prev - 1));
        triggerErrorEffect();
        console.log('Incorrect connection!');
        
        if (lives <= 1) {
          setGameStarted(false);
          alert("No lives left! Try again.");
        }
      }
    }
  }, [currentScenario.questions, shuffledAnswers, lives]);

  const handleSocketPositionUpdate = useCallback((socketId: number, position: any) => {
    setSocketPositions(prev => new Map(prev.set(socketId, position)));
  }, []);

  const triggerSuccessEffect = () => {
    if (isClient) {
      document.body.style.animation = 'shake 0.3s ease-in-out';
      setTimeout(() => { document.body.style.animation = ''; }, 300);
    }
  };

  const triggerErrorEffect = () => {
    if (isClient) {
      document.body.style.filter = 'hue-rotate(0deg) brightness(1.2)';
      setTimeout(() => { document.body.style.filter = ''; }, 200);
    }
  };

  // Get correct connections count for progressive bulb lighting
  const getCorrectConnections = useCallback(() => {
    if (!shuffledAnswers.length) return 0;
    
    return connections.filter(conn => {
      if (conn.socketId === null) return false;
      const question = currentScenario.questions.find(q => q.id === conn.wireId);
      return question && shuffledAnswers[conn.socketId - 1] === question.answer;
    }).length;
  }, [connections, shuffledAnswers, currentScenario.questions]);

  // Check for game completion
  const checkMissionComplete = useCallback(() => {
    if (!shuffledAnswers.length || isComplete) return;
    
    // Check if all wires are connected
    const allConnected = connections.every(conn => conn.socketId !== null);
    
    if (allConnected) {
      // Check if all connections are correct
      const allCorrect = connections.every(conn => {
        const question = currentScenario.questions.find(q => q.id === conn.wireId);
        return question && conn.socketId !== null && shuffledAnswers[conn.socketId - 1] === question.answer;
      });
      
      console.log('All connected:', allConnected, 'All correct:', allCorrect);
      
      if (allCorrect) {
        console.log('Mission complete!');
        setIsComplete(true);
        setGameStarted(false);
        
        setTimeout(() => {
          setShowMissionComplete(true);
        }, 1500);
      }
    }
  }, [connections, shuffledAnswers, currentScenario.questions, isComplete]);

  // Run completion check when connections change
  useEffect(() => {
    if (gameStarted && shuffledAnswers.length > 0) {
      checkMissionComplete();
    }
  }, [connections, gameStarted, shuffledAnswers.length, checkMissionComplete]);

  const correctConnections = getCorrectConnections();
  const progressPercentage = currentScenario.questions.length > 0 
    ? (correctConnections / currentScenario.questions.length) * 100 
    : 0;

  console.log('Render state:', { 
    connectionsLength: connections.length, 
    correctConnections, 
    progressPercentage, 
    isComplete,
    gameStarted,
    showInstructions,
    showMissionComplete 
  });

  return (
    <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6 overflow-hidden">
      {/* Custom Styles for SVG Light Bulb */}
      <style jsx>{`
        @keyframes bulbGlow {
          0%, 100% { 
            filter: drop-shadow(0 0 2px #FFD700) drop-shadow(0 0 4px #FFA500);
          }
          50% { 
            filter: drop-shadow(0 0 8px #FFD700) drop-shadow(0 0 16px #FFA500) drop-shadow(0 0 24px #FF8C00);
          }
        }
        
        .bulb-container {
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 50;
          width: 48px;
          height: 48px;
        }
        
        .bulb-svg {
          width: 100%;
          height: 100%;
          transition: all 0.3s ease-in-out;
        }
        
        .bulb-off {
          fill: #666666;
          filter: drop-shadow(0 0 1px rgba(102, 102, 102, 0.3));
        }
        
        .bulb-glow-1 {
          fill: #FFD700;
          filter: drop-shadow(0 0 2px #FFD700) drop-shadow(0 0 4px #FFA500);
        }
        
        .bulb-glow-2 {
          fill: #FFD700;
          filter: drop-shadow(0 0 4px #FFD700) drop-shadow(0 0 8px #FFA500);
        }
        
        .bulb-glow-3 {
          fill: #FFD700;
          filter: drop-shadow(0 0 6px #FFD700) drop-shadow(0 0 12px #FFA500) drop-shadow(0 0 18px #FF8C00);
        }
        
        .bulb-full-glow {
          fill: #FFD700;
          animation: bulbGlow 1.5s infinite alternate;
        }
      `}</style>

      {/* Fixed Background Effects - Only render on client to avoid hydration mismatch */}
      {isClient && (
        <div className="absolute inset-0 overflow-hidden" suppressHydrationWarning>
          {backgroundParticles.map((particle, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
              }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{
                duration: 3 + (i % 3),
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      )}

      <div className="h-full max-w-7xl mx-auto relative z-10 flex flex-col">
        {/* Top Header - Compact */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
            ⚡ {currentScenario.title} ⚡
          </h1>
          <p className="text-white/80 text-sm">{currentScenario.story}</p>
        </motion.div>

        {/* Compact Stats Bar */}
        {gameStarted && (
          <motion.div 
            className="flex justify-center gap-3 mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm font-semibold">
              <Clock className="w-3 h-3 inline mr-1" />
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm font-semibold">
              <Trophy className="w-3 h-3 inline mr-1" />
              {currentScore.toLocaleString()}
            </div>
            <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-sm font-semibold">
              ❤️ {lives}
            </div>
          </motion.div>
        )}

        {/* Main Game Area - Single Frame Layout */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-6xl relative">

            {/* Circuit Box Container with SVG Light Bulb on Top Border */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-3xl p-8 pt-12 border-4 border-yellow-400/50 shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%)',
                boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5), 0 0 100px rgba(59, 130, 246, 0.3)'
              }}
            >
              {/* SVG Light Bulb - Positioned exactly on top border */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bulb-container"
              >
                <div className="bg-gray-800/80 backdrop-blur-xl rounded-full p-2 border-2 border-yellow-400/60 shadow-xl">
                  <SVGLightBulb 
                    correctConnections={correctConnections}
                    totalConnections={currentScenario.questions.length}
                    isComplete={isComplete}
                  />
                </div>
              </motion.div>

              {/* Circuit Board Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full">
                  <defs>
                    <pattern id="circuit" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M0 20 L40 20 M20 0 L20 40" stroke="#60a5fa" strokeWidth="1" fill="none"/>
                      <circle cx="20" cy="20" r="3" fill="#60a5fa"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#circuit)"/>
                </svg>
              </div>

              {/* Circuit Box Label */}
              <div className="absolute -top-3 left-8 bg-yellow-400 text-black px-4 py-1 rounded-full font-bold text-sm">
                POWER RESTORATION UNIT
              </div>

              <div className="grid grid-cols-2 gap-8 h-full relative z-10">
                {/* Left Side - Questions */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse" />
                    <h3 className="text-white font-bold text-lg">INPUT TERMINALS</h3>
                  </div>
                  
                  {currentScenario.questions.map((question, index) => {
                    const connection = connections.find(c => c.wireId === question.id);
                    return (
                      <CompactWire
                        key={question.id}
                        id={question.id}
                        question={question.question}
                        category={question.category}
                        isConnected={connection?.socketId !== null}
                        onDragStart={handleWireDragStart}
                        onDragEnd={handleWireConnection}
                        onPositionUpdate={handleWirePositionUpdate}
                        color={wireColors[index]}
                        mousePosition={mousePosition}
                        isDraggingThis={draggingWireId === question.id}
                      />
                    );
                  })}
                </motion.div>

                {/* Right Side - Answers */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse" />
                    <h3 className="text-white font-bold text-lg">OUTPUT SOCKETS</h3>
                  </div>
                  
                  {shuffledAnswers.map((answer, index) => {
                    const socketId = index + 1;
                    const connection = connections.find(c => c.socketId === socketId);
                    const isConnected = connection !== undefined;
                    const isCorrect = isConnected && (() => {
                      const question = currentScenario.questions.find(q => q.id === connection.wireId);
                      return question?.answer === answer;
                    })();
                    const wireColor = isConnected 
                      ? wireColors[currentScenario.questions.findIndex(q => q.id === connection.wireId)]
                      : undefined;

                    return (
                      <CompactSocket
                        key={`socket-${socketId}-${answer}`}
                        id={socketId}
                        answer={answer}
                        isConnected={isConnected}
                        isCorrect={isCorrect}
                        wireColor={wireColor}
                        onPositionUpdate={handleSocketPositionUpdate}
                      />
                    );
                  })}
                </motion.div>
              </div>

              {/* Center Circuit Indicators */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="grid grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((index) => (
                    <motion.div
                      key={index}
                      className={`w-6 h-6 rounded-full border-2 ${
                        index < correctConnections 
                          ? 'bg-green-400 border-green-300 shadow-lg shadow-green-400/50' 
                          : 'bg-gray-600 border-gray-500'
                      }`}
                      animate={index < correctConnections ? {
                        boxShadow: [
                          '0 0 10px rgba(34, 197, 94, 0.8)',
                          '0 0 20px rgba(34, 197, 94, 0.4)',
                          '0 0 10px rgba(34, 197, 94, 0.8)'
                        ]
                      } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Connection Wires */}
            {draggingWireId !== null && wirePositions.has(draggingWireId) && (
              <ConnectionWire
                startPos={wirePositions.get(draggingWireId)!}
                endPos={mousePosition}
                color={wireColors[currentScenario.questions.findIndex(q => q.id === draggingWireId)]}
                isConnected={false}
              />
            )}

            {connections.map(conn => {
              if (conn.socketId === null) return null;
              const wirePos = wirePositions.get(conn.wireId);
              const socketPos = socketPositions.get(conn.socketId);
              if (!wirePos || !socketPos) return null;
              
              return (
                <ConnectionWire
                  key={`connection-${conn.wireId}-${conn.socketId}`}
                  startPos={wirePos}
                  endPos={socketPos}
                  color={wireColors[currentScenario.questions.findIndex(q => q.id === conn.wireId)]}
                  isConnected={true}
                />
              );
            })}
          </div>
        </div>

        {/* Bottom Controls - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-4"
        >
          <button
            onClick={resetGame}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all font-semibold shadow-lg transform hover:scale-105 text-sm"
          >
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Reset Circuit
          </button>
        </motion.div>
      </div>

      {/* Instructions Modal */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Circuit Detective</h2>
                <p className="text-gray-600">Restore power by connecting the circuits!</p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h3 className="font-bold text-blue-800 mb-2">🎯 Mission</h3>
                  <p className="text-sm text-blue-700">Connect each question wire to its correct answer socket. Watch the bulb glow progressively with each correct connection!</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-xl">
                  <h3 className="font-bold text-green-800 mb-2">💡 Progressive Lighting</h3>
                  <p className="text-sm text-green-700">The bulb glows 25% brighter with each correct connection. Complete all 4 to fully power the circuit!</p>
                </div>
              </div>
              
              <button
                onClick={startGame}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-bold"
              >
                <Play className="w-5 h-5 inline mr-2" />
                Start Mission
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mission Complete Modal */}
      <AnimatePresence>
        {showMissionComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              className="bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 rounded-2xl p-8 text-center text-white shadow-2xl max-w-md w-full"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(34, 197, 94, 0.7)",
                  "0 0 0 20px rgba(34, 197, 94, 0)",
                  "0 0 0 0 rgba(34, 197, 94, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-6xl mb-4">👵</div>
              <h2 className="text-3xl font-bold mb-4">🎉 CIRCUIT RESTORED! 🎉</h2>
              
              <div className="bg-white/20 rounded-xl p-4 mb-6 backdrop-blur-sm">
                <p className="text-lg font-semibold">
                  "Thank you! Now I can celebrate my birthday properly!"
                </p>
                <p className="text-sm mt-2 text-green-100">- Grandma Rose</p>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="bg-white/20 rounded-lg p-2 backdrop-blur-sm">
                  <p className="font-bold">🏆 Score: {currentScore.toLocaleString()}</p>
                </div>
                <div className="bg-white/20 rounded-lg p-2 backdrop-blur-sm">
                  <p className="font-bold">⏱️ Time: {Math.floor((300 - timeLeft) / 60)}:{((300 - timeLeft) % 60).toString().padStart(2, '0')}</p>
                </div>
              </div>
              
              <button
                onClick={resetGame}
                className="w-full bg-white text-green-600 py-3 rounded-xl hover:bg-gray-100 transition-all font-bold transform hover:scale-105"
              >
                🚀 Play Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// SVG Light Bulb Component with Progressive Glow
interface SVGLightBulbProps {
  correctConnections: number;
  totalConnections: number;
  isComplete: boolean;
}

const SVGLightBulb = ({ correctConnections, totalConnections, isComplete }: SVGLightBulbProps) => {
  const getGlowClass = () => {
    if (isComplete) return 'bulb-full-glow';
    if (correctConnections === 0) return 'bulb-off';
    if (correctConnections === 1) return 'bulb-glow-1';
    if (correctConnections === 2) return 'bulb-glow-2';
    if (correctConnections >= 3) return 'bulb-glow-3';
    return 'bulb-off';
  };

  return (
    <div className="flex flex-col items-center">
      {/* SVG Light Bulb */}
      <motion.svg 
        className={`bulb-svg ${getGlowClass()}`}
        viewBox="0 0 24 24" 
        width="32" 
        height="32"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
        <path d="M9 21h6v1c0 .55-.45 1-1 1h-4c-.55 0-1-.45-1-1v-1z"/>
        <path d="M9 19h6v1H9v-1z"/>
        
        {/* Inner filament details for more realistic look */}
        <path d="M10.5 7.5L13.5 10.5M13.5 7.5L10.5 10.5" strokeWidth="0.5" stroke="currentColor" opacity="0.6"/>
        <circle cx="12" cy="9" r="0.5" opacity="0.4"/>
      </motion.svg>
      
      {/* Progress indicator */}
      <div className="mt-2 text-center">
        <p className={`text-xs font-bold transition-colors duration-300 ${
          correctConnections > 0 ? 'text-yellow-300' : 'text-gray-400'
        }`}>
          {correctConnections}/{totalConnections}
        </p>
      </div>
    </div>
  );
};

// Compact Wire Component (same as before)
interface CompactWireProps {
  id: number;
  question: string;
  category: string;
  isConnected: boolean;
  onDragStart: (wireId: number, startPos: any) => void;
  onDragEnd: (wireId: number, socketId: number | null) => void;
  onPositionUpdate: (wireId: number, position: any) => void;
  color: string;
  mousePosition: any;
  isDraggingThis: boolean;
}

const CompactWire = ({ id, question, category, isConnected, onDragStart, onDragEnd, onPositionUpdate, color, mousePosition, isDraggingThis }: CompactWireProps) => {
  const plugRef = useRef<HTMLDivElement>(null);
  const [plugPosition, setPlugPosition] = useState({ x: 0, y: 0 });

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
    const interval = setInterval(updatePlugPosition, 100);
    return () => clearInterval(interval);
  }, [id, onPositionUpdate]);

  return (
    <div className="flex items-center group">
      <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-3 mr-3 border border-white/20 relative">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-cyan-300 font-bold uppercase">{category}</span>
          <div 
            className="w-3 h-3 rounded-full shadow-lg border border-white/30" 
            style={{ backgroundColor: color }}
          />
        </div>
        <p className="text-white text-sm font-semibold">{question}</p>
        
        {isConnected && (
          <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        )}
      </div>
      
      <motion.div
        ref={plugRef}
        drag
        dragMomentum={false}
        dragElastic={0.1}
        onDragStart={() => onDragStart(id, plugPosition)}
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
        className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full cursor-grab flex items-center justify-center shadow-lg border-2 border-white/30"
        whileDrag={{ scale: 1.2, zIndex: 1000 }}
        whileHover={{ scale: 1.1 }}
        animate={isConnected && !isDraggingThis ? { x: 0, y: 0, scale: 1 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="w-2 h-2 bg-white rounded-full" />
        
        {isDraggingThis && (
          <motion.div
            className="absolute inset-0 border-2 border-dashed border-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
      </motion.div>
    </div>
  );
};

// Compact Socket Component (same as before)
interface CompactSocketProps {
  id: number;
  answer: string;
  isConnected: boolean;
  isCorrect: boolean;
  wireColor?: string;
  onPositionUpdate: (socketId: number, position: any) => void;
}

const CompactSocket = ({ id, answer, isConnected, isCorrect, wireColor, onPositionUpdate }: CompactSocketProps) => {
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
    <div className="flex items-center group">
      <motion.div
        ref={socketRef}
        className="socket-target w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full mr-3 cursor-pointer flex items-center justify-center shadow-lg border-2 border-white/30 relative"
        data-socket-id={id}
        whileHover={{ scale: 1.1 }}
        animate={isConnected ? {
          borderColor: isCorrect ? '#22c55e' : '#ef4444',
          boxShadow: isCorrect 
            ? '0 0 20px rgba(34, 197, 94, 0.6)' 
            : '0 0 20px rgba(239, 68, 68, 0.6)'
        } : {}}
      >
        <div className="w-3 h-1 bg-gray-800 rounded-full" />
        <div className="w-3 h-1 bg-gray-800 rounded-full ml-0.5" />
        
        {isConnected && wireColor && (
          <motion.div
            className="absolute inset-1 rounded-full opacity-40"
            style={{ backgroundColor: wireColor }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          />
        )}
        
        {isConnected && (
          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${
            isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {isCorrect ? '✓' : '✕'}
          </div>
        )}
      </motion.div>
      
      <div className={`flex-1 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 transition-all ${
        isConnected && isCorrect 
          ? 'bg-green-500/20 border-green-400' 
          : isConnected && !isCorrect 
          ? 'bg-red-500/20 border-red-400'
          : 'hover:bg-white/20'
      }`}>
        <div className="flex items-center justify-between">
          <p className="text-white text-sm font-semibold">{answer}</p>
          {isConnected && wireColor && (
            <div 
              className="w-3 h-3 rounded-full border border-white/50" 
              style={{ backgroundColor: wireColor }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
