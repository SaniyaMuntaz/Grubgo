import React, { useState } from 'react';
import MoodSlider from '../components/MoodSlider';

const RESTAURANTS = [
  { id: 1, name: "Data Crunch Cafe", category: "Productive", dish: "Cold Brew & Protein Bar" },
  { id: 2, name: "The Burger Bunker", category: "Hangry", dish: "Double Beast Burger" },
  { id: 3, name: "Zen Noodle House", category: "Relaxed", dish: "Spicy Miso Ramen" },
  { id: 4, name: "Salad Station", category: "Productive", dish: "Quinoa Power Bowl" },
  { id: 5, name: "Pizza Portal", category: "Hangry", dish: "Extra Large Pepperoni" },
];

export default function HomeView() {
  const [moodValue, setMoodValue] = useState(50); // Default to Middle (Hangry)

  // Determine current mood string for filtering
  const currentMood = moodValue < 33 ? "Productive" : moodValue < 66 ? "Hangry" : "Relaxed";

  // Filter restaurants based on the slider
  const displayRestaurants = RESTAURANTS.filter(r => r.category === currentMood);

  return (
    <div style={{ padding: '20px' }}>
      <MoodSlider moodValue={moodValue} setMoodValue={setMoodValue} />
      
      <div className="feed-list" style={{ marginTop: '30px' }}>
        {displayRestaurants.map(res => (
          <div key={res.id} style={{
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '15px',
            boxShadow: currentMood === "Hangry" ? '0 0 10px rgba(255, 69, 0, 0.2)' : '0 0 10px rgba(57, 255, 20, 0.1)'
          }}>
            <h3 style={{ margin: 0 }}>{res.name}</h3>
            <p style={{ color: '#39FF14', fontSize: '14px' }}>{res.dish}</p>
          </div>
        ))}
      </div>
    </div>
  );
}