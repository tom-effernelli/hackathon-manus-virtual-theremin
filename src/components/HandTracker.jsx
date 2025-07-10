import { useRef, useEffect, useState } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const HandTracker = ({ onHandDetected }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [handLandmarker, setHandLandmarker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeHandLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.7,
          minHandPresenceConfidence: 0.7,
          minTrackingConfidence: 0.7
        });
        
        setHandLandmarker(landmarker);
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing HandLandmarker:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    initializeHandLandmarker();
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Unable to access camera');
      }
    };

    if (!isLoading && !error) {
      startCamera();
    }
  }, [isLoading, error]);

  useEffect(() => {
    let animationId;

    const detectHands = () => {
      if (handLandmarker && videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (video.readyState >= 2) {
          // Calculate dimensions respecting video aspect ratio
          const videoAspectRatio = video.videoWidth / video.videoHeight;
          const containerWidth = canvas.parentElement.clientWidth - 48; // Padding
          
          // Calculate height based on video aspect ratio
          const canvasHeight = containerWidth / videoAspectRatio;
          
          // Limit maximum height
          const maxHeight = window.innerHeight * 0.7;
          let finalWidth, finalHeight;
          
          if (canvasHeight > maxHeight) {
            finalHeight = maxHeight;
            finalWidth = finalHeight * videoAspectRatio;
          } else {
            finalWidth = containerWidth;
            finalHeight = canvasHeight;
          }
          
          // Apply calculated dimensions
          canvas.width = finalWidth;
          canvas.height = finalHeight;
          
          // Update CSS style to maintain dimensions
          canvas.style.width = `${finalWidth}px`;
          canvas.style.height = `${finalHeight}px`;

          // Draw video on canvas with correct aspect ratio
          ctx.save();
          ctx.scale(-1, 1); // Mirror effect
          ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
          ctx.restore();

          // Detect hands
          const results = handLandmarker.detectForVideo(video, performance.now());

          if (results.landmarks && results.landmarks.length > 0) {
            // Draw landmarks
            drawLandmarks(ctx, results.landmarks, canvas.width, canvas.height);
            
            // Calculate theremin data
            const thereminData = calculateThereminData(results.landmarks, canvas.width, canvas.height);
            
            // Call callback with data
            if (onHandDetected) {
              onHandDetected(thereminData);
            }
          } else {
            // No hands detected
            if (onHandDetected) {
              onHandDetected([]);
            }
          }
        }
      }

      animationId = requestAnimationFrame(detectHands);
    };

    if (handLandmarker && !isLoading) {
      detectHands();
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [handLandmarker, isLoading, onHandDetected]);

  const calculateThereminData = (landmarks, width, height) => {
    return landmarks.map((handLandmarks, index) => {
      // Use palm center (landmark 0) as reference point
      const palmCenter = handLandmarks[0];
      
      // Normalized X position (0 = left, 1 = right)
      const x = palmCenter.x;
      
      // Normalized Y position (0 = top, 1 = bottom)
      const y = palmCenter.y;
      
      // Z distance estimation based on hand size
      // Larger hand in image = closer to camera
      const thumb = handLandmarks[4];
      const pinky = handLandmarks[20];
      const handWidth = Math.abs(thumb.x - pinky.x);
      
      // Normalize distance (0 = far, 1 = close)
      // CORRECTED: Larger handWidth means closer, so higher z value
      const z = Math.min(handWidth * 8, 1); // Increased scale factor for better sensitivity
      
      return {
        handId: index,
        x: x,
        y: y,
        z: z,
        landmarks: handLandmarks
      };
    });
  };

  const drawLandmarks = (ctx, landmarks, width, height) => {
    landmarks.forEach((handLandmarks, handIndex) => {
      // Draw connections first (background)
      ctx.strokeStyle = '#10B981'; // Emerald-500
      ctx.lineWidth = 2;
      drawConnections(ctx, handLandmarks, width, height);

      // Draw landmark points
      handLandmarks.forEach((landmark, index) => {
        // Invert X coordinate for mirror effect
        const x = (1 - landmark.x) * width;
        const y = landmark.y * height;
        
        // Palm center (landmark 0) - more visible
        if (index === 0) {
          // Blue color for all hands (unified)
          ctx.fillStyle = '#3B82F6'; // Blue
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, 2 * Math.PI);
          ctx.fill();
          
          // White border
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 3;
          ctx.stroke();
          
          // Hand label
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(`Hand ${handIndex + 1}`, x, y - 20);
        } else {
          // Other points - smaller
          ctx.fillStyle = '#EF4444'; // Red-500
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
    });
  };

  const drawConnections = (ctx, landmarks, width, height) => {
    // Finger connections
    const connections = [
      // Thumb
      [0, 1], [1, 2], [2, 3], [3, 4],
      // Index
      [0, 5], [5, 6], [6, 7], [7, 8],
      // Middle
      [0, 9], [9, 10], [10, 11], [11, 12],
      // Ring
      [0, 13], [13, 14], [14, 15], [15, 16],
      // Pinky
      [0, 17], [17, 18], [18, 19], [19, 20],
      // Palm
      [5, 9], [9, 13], [13, 17]
    ];

    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];
      
      // Invert X coordinates for mirror effect
      const startX = (1 - startPoint.x) * width;
      const startY = startPoint.y * height;
      const endX = (1 - endPoint.x) * width;
      const endY = endPoint.y * height;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-96 bg-slate-900/50 rounded-lg border border-slate-700/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading hand detection model...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 min-h-96 bg-slate-900/50 rounded-lg border border-slate-700/50">
        <div className="text-center text-red-400">
          <div className="text-4xl mb-4">⚠</div>
          <p className="font-medium">Error: {error}</p>
          <p className="text-sm mt-2 text-slate-400">Please allow camera access</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="hidden"
      />
      <canvas
        ref={canvasRef}
        className="bg-slate-900 rounded-lg border border-slate-700/50 shadow-lg"
      />
      <div className="absolute top-3 left-3 bg-slate-800/80 backdrop-blur-sm text-slate-200 px-3 py-2 rounded-lg text-sm border border-slate-600/50">
        Virtual Theremin
      </div>
      <div className="absolute top-3 right-3 bg-slate-800/80 backdrop-blur-sm text-slate-200 px-3 py-2 rounded-lg text-sm border border-slate-600/50">
        Position X: Pitch | Distance Z: Volume
      </div>
    </div>
  );
};

export default HandTracker;

