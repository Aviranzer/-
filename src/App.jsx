import React, { useState } from 'react';
import { getCoordinates, getForecast, calculateDI } from './utils';

export default function App() {
  const [city, setCity] = useState('חצרים');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const geo = await getCoordinates(city);
      // מעבירים ישירות את מחרוזות התאריך והשעה ללא תיווך של new Date()
      const weather = await getForecast(geo.lat, geo.lon, date, time);
      const diData = calculateDI(weather.temp, weather.humidity);

      setResult({
        cityName: geo.name,
        temp: weather.temp,
        humidity: weather.humidity,
        ...diData
      });
    } catch (err) {
      setError(err.message || "אירעה שגיאה בחישוב התחזית.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ direction: 'rtl', fontFamily: 'sans-serif', maxWidth: '450px', margin: '40px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
      <h1 style={{ textAlign: 'center', color: '#1E293B', marginBottom: '8px' }}>חננא"ל 🌤️</h1>
      <p style={{ textAlign: 'center', color: '#64748B', fontSize: '14px', marginTop: 0 }}>חזאי נתוני נקודה אקלימיים לשטח - חיזוי יא"ן עתידי</p>

    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
      <div>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', textAlign: 'center', color: '#475569' }}>עיר / בסיס / נקודה:</label>
        <input 
          type="text" 
          value={city} 
          onChange={(e) => setCity(e.target.value)} 
          required 
          style={{ 
            width: '100%', 
            padding: '10px', 
            borderRadius: '8px', 
            border: '1px solid #CBD5E1', 
            backgroundColor: '#FFFFFF',
            color: '#1E293B',
            fontSize: '16px',
            boxSizing: 'border-box',
            textAlign: 'center',
            WebkitAppearance: 'none'
          }}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', textAlign: 'center', color: '#475569' }}>תאריך:</label>
        <div dir="ltr">
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            required 
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '8px', 
              border: '1px solid #CBD5E1', 
              backgroundColor: '#FFFFFF',
              color: '#1E293B',
              fontSize: '16px',
              boxSizing: 'border-box',
              textAlign: 'center',
              WebkitAppearance: 'none'
            }}
          />
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', textAlign: 'center', color: '#475569' }}>שעה:</label>
        <div dir="ltr">
          <input 
            type="time" 
            value={time} 
            onChange={(e) => setTime(e.target.value)} 
            required 
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '8px', 
              border: '1px solid #CBD5E1', 
              backgroundColor: '#FFFFFF',
              color: '#1E293B',
              fontSize: '16px',
              boxSizing: 'border-box',
              textAlign: 'center',
              WebkitAppearance: 'none'
            }}
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        style={{ 
          padding: '12px', 
          backgroundColor: '#2563EB', 
          color: '#fff', 
          border: 'none', 
          borderRadius: '8px', 
          fontSize: '16px',
          fontWeight: 'bold', 
          cursor: 'pointer', 
          marginTop: '6px' 
        }}
      >
        {loading ? 'מחשב תחזית...' : 'חשב יא"ן'}
      </button>
    </form>

      {error && <div style={{ color: '#EF4444', marginTop: '15px', textAlign: 'center' }}>{error}</div>}

      {result && (
        <div style={{ marginTop: '25px', padding: '15px', borderRadius: '8px', backgroundColor: '#F8FAFC', borderRight: `6px solid ${result.status.color}` }}>
          <h3 style={{ margin: '0 0 10px 0' }}>תחזית עבור {result.cityName}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
            <div>טמפרטורה: <strong>{result.temp}°C</strong></div>
            <div>לחות יחסית: <strong>{result.humidity}%</strong></div>
            <div>טמפ' לחה (T<sub>w</sub>): <strong>{result.tw}°C</strong></div>
            <div>ערך יא"ן: <strong style={{ fontSize: '18px', color: result.status.color }}>{result.di}</strong></div>
          </div>
          <div style={{ marginTop: '12px', padding: '6px 12px', borderRadius: '4px', backgroundColor: result.status.color, color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
            {result.status.text}
          </div>
        </div>
      )}
    </div>
  );
}