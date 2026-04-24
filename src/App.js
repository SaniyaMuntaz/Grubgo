import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { 
  Home as HomeIcon, Compass, ShoppingBag, 
  Search, Phone, Star, Clock, Truck 
} from 'lucide-react';

// --- MOVE STYLES TO THE TOP SO THEY ARE ALWAYS READY ---
const searchInputStyle = { background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none', marginLeft: '10px' };
const btnStyle = { background: '#39FF14', color: 'black', border: 'none', padding: '12px 24px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' };
const btnLarge = { ...btnStyle, width: '100%', marginTop: '10px' };
const navStyle = { position: 'fixed', bottom: 0, width: '100%', height: '80px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', background: '#000', borderTop:'1px solid #222', zIndex: 1000 };
const navItem = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' };
const navText = { fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' };
const moodBox = { background: '#111', padding: '15px', borderRadius: '15px', marginBottom: '15px', border: '1px solid #222' };
const sliderStyle = { width: '100%', accentColor: '#39FF14' };
const ultraCleanMapStyle = [{ elementType: "geometry", stylers: [{ color: "#212121" }] }, { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] }];
const mapContainerStyle = { height: '350px', width: '100%', borderRadius: '24px', margin: '15px 0', border: '1px solid #333' };
const searchBarWrapper = { background: '#111', display: 'flex', padding: '12px', borderRadius: '15px', border: '1px solid #333' };
const linkStyle = { color: '#39FF14', textDecoration: 'none' };
const stepperWrapper = { display: 'flex', justifyContent: 'space-around', margin: '15px 0' };
const dotStyle = { width: '8px', height: '8px', borderRadius: '50%', margin: '0 auto' };
const riderCardStyle = { background: '#111', padding: '16px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #222', marginTop: '10px' };
const callButtonStyle = { background: 'transparent', border: '1px solid #39FF14', color: '#39FF14', padding: '8px 18px', borderRadius: '20px' };
const compactCardStyle = { background: '#fff', padding: '12px 16px', borderRadius: '16px', marginBottom: '10px', border: '1px solid #a6bed1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#000' };
const iconBoxStyle = { width: '50px', height: '50px', background: '#a6bed1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', border: '1px solid #333' };

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

  // AUTH STATES
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [authData, setAuthData] = useState({ username: '', password: '' });
  const [isRegistering, setIsRegistering] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    const path = isRegistering ? 'register' : 'login';
    try {
      const res = await fetch(`https://grubgo-backend-5u6u.onrender.com/api/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authData)
      });
      const data = await res.json();

      if (res.ok) {
        if (isRegistering) {
          alert("Account created! Now login.");
          setIsRegistering(false);
        } else {
          localStorage.setItem('token', data.token);
          setIsLoggedIn(true);
        }
      } else {
        alert(data.message || "Error");
      }
    } catch (err) {
      alert("Cannot connect to server. Check your internet or backend status.");
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetch("https://grubgo-backend-5u6u.onrender.com/api/restaurants")
        .then(res => res.json())
        .then(data => setRestaurants(data))
        .catch(err => console.error("Fetch error:", err));
    }
  }, [isLoggedIn]);

  // --- MAP LOGIC ---
  const initMap = React.useCallback(() => {
    if (!window.google || !mapRef.current) return;
    googleMap.current = new window.google.maps.Map(mapRef.current, {
      center: userPos, 
      zoom: 14, 
      styles: ultraCleanMapStyle, 
      disableDefaultUI: true
    });
  }, [userPos]);

  const filteredFeed = restaurants.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    let cat = mood < 25 ? "Quick Snack" : mood < 50 ? "Balanced" : mood < 75 ? "Full Meal" : "Late Night Cravings";
    return matchesSearch && item.mood === cat;
  });

  const handleSpin = () => {
    if (isSpinning || filteredFeed.length === 0) return;
    setIsSpinning(true);
    setWinner(null);
    const newRotation = rotation + 1800 + Math.floor(Math.random() * 360);
    setRotation(newRotation);
    setTimeout(() => {
      setIsSpinning(false);
      const actualRotation = newRotation % 360;
      const sliceAngle = 360 / filteredFeed.length;
      const winnerIndex = Math.floor(((360 - actualRotation + 270) % 360) / sliceAngle);
      setWinner(filteredFeed[winnerIndex]);
    }, 4000);
  };

  // GATEKEEPER
  if (!isLoggedIn) {
    return (
      <div style={{ backgroundColor: '#000', height: '100vh', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '350px' }}>
          <h1 style={{ color: '#39FF14', textAlign: 'center', letterSpacing: '4px' }}>GRUBGO</h1>
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={searchBarWrapper}>
                <input type="text" placeholder="Username" style={searchInputStyle} onChange={(e) => setAuthData({...authData, username: e.target.value})} />
            </div>
            <div style={searchBarWrapper}>
                <input type="password" placeholder="Password" style={searchInputStyle} onChange={(e) => setAuthData({...authData, password: e.target.value})} />
            </div>
            <button type="submit" style={btnLarge}>{isRegistering ? "CREATE ACCOUNT" : "LOGIN"}</button>
            <p onClick={() => setIsRegistering(!isRegistering)} style={{ color: '#39FF14', cursor: 'pointer', textAlign: 'center', fontSize: '14px' }}>
              {isRegistering ? "Back to Login" : "New? Create Account"}
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#fff', color: '#000', fontFamily: 'sans-serif' }}>
        <div style={{ padding: '15px', paddingBottom: '110px' }}>
          <Routes>
            <Route path="/" element={
              <div>
                <header style={{ marginBottom: '20px' }}>
                  <div style={moodBox}>
                    <p style={{fontSize:'12px', color:'#888', marginBottom:'10px'}}>
                      Mood: <span style={{color: '#39FF14'}}>{mood < 35 ? "🥨 Quick Snack" : mood > 75 ? "🥘 Full Meal" : "🥗 Balanced"}</span>
                    </p>
                    <input type="range" min="1" max="100" value={mood} onChange={(e) => setMood(e.target.value)} style={sliderStyle} />
                  </div>
                  <div style={searchBarWrapper}>
                    <Search size={20} color="#666" />
                    <input type="text" placeholder="Search..." style={searchInputStyle} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                </header>
                {filteredFeed.map(res => (
                  <div key={res._id} style={compactCardStyle}>
                    <div style={iconBoxStyle}>{mood < 35 ? "🥨" : mood > 75 ? "🥘" : "🍱"}</div>
                    <div style={{ flex: 1, marginLeft: '15px' }}>
                      <h4 style={{ margin: 0 }}>{res.name}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>{res.dish}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#39FF14', fontWeight: 'bold' }}><Star size={14} fill="#39FF14" /> {res.rating}</div>
                    </div>
                  </div>
                ))}
              </div>
            } />

            <Route path="/spin" element={
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ color: '#000' }}>MOOD WHEEL</h2>
                <div style={{ position: 'relative', width: '300px', height: '300px', margin: '20px auto', borderRadius: '50%', overflow: 'hidden', border: '5px solid #000', transition: 'transform 4s cubic-bezier(0.15, 0, 0.15, 1)', transform: `rotate(${rotation}deg)`, background: `conic-gradient(${filteredFeed.map((_, i) => `${i % 2 === 0 ? '#39FF14' : '#111'} ${(360/filteredFeed.length) * i}deg ${(360/filteredFeed.length) * (i+1)}deg`).join(', ')})` }}>
                </div>
                <button onClick={handleSpin} style={btnLarge} disabled={isSpinning}>SPIN</button>
                {winner && !isSpinning && <h3 style={{marginTop:'20px'}}>Winner: {winner.name}</h3>}
              </div>
            } />

            <Route path="/track" element={
              <div style={{ textAlign: 'center' }}>
                <h2>Tracking</h2>
                <MapComponent mapRef={mapRef} initMap={initMap} />
              </div>
            } />
          </Routes>
        </div>

        <nav style={navStyle}>
          <Link to="/" style={linkStyle}><div style={navItem}><HomeIcon size={22}/><span style={navText}>Home</span></div></Link>
          <Link to="/spin" style={linkStyle}><div style={navItem}><Compass size={22}/><span style={navText}>Spin</span></div></Link>
          <Link to="/track" style={linkStyle}><div style={navItem}><Truck size={22}/><span style={navText}>Track</span></div></Link>
          <div onClick={() => {localStorage.removeItem('token'); window.location.reload();}} style={{...navItem, color: 'red', cursor: 'pointer'}}><span style={navText}>Logout</span></div>
        </nav>
      </div>
    </Router>
  );
}

function MapComponent({ mapRef, initMap }) {
  useEffect(() => { initMap(); }, [initMap]);
  return <div ref={mapRef} style={mapContainerStyle} />;
}
