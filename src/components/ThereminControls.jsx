import React from 'react';

const ThereminControls = ({ hands }) => {
  const formatFrequency = (freq) => {
    return freq ? `${Math.round(freq)} Hz` : '---';
  };

  const formatVolume = (vol) => {
    return vol ? `${Math.round(vol * 100)}%` : '0%';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-100 mb-4">
        Theremin Controls
      </h2>
      
      {hands.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <p>No hands detected</p>
          <p className="text-sm mt-2">Place your hands in front of the camera</p>
        </div>
      ) : (
        <div className="space-y-4">
          {hands.map((hand) => {
            return (
              <div 
                key={hand.handId} 
                className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 border border-slate-600/30"
              >
                <h3 className="text-lg font-medium text-slate-200 mb-3 flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-2 bg-blue-500"
                  ></div>
                  Hand {hand.handId + 1}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Position X:</span>
                    <span className="text-slate-200 font-mono">
                      {(hand.x * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Distance Z:</span>
                    <span className="text-slate-200 font-mono">
                      {(hand.z * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Frequency:</span>
                    <span className="text-blue-400 font-mono">
                      {formatFrequency(hand.frequency)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Volume:</span>
                    <span className="text-cyan-400 font-mono">
                      {formatVolume(hand.volume)}
                    </span>
                  </div>
                  
                  {/* Visualization bars */}
                  <div className="space-y-2 mt-4">
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Low (200Hz)</span>
                        <span>High (2000Hz)</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-100 bg-blue-500"
                          style={{ width: `${hand.x * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Silent</span>
                        <span>Loud</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-cyan-500 h-2 rounded-full transition-all duration-100"
                          style={{ width: `${(1 - hand.z) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-lg p-4 border border-slate-600/30">
        <h3 className="text-sm font-medium text-slate-300 mb-2">Instructions</h3>
        <ul className="text-xs text-slate-400 space-y-1">
          <li>• Move your hands left-right to change pitch</li>
          <li>• Move your hands closer-farther to control volume</li>
          <li>• Each hand produces the same sine wave sound</li>
          <li>• Frequency range: 200 Hz to 2000 Hz</li>
        </ul>
      </div>
    </div>
  );
};

export default ThereminControls;

