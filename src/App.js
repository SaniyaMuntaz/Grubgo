import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { 
  Home as HomeIcon, Compass, ShoppingBag, 
  Search, Phone, Star, Clock, Truck 
} from 'lucide-react';

export default function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [mood, setMood] = useState(50);
  const [winner, setWinner] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [orderStatus, setOrderStatus] = useState(0); 
  const [userPos, setUserPos] = useState({ lat: 17.4483, lng: 78.3915 }); 

  const mapRef = useRef(null);
  const googleMap = useRef(null);


  // --- STYLES (Moved inside or defined clearly) ---
  const compactCardStyle = {
    background: '#fefcef', padding: '12px 16px', borderRadius: '16px',
    marginBottom: '10px', border: '1px solid #360705', display: 'flex',
    alignItems: 'center', justifyContent: 'space-between'
  };

  const iconBoxStyle = {
    width: '50px', height: '50px', background: '#daa63e',
    borderRadius: '12px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '24px', border: '1px solid #442216'
  };

  useEffect(() => {
    fetch("https://grubgo-backend-5u6u.onrender.com/api/restaurants")
      .then(res => {
        if (!res.ok) throw new Error("Backend not responding");
        return res.json();
      })
      .then(data => setRestaurants(data))
      .catch(err => console.error("Fetch error:", err));
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.watchPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
  }, []);

  const initMap = React.useCallback(() => {
  // CRITICAL: Stop if Google isn't loaded or the Div is missing
  if (!window.google || !mapRef.current) return;

  try {
    googleMap.current = new window.google.maps.Map(mapRef.current, {
      center: userPos, 
      zoom: 14, 
      styles: ultraCleanMapStyle, 
      disableDefaultUI: true
    });

    // Only add markers if the map was actually created
    if (googleMap.current) {
      new window.google.maps.Marker({
        position: userPos,
        map: googleMap.current,
        title: "You are here",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#3897f0",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#fff",
        }
      });

      restaurants.forEach(res => {
        if (res.lat && res.lng) {
          const marker = new window.google.maps.Marker({
            position: { lat: parseFloat(res.lat), lng: parseFloat(res.lng) },
            map: googleMap.current,
            title: res.name
          });
          
          const infoWindow = new window.google.maps.InfoWindow({
            content: `<div style="color:black;"><strong>${res.name}</strong></div>`
          });

          marker.addListener("click", () => infoWindow.open(googleMap.current, marker));
        }
      });
    }
  } catch (err) {
    console.error("Map initialization failed:", err);
  }
}, [userPos, restaurants]);

 // This maps the slider (1-100) to your 4 database categories
const getMoodDetails = (value) => {
  const sliderTagline = "Slide into the right flavour.";
  if (value < 25) return { label: "🥨 Quick Snack", category: "Quick Snack" };
  if (value < 50) return { label: "🥗 Balanced", category: "Balanced" };
  if (value < 75) return { label: "🥘 Full Meal", category: "Full Meal" };
  return { label: "🌙 Late Night Cravings", category: "Late Night Cravings" };
};

const currentMood = getMoodDetails(mood);

// Updated Filter to match the 4 categories
const filteredFeed = restaurants.filter(item => {
  const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
  return matchesSearch && item.mood === currentMood.category;
});

  const handleSpin = () => {
  if (isSpinning || filteredFeed.length === 0) return;

  setIsSpinning(true);
  setWinner(null);

  // 1. Calculate a big random rotation (at least 5 full turns + random)
  const newRotation = rotation + 1800 + Math.floor(Math.random() * 360);
  setRotation(newRotation);

  // 2. Wait for the CSS transition (4 seconds) to finish
  setTimeout(() => {
    setIsSpinning(false);
    
    // 3. Logic to find who is at the "Top" (12 o'clock)
    const actualRotation = newRotation % 360;
    const sliceAngle = 360 / filteredFeed.length;
    // We adjust by 270 degrees because CSS 0deg starts at 3 o'clock
    const winnerIndex = Math.floor(((360 - actualRotation + 270) % 360) / sliceAngle);
    
    setWinner(filteredFeed[winnerIndex]);
  }, 4000); // Must match the transition time in CSS
};

  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#fff', color: 'white', fontFamily: 'sans-serif' }}>
        <div style={{ padding: '15px', paddingBottom: '110px' }}>
          <Routes>
            <Route path="/" element={
              <div>
               <header style={{ marginBottom: '25px', textAlign: 'center' }}>
  <h1 style={{ margin: '0', fontSize: '32px', fontWeight: '900', color: '#442216' }}>
    GRUB<span style={{ color: '#7a002b' }}>GO</span>
  </h1>
  <p style={{ margin: '5px 0 20px 0', fontSize: '20px', color: '#3e0014', fontStyle: 'italic' }}>
    “Be as picky as you feel”
  </p>
  <p style={{ 
  fontSize: '12px', 
  color: '#888', 
  marginBottom: '10px', 
  fontWeight: '500' 
}}>
  {currentMood.tagline}
</p>
  <div style={moodBox}>
    <p style={{ fontSize: '12px', color: '#2c0415', marginBottom: '10px' }}>
      Mood: <span style={{ color: '#b32e33', fontWeight: 'bold' }}>
        {currentMood.label}
      </span>
    </p>
    <input 
      type="range" 
      min="1" 
      max="100" 
      value={mood} 
      onChange={(e) => setMood(e.target.value)} 
      style={sliderStyle} 
    />
    {/* Visual indicators for the 4 zones */}
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '10px', color: '#c28d39' }}>
      <span>Snack</span>
      <span>Healthy</span>
      <span>Heavy</span>
      <span>Late</span>
    </div>
  </div>

  <div style={searchBarWrapper}>
    <Search size={20} color="#7f110e" />
    <input 
      type="text" 
      placeholder="Search for a craving..." 
      style={searchInputStyle} 
      onChange={(e) => setSearchTerm(e.target.value)} 
    />
  </div>
</header>
                {filteredFeed.map(res => (
                  <div key={res._id} style={compactCardStyle}>
                    <div style={iconBoxStyle}>{mood < 35 ? "🥨" : mood > 75 ? "🥘" : "🍱"}</div>
                    <div style={{ flex: 1, marginLeft: '15px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', color:'#3b010b' }}>{res.name}</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#66021f' }}>{res.dish}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#66021f', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={14} fill="#66021f" /> {res.rating}
                      </div>
                      <div style={{ fontSize: '10px', color: '#4443820', marginTop: '4px' }}>
                        <Clock size={10} /> 25 min
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            } />

            
  
            <Route path="/spin" element={
  <div style={{ textAlign: 'center', padding: '30px' }}>
    <h2 style={{ color: '#7a051f', letterSpacing: '2px' }}>MOOD WHEEL</h2>
    <p style={{ color: '#84592b', fontSize: '14px', marginBottom: '20px', fontStyle: 'italic' }}>
      “Too hangry to decide? We will make the go.”
    </p>
    <div style={{ position: 'relative', width: '320px', height: '320px', margin: '40px auto' }}>
      {/* The Arrow/Pointer */}
      <div style={{
        position: 'absolute', top: '-20px', left: '50%', 
        transform: 'translateX(-50%)', zIndex: 10, fontSize: '30px'
      }}>▼</div>

      {/* The Wheel */}
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        position: 'relative', overflow: 'hidden',
        border: '8px solid #cd7a3e',
        boxShadow: '0 0 40px rgba(57, 255, 20, 0.2)',
        transition: 'transform 4s cubic-bezier(0.15, 0, 0.15, 1)', // Smooth slow-down
        transform: `rotate(${rotation}deg)`,
        background: `conic-gradient(${
          filteredFeed.map((_, i) => 
            `${i % 2 === 0 ? '#ffe9ec' : '#66021f'} ${(360/filteredFeed.length) * i}deg ${(360/filteredFeed.length) * (i+1)}deg`
          ).join(', ')
        })`
      }}>
       {filteredFeed.map((res, i) => {
  const total = filteredFeed.length;
  const angle = 360 / total;
  // Calculate the center of the slice
  const rotationAngle = (angle * i) + (angle / 2);

  return (
    <div key={i} style={{
      position: 'absolute',
      top: '0',
      left: '50%',
      width: '100px', // Give the label a fixed width
      height: '50%',  // Only goes from center to edge
      marginLeft: '-50px', // Center the 100px width on the middle line
      transformOrigin: 'bottom center', // Rotate from the center of the wheel
      transform: `rotate(${rotationAngle}deg)`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start', // Push text to the outer edge
      zIndex: 10
    }}>
      <span style={{
        marginTop: '20px', // Adjust this to move names closer to the edge
        transform: 'rotate(90deg)', // Keep them vertical
        fontSize: '10px',
        fontWeight: '900',
        color: i % 2 === 0 ? '#66021f' : '#FFe9ec',
        whiteSpace: 'nowrap',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {res.name.split(' ')[0]} {/* Show only the first word to save space */}
      </span>
    </div>
  );
})}

{/* The "Hub" Cap - Put this AFTER the map to hide the center intersection */}
<div style={{
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '50px',
  height: '50px',
  backgroundColor: '#f9f6ee',
  borderRadius: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 20,
  border: '4px solid #781c26',
  boxShadow: '0 0 15px rgba(57, 255, 20, 0.4)'
}}></div>
      </div>
    </div>

    <button onClick={handleSpin} style={btnStyle} disabled={isSpinning}>
      {isSpinning ? "SPINNING..." : "LET FATE DECIDE"}
    </button>

    {winner && !isSpinning && (
      <div style={{ marginTop: '20px', animation: 'fadeIn 0.5s' }}>
        <p style={{ color: '#b47a21' }}>Go to:</p>
        <h3 style={{ color: '#800020' }}>{winner.name}</h3>
      </div>
    )}
  </div>
} />
            
            <Route path="/cart" element={
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <h2 style={{ color: '#c28d39' }}>Your Cart</h2>
                <div style={{ padding: '40px', border: '1px dashed #333', borderRadius: '20px' }}>
                  <ShoppingBag size={48} color="#7a002b" style={{ marginBottom: '10px' }} />
                 <h3 style={{ color: '#e8a80a', margin: '0 0 10px 0' }}>Capture the loot</h3>
                 <p style={{ color: '#640409', fontSize: '14px' }}>Your bag is looking a bit light.</p>
                </div>
              </div>
            } />

            <Route path="/track" element={
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ color: '#640606' }}>Live Tracking</h2>
                <div style={stepperWrapper}>
                    {['Placed', 'Kitchen', 'Rider', 'Arrived'].map((step, i) => (
                        <div key={step} style={{ textAlign: 'center', opacity: orderStatus >= i ? 1 : 0.3 }}>
                            <div style={{...dotStyle, backgroundColor: orderStatus >= i ? '#6e151a' : '#c28d39'}}></div>
                            <p style={{fontSize:'10px', marginTop: '5px'}}>{step}</p>
                        </div>
                    ))}
                </div>
                <MapComponent mapRef={mapRef} initMap={initMap} />
                <div style={riderCardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{fontSize:'28px'}}>🚴</div>
                    <div style={{textAlign:'left'}}>
                      <h4 style={{margin:0, fontsize:'20px', color:'#70020f'}}>Arjun K.</h4>
                      <p style={{margin:0, fontSize:'11px', color:'#550d0e'}}>Honda Activa • On the way</p>
                    </div>
                  </div>
                  <button style={callButtonStyle}><Phone size={14}/> Call</button>
                </div>
                <button onClick={() => setOrderStatus((orderStatus + 1) % 4)} style={btnLarge}>NEXT STATUS</button>
              </div>
            } />
          </Routes>
        </div>

        <nav style={navStyle}>
          <Link to="/" style={linkStyle}><div style={navItem}><HomeIcon size={22}/><span style={navText}>Home</span></div></Link>
          <Link to="/spin" style={linkStyle}><div style={navItem}><Compass size={22}/><span style={navText}>Spin</span></div></Link>
          <Link to="/cart" style={linkStyle}><div style={navItem}><ShoppingBag size={22}/><span style={navText}>Cart</span></div></Link>
          <Link to="/track" style={linkStyle}><div style={navItem}><Truck size={22}/><span style={navText}>Track</span></div></Link>
        </nav>
      </div>

   

    </Router>
  );
}
        

function MapComponent({ mapRef, initMap }) {
  useEffect(() => { 
    initMap(); 
  },[initMap]);
  return <div ref={mapRef} style={mapContainerStyle} />;
}

// --- REMAINING STYLES ---
const navStyle = { position: 'fixed', bottom: 0, width: '100%', height: '80px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', background: '#f0e7d5', borderTop:'1px solid #c28d39', zIndex: 1000 };
const navItem = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' };
const navText = { fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' };
const moodBox = { background: '#f0e7d5', padding: '15px', borderRadius: '15px', marginBottom: '15px', border: '1px solid #45171b' };
const sliderStyle = { width: '100%', accentColor: '#c28d39' };
const ultraCleanMapStyle = [{ elementType: "geometry", stylers: [{ color: "#212121" }] }, { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] }];
const mapContainerStyle = { height: '350px', width: '100%', borderRadius: '24px', margin: '15px 0', border: '1px solid #351018' };
const searchBarWrapper = { background: '#e8d8c4', display: 'flex', padding: '12px', borderRadius: '15px' };
const searchInputStyle = { background: 'transparent', border: 'none', color: '#5d222c', width: '100%', outline: 'none', marginLeft: '10px' };
const linkStyle = { color: '#66021f', textDecoration: 'none' };
const btnStyle = { background: '#f7ca84', color: 'black', border: 'none', padding: '12px 24px', borderRadius: '30px', fontWeight: 'bold' };
const btnLarge = { ...btnStyle, width: '100%', marginTop: '10px' };
const stepperWrapper = { display: 'flex', justifyContent: 'space-around', margin: '15px 0',color:'#70020f' };
const dotStyle = { width: '8px', height: '8px', borderRadius: '50%', margin: '0 auto' };
const riderCardStyle = { background: '#ffflcf', padding: '16px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #301415', marginTop: '10px' };
const callButtonStyle = { background: 'transparent', border: '1px solid #9f6920', color: '#670626', padding: '8px 18px', borderRadius: '20px' };
