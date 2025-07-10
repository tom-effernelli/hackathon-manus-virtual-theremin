import { useState, useCallback, useEffect, useRef } from 'react';
import HandTracker from './components/HandTracker';
import ThereminControls from './components/ThereminControls';
import { Button } from '@/components/ui/button.jsx';
import useTheremin from './hooks/useTheremin';
import './App.css';

function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [hands, setHands] = useState([]);
  const { 
    initializeAudio, 
    updateHand, 
    stopOscillator, 
    calculateFrequency, 
    calculateVolume,
    isInitialized 
  } = useTheremin();
  
  // Reference to track active hands
  const activeHandsRef = useRef(new Set());

  // Hand detection and theremin parameter calculation
  const handleHandDetection = useCallback((thereminData) => {
    const currentHands = new Set();
    const handsWithAudio = [];

    thereminData.forEach((hand) => {
      const handId = hand.handId;
      currentHands.add(handId);
      
      // Calculate frequency and volume
      const frequency = calculateFrequency(hand.x);
      const volume = calculateVolume(hand.z);
      
      // Update audio if initialized
      if (isInitialized) {
        updateHand(handId, frequency, volume);
      }
      
      // Add audio data for display
      handsWithAudio.push({
        ...hand,
        frequency,
        volume
      });
    });

    // Stop oscillators for hands that are no longer detected
    activeHandsRef.current.forEach(handId => {
      if (!currentHands.has(handId)) {
        stopOscillator(handId);
      }
    });

    // Update active hands reference
    activeHandsRef.current = currentHands;
    
    // Update state for display
    setHands(handsWithAudio);
  }, [calculateFrequency, calculateVolume, updateHand, stopOscillator, isInitialized]);

  const startApp = async () => {
    await initializeAudio();
    setIsStarted(true);
  };

  const stopApp = () => {
    // Stop all oscillators
    activeHandsRef.current.forEach(handId => {
      stopOscillator(handId);
    });
    activeHandsRef.current.clear();
    setHands([]);
    setIsStarted(false);
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      activeHandsRef.current.forEach(handId => {
        stopOscillator(handId);
      });
    };
  }, [stopOscillator]);

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center text-slate-100 max-w-md">
          <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Virtual Theremin
          </h1>
          <p className="text-xl mb-8 text-slate-300">
            Control music with your hands in space
          </p>
          <div className="space-y-4">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
              <h3 className="text-lg font-semibold text-slate-200 mb-3">How it works</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <p>• Move hands left-right to change pitch (200-2000 Hz)</p>
                <p>• Move hands closer-farther to control volume</p>
                <p>• Each hand produces a pure sine wave sound</p>
                <p>• Create harmonies with both hands</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              Please allow camera access when prompted
            </p>
            <Button 
              onClick={startApp}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Theremin
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
      <div className="container mx-auto px-6 py-6">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-slate-100 mb-4">
            Virtual Theremin
          </h1>
          <p className="text-slate-300">
            Move your hands to create music - Position controls pitch, distance controls volume
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <div className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg text-sm border border-emerald-500/30">
              Camera: Active
            </div>
            <div className={`px-4 py-2 rounded-lg text-sm border ${
              isInitialized 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              Audio: {isInitialized ? 'Ready' : 'Initializing...'}
            </div>
            <div className={`px-4 py-2 rounded-lg text-sm border ${
              hands.length > 0
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
            }`}>
              Hands detected: {hands.length}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Hand detection area - ENLARGED */}
          <div className="lg:col-span-3 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">
              Hand Detection
            </h2>
            <HandTracker onHandDetected={handleHandDetection} />
            <div className="mt-4 text-sm text-slate-400">
              <p className="font-medium text-slate-300 mb-2">Instructions:</p>
              <ul className="space-y-1">
                <li>• Place your hands in front of the camera</li>
                <li>• Move left-right to change pitch (200-2000 Hz)</li>
                <li>• Move closer-farther to control volume (close = loud, far = quiet)</li>
                <li>• Both hands produce the same sine wave sound</li>
                <li>• Create harmonies by using both hands at different positions</li>
              </ul>
            </div>
          </div>

          {/* Theremin control panel */}
          <div className="lg:col-span-1 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <ThereminControls hands={hands} />
            
            <div className="mt-6 space-y-3">
              <Button 
                onClick={stopApp}
                variant="outline"
                className="w-full text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-slate-100 rounded-lg transition-all duration-200"
              >
                Stop
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 max-w-4xl mx-auto border border-slate-700/50 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">About the Virtual Theremin</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              The theremin is a unique electronic musical instrument invented in 1920 by Léon Theremin. 
              It's played without physical contact by moving hands near two antennas that control pitch and volume. 
              This virtual version uses hand tracking technology to recreate that magical experience in your browser.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs text-slate-400">
              <div className="bg-slate-700/30 rounded-lg p-3 border-l-4 border-blue-500">
                <h4 className="font-medium text-blue-400 mb-1">Pitch Control</h4>
                <p>Horizontal hand position controls frequency from 200 Hz to 2000 Hz</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3 border-l-4 border-cyan-500">
                <h4 className="font-medium text-cyan-400 mb-1">Volume Control</h4>
                <p>Hand distance from camera controls volume - closer is louder</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

