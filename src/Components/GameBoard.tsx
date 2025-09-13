'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Play, Trophy, Clock, Heart, Zap, Settings, Lightbulb, Power } from 'lucide-react';
import Wire from './Wire';
import Socket from './Socket';
import Bulb from './Bulb';
import ConnectionWire from './ConnectionWire';
import { Question, WireConnection, MousePosition } from '@/types/game';

// Game Questions - Circuit/Electronics themed
const gameQuestions: Question[] = [
  {
    id: 1,
    question: "What component limits current flow?",
    answer: "Resistor",
    category: "Electronics",
    points: 100
  },
  {
    id: 2,
    question: "What stores electrical energy temporarily?",
    answer: "Capacitor",
    category: "Electronics", 
    points: 100
  },
  {
    id: 3,
    question: "What converts AC to DC?",
    answer: "Diode",
    category: "Electronics",
    points: 100
  },
  {
    id: 4,
    question: "What amplifies electrical signals?",
    answer: "Transistor",
    category: "Electronics",
    points: 100
  }
];

const wireColors = ['#ff4757', '#2ed573', '#1e90ff', '#ffa502'];

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function CircuitCrackGame() {
  // Game State
  const [questions] = useState<Question[]>(gameQuestions);
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]);
  const [connections, setConnections] = useState<WireConnection[]>([]);
  
  // Game Progress
  const [isComplete, setIsComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [currentScore, setCurrentScore] = useState(0);
  const [lives, setLives] = useState(3);
  
  // UI States
  const [showInstructions, setShowInstructions] = useState(true);
  const [showVictory, setShowVictory] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Position tracking
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [draggingWireId, setDraggingWireId] = useState<number | null>(null);
  const [wirePositions, setWirePositions] = useState(new Map());
  const [socketPositions, setSocketPositions] = useState(new Map());

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize game
  const initializeGame = useCallback(() => {
    const initialConnections = questions.map(q => ({ 
      wireId: q.id, 
      socketId: null 
    }));
    
    setConnections(initialConnections);
    setShuffledAnswers(shuffleArray(questions.map(q => q.answer)));
    setTimeLeft(300);
    setLives(3);
    setCurrentScore(0);
    setIsComplete(false);
    setShowVictory(false);
    setGameStarted(false);
    setWirePositions(new Map());
    setSocketPositions(new Map());
    setDraggingWireId(null);
  }, [questions]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Timer
  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !isComplete) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted && !isComplete) {
      setGameStarted(false);
      alert("Circuit timeout! Try again.");
    }
  }, [gameStarted, timeLeft, isComplete]);

  // Mouse tracking for drag - Fixed event handling
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingWireId !== null) {
        e.preventDefault();
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (draggingWireId !== null) {
        e.preventDefault();
        setDraggingWireId(null);
      }
    };
    
    if (draggingWireId !== null) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp, { passive: false });
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingWireId]);

  // Prevent default drag behavior
  useEffect(() => {
    const preventDefaultDrag = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener('dragstart', preventDefaultDrag);
    document.addEventListener('dragover', preventDefaultDrag);
    document.addEventListener('drop', preventDefaultDrag);

    return () => {
      document.removeEventListener('dragstart', preventDefaultDrag);
      document.removeEventListener('dragover', preventDefaultDrag);
      document.removeEventListener('drop', preventDefaultDrag);
    };
  }, []);

  const startGame = () => {
    setShowInstructions(false);
    setGameStarted(true);
  };

  const resetGame = () => {
    initializeGame();
    setShowInstructions(true);
  };

  const handleWirePositionUpdate = useCallback((wireId: number, position: MousePosition) => {
    setWirePositions(prev => new Map(prev.set(wireId, position)));
  }, []);

  const handleWireDragStart = useCallback((wireId: number, startPos: MousePosition) => {
    if (!gameStarted) {
      startGame();
    }
    setDraggingWireId(wireId);
    setMousePosition(startPos);
  }, [gameStarted]);

  const handleWireConnection = useCallback((wireId: number, socketId: number | null) => {
    setDraggingWireId(null);
    
    setConnections(prev => {
      const clearedConnections = prev.map(conn => 
        conn.socketId === socketId ? { ...conn, socketId: null } : conn
      );
      
      const newConnections = clearedConnections.map(conn => 
        conn.wireId === wireId ? { ...conn, socketId } : conn
      );
      
      return newConnections;
    });

    if (socketId !== null) {
      const question = questions.find(q => q.id === wireId);
      const isCorrect = question && shuffledAnswers[socketId - 1] === question.answer;
      
      if (isCorrect) {
        setCurrentScore(prev => prev + (question?.points || 0));
      } else {
        setLives(prev => Math.max(0, prev - 1));
        
        if (lives <= 1) {
          setGameStarted(false);
          setTimeout(() => alert("Circuit failed! No power remaining."), 100);
        }
      }
    }
  }, [questions, shuffledAnswers, lives]);

  const handleSocketPositionUpdate = useCallback((socketId: number, position: MousePosition) => {
    setSocketPositions(prev => new Map(prev.set(socketId, position)));
  }, []);

  const handleDisconnection = useCallback((wireId: number) => {
    setConnections(prev => prev.map(conn => 
      conn.wireId === wireId ? { ...conn, socketId: null } : conn
    ));
  }, []);

  // Get correct connections count
  const getCorrectConnections = useCallback(() => {
    if (!shuffledAnswers.length) return 0;
    
    return connections.filter(conn => {
      if (conn.socketId === null) return false;
      const question = questions.find(q => q.id === conn.wireId);
      return question && shuffledAnswers[conn.socketId - 1] === question.answer;
    }).length;
  }, [connections, shuffledAnswers, questions]);

  // Check for completion
  const checkCompletion = useCallback(() => {
    if (!shuffledAnswers.length || isComplete) return;
    
    const allConnected = connections.every(conn => conn.socketId !== null);
    
    if (allConnected) {
      const allCorrect = connections.every(conn => {
        const question = questions.find(q => q.id === conn.wireId);
        return question && conn.socketId !== null && shuffledAnswers[conn.socketId - 1] === question.answer;
      });
      
      if (allCorrect) {
        setIsComplete(true);
        setGameStarted(false);
        setTimeout(() => setShowVictory(true), 1000);
      }
    }
  }, [connections, shuffledAnswers, questions, isComplete]);

  useEffect(() => {
    if (gameStarted && shuffledAnswers.length > 0) {
      checkCompletion();
    }
  }, [connections, gameStarted, shuffledAnswers.length, checkCompletion]);

  const correctConnections = getCorrectConnections();

  return (
    <div className="h-screen overflow-hidden relative select-none" style={{
      background: `
        linear-gradient(135deg, #2c5530 0%, #1a3a1f 25%, #0f2415 50%, #1a3a1f 75%, #2c5530 100%),
        radial-gradient(circle at 20% 20%, rgba(52, 211, 153, 0.03) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(34, 197, 94, 0.03) 0%, transparent 50%)
      `
    }}>
      {/* Reset Button - Top Right Corner */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={resetGame}
        className="fixed top-4 right-4 z-40 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-bold shadow-lg transform hover:scale-105 border border-red-500 font-mono"
        style={{ pointerEvents: 'auto' }}
      >
        <RotateCcw className="w-4 h-4 inline mr-1" />
        RESET
      </motion.button>

      {/* Detailed PCB Background Pattern */}
      <div className="absolute inset-0 opacity-40" style={{ pointerEvents: 'none' }}>
        <svg className="w-full h-full">
          <defs>
            {/* PCB Trace Pattern */}
            <pattern id="pcb-main" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <rect width="120" height="120" fill="none"/>
              
              {/* Main Traces */}
              <path d="M0 60 L120 60" stroke="#d4af37" strokeWidth="2" opacity="0.6"/>
              <path d="M60 0 L60 120" stroke="#d4af37" strokeWidth="2" opacity="0.6"/>
              
              {/* Secondary Traces */}
              <path d="M20 20 L100 20 L100 100 L20 100 Z" stroke="#d4af37" strokeWidth="1" fill="none" opacity="0.4"/>
              <path d="M30 30 L90 30 L90 90 L30 90 Z" stroke="#c9b037" strokeWidth="0.8" fill="none" opacity="0.3"/>
              
              {/* Component Pads */}
              <circle cx="30" cy="30" r="3" fill="#d4af37" opacity="0.7"/>
              <circle cx="90" cy="30" r="3" fill="#d4af37" opacity="0.7"/>
              <circle cx="30" cy="90" r="3" fill="#d4af37" opacity="0.7"/>
              <circle cx="90" cy="90" r="3" fill="#d4af37" opacity="0.7"/>
              <circle cx="60" cy="60" r="4" fill="#d4af37" opacity="0.8"/>
              
              {/* Via Holes */}
              <circle cx="30" cy="30" r="1" fill="#0f2415"/>
              <circle cx="90" cy="30" r="1" fill="#0f2415"/>
              <circle cx="30" cy="90" r="1" fill="#0f2415"/>
              <circle cx="90" cy="90" r="1" fill="#0f2415"/>
              <circle cx="60" cy="60" r="1.5" fill="#0f2415"/>
              
              {/* Resistor Patterns */}
              <rect x="40" y="58" width="12" height="4" fill="none" stroke="#d4af37" strokeWidth="0.5" opacity="0.5"/>
              <rect x="68" y="58" width="12" height="4" fill="none" stroke="#d4af37" strokeWidth="0.5" opacity="0.5"/>
              
              {/* IC Patterns */}
              <rect x="45" y="40" width="30" height="20" fill="none" stroke="#d4af37" strokeWidth="0.8" opacity="0.4"/>
              <circle cx="48" cy="43" r="0.8" fill="#d4af37" opacity="0.6"/>
              <circle cx="52" cy="43" r="0.8" fill="#d4af37" opacity="0.6"/>
              <circle cx="56" cy="43" r="0.8" fill="#d4af37" opacity="0.6"/>
              <circle cx="60" cy="43" r="0.8" fill="#d4af37" opacity="0.6"/>
              <circle cx="64" cy="43" r="0.8" fill="#d4af37" opacity="0.6"/>
              <circle cx="68" cy="43" r="0.8" fill="#d4af37" opacity="0.6"/>
              <circle cx="72" cy="43" r="0.8" fill="#d4af37" opacity="0.6"/>
              
              <circle cx="48" cy="57" r="0.8" fill="#d4af37" opacity="0.6"/>
              <circle cx="52" cy="57" r="0.8" fill="#d4af37" opacity="0.6"/>
              <circle cx="56" cy="57" r="0.8" fill="#d4af37" opacity="0.6"/>
              <circle cx="60" cy="57" r="0.8" fill="#d4af37" opacity="0.6"/>
              <circle cx="64" cy="57" r="0.8" fill="#d4af37" opacity="0.6"/>
              <circle cx="68" cy="57" r="0.8" fill="#d4af37" opacity="0.6"/>
              <circle cx="72" cy="57" r="0.8" fill="#d4af37" opacity="0.6"/>
            </pattern>

            {/* Fine Grid Pattern */}
            <pattern id="pcb-grid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="none"/>
              <path d="M0 0 L10 0 L10 10 L0 10 Z" stroke="#1f5f32" strokeWidth="0.2" opacity="0.3"/>
            </pattern>

            {/* Component Silkscreen */}
            <pattern id="silkscreen" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <rect width="80" height="80" fill="none"/>
              <text x="40" y="20" textAnchor="middle" fontSize="6" fill="#e5e7eb" opacity="0.4">R1</text>
              <text x="20" y="40" textAnchor="middle" fontSize="6" fill="#e5e7eb" opacity="0.4">C1</text>
              <text x="60" y="40" textAnchor="middle" fontSize="6" fill="#e5e7eb" opacity="0.4">U1</text>
              <text x="40" y="60" textAnchor="middle" fontSize="6" fill="#e5e7eb" opacity="0.4">Q1</text>
            </pattern>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#pcb-grid)"/>
          <rect width="100%" height="100%" fill="url(#pcb-main)"/>
          <rect width="100%" height="100%" fill="url(#silkscreen)"/>
        </svg>
      </div>

      {/* Electronic Components Scattered Around */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gauges and Meters */}
        <div className="absolute top-8 left-8 w-16 h-16 rounded-full border-4 border-yellow-500/60 bg-black/40">
          <div className="absolute inset-2 rounded-full border border-yellow-400/40"></div>
          <div className="absolute top-1/2 left-1/2 w-1 h-6 bg-yellow-400 transform -translate-x-1/2 -translate-y-1/2 origin-bottom rotate-45"></div>
        </div>
        
        <div className="absolute bottom-8 right-8 w-16 h-16 rounded-full border-4 border-red-500/60 bg-black/40">
          <div className="absolute inset-2 rounded-full border border-red-400/40"></div>
          <div className="absolute top-1/2 left-1/2 w-1 h-6 bg-red-400 transform -translate-x-1/2 -translate-y-1/2 origin-bottom -rotate-12"></div>
        </div>
      </div>

      <div className="h-full flex flex-col p-4 relative z-10">
        {/* Header with Circuit Theme */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <h1 className="text-3xl font-bold text-amber-300 mb-2 flex items-center justify-center font-mono">
            <Zap className="w-8 h-8 mr-3 text-yellow-400" />
            CRACK THE CIRCUIT
            <Zap className="w-8 h-8 ml-3 text-yellow-400" />
          </h1>
          <p className="text-amber-200/80 text-sm font-mono">Match components to complete the electronic circuit</p>
        </motion.div>

        {/* Bulb positioned below title - No percentage display */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Bulb 
              correctConnections={correctConnections}
              totalConnections={questions.length}
              isComplete={isComplete}
            />
          </div>
        </div>

        {/* Game Stats */}
        {gameStarted && (
          <motion.div 
            className="flex justify-center gap-4 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg text-amber-300 text-sm font-bold border-2 border-yellow-600/40 font-mono">
              <Clock className="w-4 h-4 inline mr-2" />
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg text-amber-300 text-sm font-bold border-2 border-yellow-600/40 font-mono">
              <Trophy className="w-4 h-4 inline mr-2" />
              {currentScore}V
            </div>
            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg text-amber-300 text-sm font-bold border-2 border-yellow-600/40 font-mono">
              <Power className="w-4 h-4 inline mr-2 text-red-400" />
              {lives}
            </div>
          </motion.div>
        )}

        {/* Main PCB Board - Larger Size */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-7xl h-full max-h-[600px] relative"
          >
            {/* PCB Board Container - Bigger */}
            <div className="relative w-full h-full rounded-3xl border-4 border-yellow-600/80 shadow-2xl overflow-hidden"
              style={{
                background: `
                  linear-gradient(135deg, #064e3b 0%, #065f46 20%, #047857 40%, #059669 60%, #065f46 80%, #064e3b 100%)
                `,
                pointerEvents: 'auto'
              }}
            >
              {/* PCB Silkscreen Layer */}
              <div className="absolute inset-0 opacity-25" style={{ pointerEvents: 'none' }}>
                <svg className="w-full h-full">
                  <defs>
                    <pattern id="board-traces" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                      <rect width="60" height="60" fill="none"/>
                      <path d="M0 30 L60 30 M30 0 L30 60" stroke="#fbbf24" strokeWidth="1.5" opacity="0.8"/>
                      <path d="M15 15 L45 15 L45 45 L15 45 Z" stroke="#f59e0b" strokeWidth="1" fill="none" opacity="0.6"/>
                      <circle cx="30" cy="30" r="4" fill="#d97706" opacity="0.7"/>
                      <circle cx="30" cy="30" r="1.5" fill="#064e3b"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#board-traces)"/>
                </svg>
              </div>

              {/* Board Labels */}
              <div className="absolute top-4 left-4 bg-yellow-400 text-black px-4 py-2 rounded-md text-sm font-bold border border-yellow-600 font-mono" style={{ pointerEvents: 'none' }}>
                CIRCUIT-BOARD REV 2.1
              </div>

              <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded text-xs font-bold font-mono" style={{ pointerEvents: 'none' }}>
                HIGH VOLTAGE
              </div>

              {/* Power Status LEDs - No glow effects */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex space-x-2" style={{ pointerEvents: 'none' }}>
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full border-2 transition-all duration-500 ${
                      i < correctConnections 
                        ? 'bg-green-400 border-green-300' 
                        : 'bg-gray-700 border-gray-600'
                    }`}
                  />
                ))}
              </div>

              {/* Circuit Components - Larger spacing */}
              <div className="absolute inset-12 grid grid-cols-2 gap-16">
                {/* Left Side - Input Terminals */}
                <div className="flex flex-col justify-center space-y-8">
                  <div className="text-center mb-6" style={{ pointerEvents: 'none' }}>
                    <h3 className="text-yellow-300 font-bold text-xl bg-black/50 px-6 py-3 rounded-lg inline-block border border-yellow-600/40 font-mono">
                      INPUT PINS
                    </h3>
                  </div>
                  
                  {questions.map((question, index) => {
                    const connection = connections.find(c => c.wireId === question.id);
                    const isConnected = connection?.socketId !== null;
                    
                    return (
                      <div key={question.id} style={{ pointerEvents: 'auto' }}>
                        <Wire
                          id={question.id}
                          question={question.question}
                          category={question.category}
                          isConnected={isConnected}
                          isCorrect={null}
                          onDragStart={handleWireDragStart}
                          onDragEnd={handleWireConnection}
                          onPositionUpdate={handleWirePositionUpdate}
                          color={wireColors[index]}
                          isDraggingThis={draggingWireId === question.id}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Right Side - Output Sockets */}
                <div className="flex flex-col justify-center space-y-8">
                  <div className="text-center mb-6" style={{ pointerEvents: 'none' }}>
                    <h3 className="text-yellow-300 font-bold text-xl bg-black/50 px-6 py-3 rounded-lg inline-block border border-yellow-600/40 font-mono">
                      OUTPUT PINS
                    </h3>
                  </div>
                  
                  {shuffledAnswers.map((answer, index) => {
                    const socketId = index + 1;
                    const connection = connections.find(c => c.socketId === socketId);
                    const isConnected = connection !== undefined;
                    
                    let isCorrect = false;
                    if (isConnected && connection) {
                      const question = questions.find(q => q.id === connection.wireId);
                      isCorrect = question?.answer === answer;
                    }
                    
                    const wireColor = isConnected && connection
                      ? wireColors[questions.findIndex(q => q.id === connection.wireId)]
                      : undefined;

                    return (
                      <div key={`socket-${socketId}`} style={{ pointerEvents: 'auto' }}>
                        <Socket
                          id={socketId}
                          answer={answer}
                          isConnected={isConnected}
                          isCorrect={isCorrect}
                          wireColor={wireColor}
                          onPositionUpdate={handleSocketPositionUpdate}
                          onDisconnect={
                            isConnected && !isCorrect && connection 
                              ? () => handleDisconnection(connection.wireId) 
                              : undefined
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Connection Wires */}
            <div style={{ pointerEvents: 'none' }}>
              {draggingWireId !== null && wirePositions.has(draggingWireId) && (
                <ConnectionWire
                  startPos={wirePositions.get(draggingWireId)!}
                  endPos={mousePosition}
                  color={wireColors[questions.findIndex(q => q.id === draggingWireId)]}
                  isConnected={false}
                />
              )}

              {connections.map(conn => {
                if (conn.socketId === null) return null;
                const wirePos = wirePositions.get(conn.wireId);
                const socketPos = socketPositions.get(conn.socketId);
                if (!wirePos || !socketPos) return null;
                
                const question = questions.find(q => q.id === conn.wireId);
                const isCorrect = question && shuffledAnswers[conn.socketId - 1] === question.answer;
                
                return (
                  <ConnectionWire
                    key={`connection-${conn.wireId}-${conn.socketId}`}
                    startPos={wirePos}
                    endPos={socketPos}
                    color={wireColors[questions.findIndex(q => q.id === conn.wireId)]}
                    isConnected={true}
                    isCorrect={isCorrect}
                  />
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Instructions Modal */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-8 max-w-lg w-full shadow-2xl border-2 border-yellow-600/60">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                  <Lightbulb className="w-8 h-8 text-black" />
                </div>
                <h2 className="text-2xl font-bold text-yellow-300 mb-2 font-mono">CRACK THE CIRCUIT</h2>
                <p className="text-yellow-200 text-sm font-mono">Complete the electronic circuit!</p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-black/40 p-4 rounded-lg border border-yellow-600/40">
                  <h3 className="font-bold text-yellow-300 mb-2 text-sm font-mono">OBJECTIVE</h3>
                  <p className="text-xs text-yellow-200 font-mono">Connect each component question to its correct answer socket. The bulb will show power level!</p>
                </div>
                
                <div className="bg-black/40 p-4 rounded-lg border border-yellow-600/40">
                  <h3 className="font-bold text-yellow-300 mb-2 text-sm font-mono">RULES</h3>
                  <p className="text-xs text-yellow-200 font-mono">• Wrong connections can be disconnected<br/>• Correct connections are permanent<br/>• You have 3 power units</p>
                </div>
              </div>
              
              <button
                onClick={startGame}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 text-black py-3 rounded-lg hover:from-yellow-700 hover:to-yellow-800 transition-all font-bold text-sm border border-yellow-500 font-mono"
              >
                <Play className="w-4 h-4 inline mr-2" />
                POWER ON
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Victory Modal */}
      <AnimatePresence>
        {showVictory && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-xl p-8 text-center text-white shadow-2xl max-w-md w-full border-2 border-yellow-400"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(34, 197, 94, 0.8)",
                  "0 0 0 25px rgba(34, 197, 94, 0)",
                  "0 0 0 0 rgba(34, 197, 94, 0)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Lightbulb className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
              <h2 className="text-3xl font-bold mb-4 font-mono">CIRCUIT COMPLETE!</h2>
              
              <div className="bg-white/20 rounded-lg p-4 mb-6 backdrop-blur-sm border border-white/30">
                <p className="text-lg font-semibold font-mono">All connections successful!</p>
                <p className="text-sm text-green-100 font-mono">System fully powered</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-6 text-sm font-mono">
                <div className="bg-white/20 rounded-lg p-3 border border-white/30">
                  <p className="font-bold">{currentScore}V</p>
                  <p className="text-xs">VOLTAGE</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3 border border-white/30">
                  <p className="font-bold">{Math.floor((300 - timeLeft) / 60)}:{((300 - timeLeft) % 60).toString().padStart(2, '0')}</p>
                  <p className="text-xs">TIME</p>
                </div>
              </div>
              
              <button
                onClick={resetGame}
                className="w-full bg-white text-green-600 py-3 rounded-lg hover:bg-gray-100 transition-all font-bold text-sm transform hover:scale-105 font-mono"
              >
                RESTART CIRCUIT
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
