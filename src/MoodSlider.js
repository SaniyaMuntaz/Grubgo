import React from 'react';

const MoodSlider = ({ moodValue, setMoodValue }) => {
  // Logic to determine the label based on slider position
  const getMoodLabel = (val) => {
    if (val < 33) return "Productive";
    if (val < 66) return "Hangry";
    return "Relaxed";
  };

  return (
    <div className="mood-container" style={{ padding: '20px', textAlign: 'center' }}>
      <h2 style={{ color: '#39FF14', marginBottom: '10px' }}>
        Current Mood: {getMoodLabel(moodValue)}
      </h2>
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={moodValue} 
        onChange={(e) => setMoodValue(e.target.value)}
        className="grubgo-slider"
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#888' }}>
        <span>Productive</span>
        <span>Hangry</span>
        <span>Relaxed</span>
      </div>
    </div>
  );
};

export default MoodSlider;