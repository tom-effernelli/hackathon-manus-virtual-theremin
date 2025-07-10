import { useRef, useCallback, useEffect } from 'react';

const useTheremin = () => {
  const audioContextRef = useRef(null);
  const oscillatorsRef = useRef({});
  const gainNodesRef = useRef({});
  const isInitializedRef = useRef(false);

  // Initialize audio context
  const initializeAudio = useCallback(async () => {
    if (isInitializedRef.current) return;

    try {
      // Create audio context
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      
      isInitializedRef.current = true;
      console.log('Theremin audio initialized successfully');
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }, []);

  // Create an oscillator for a hand
  const createOscillator = useCallback((handId) => {
    if (!audioContextRef.current) return;

    try {
      // Create oscillator
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      // Configure oscillator with sine wave (unified sound)
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime);
      
      // Configure gain (volume)
      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      
      // Connect oscillator -> gain -> destination
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      // Start oscillator
      oscillator.start();
      
      // Store references
      oscillatorsRef.current[handId] = oscillator;
      gainNodesRef.current[handId] = gainNode;
      
      console.log(`Oscillator created for hand ${handId}`);
    } catch (error) {
      console.error('Error creating oscillator:', error);
    }
  }, []);

  // Stop an oscillator
  const stopOscillator = useCallback((handId) => {
    if (oscillatorsRef.current[handId]) {
      try {
        // Quick fade out
        const gainNode = gainNodesRef.current[handId];
        if (gainNode) {
          gainNode.gain.exponentialRampToValueAtTime(
            0.001, 
            audioContextRef.current.currentTime + 0.1
          );
        }
        
        // Stop oscillator after fade out
        setTimeout(() => {
          if (oscillatorsRef.current[handId]) {
            oscillatorsRef.current[handId].stop();
            delete oscillatorsRef.current[handId];
            delete gainNodesRef.current[handId];
          }
        }, 150);
        
        console.log(`Oscillator stopped for hand ${handId}`);
      } catch (error) {
        console.error('Error stopping oscillator:', error);
      }
    }
  }, []);

  // Update frequency and volume for a hand
  const updateHand = useCallback((handId, frequency, volume) => {
    if (!audioContextRef.current) return;

    // Create oscillator if it doesn't exist
    if (!oscillatorsRef.current[handId]) {
      createOscillator(handId);
    }

    const oscillator = oscillatorsRef.current[handId];
    const gainNode = gainNodesRef.current[handId];

    if (oscillator && gainNode) {
      try {
        const currentTime = audioContextRef.current.currentTime;
        
        // Update frequency with smooth transition
        oscillator.frequency.exponentialRampToValueAtTime(
          Math.max(frequency, 20), // Minimum 20Hz
          currentTime + 0.05
        );
        
        // Update volume with smooth transition
        gainNode.gain.exponentialRampToValueAtTime(
          Math.max(volume, 0.001), // Minimum to avoid errors
          currentTime + 0.05
        );
      } catch (error) {
        console.error('Error updating hand:', error);
      }
    }
  }, [createOscillator]);

  // Calculate frequency based on X position (0 to 1)
  const calculateFrequency = useCallback((x) => {
    // Frequency range: 200Hz (low) to 2000Hz (high)
    const minFreq = 200;
    const maxFreq = 2000;
    
    // Invert X so that left = low, right = high
    const normalizedX = 1 - x;
    
    // Logarithmic scale for natural musical progression
    const logMin = Math.log(minFreq);
    const logMax = Math.log(maxFreq);
    const frequency = Math.exp(logMin + normalizedX * (logMax - logMin));
    
    return frequency;
  }, []);

  // Calculate volume based on Z distance (0 to 1)
  const calculateVolume = useCallback((z) => {
    // CORRECTED LOGIC: Close = 100% volume, Far = 0% volume
    // z represents normalized distance (0 = close, 1 = far)
    // Volume range: 0 to 0.4 (to avoid saturation)
    const maxVolume = 0.4;
    
    // Direct mapping: close (z=0) = max volume, far (z=1) = min volume
    const normalizedZ = Math.max(0, Math.min(1, z)); // Clamp between 0 and 1
    const volume = (1 - normalizedZ) * maxVolume; // Invert: 1-z so close=high, far=low
    
    return volume;
  }, []);

  // Clean up resources
  useEffect(() => {
    return () => {
      // Stop all oscillators
      Object.keys(oscillatorsRef.current).forEach(handId => {
        stopOscillator(handId);
      });
      
      // Close audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopOscillator]);

  return {
    initializeAudio,
    updateHand,
    stopOscillator,
    calculateFrequency,
    calculateVolume,
    isInitialized: isInitializedRef.current
  };
};

export default useTheremin;

