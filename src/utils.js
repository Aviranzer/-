// 1. המרת שם עיר לקואורדינטות (מוגבל לישראל לקבלת דיוק מרבי)
export async function getCoordinates(cityName) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=5&language=he&format=json`;
  const response = await fetch(url);
  const data = await response.json();
  
  if (!data.results || data.results.length === 0) {
    throw new Error("העיר לא נמצאה. נסה שם אחר.");
  }

  // העדפה לתוצאה מתוך ישראל (country_code: "IL")
  const israelResult = data.results.find(r => r.country_code === 'IL') || data.results[0];

  return { 
    lat: israelResult.latitude, 
    lon: israelResult.longitude, 
    name: israelResult.name 
  };
}

// 2. שליפת תחזית עתידית מבוססת מודל ECMWF האירופי
export async function getForecast(lat, lon, targetDateStr, targetTimeStr) {
  // בניית מחרוזת מבוקשת בפורמט ISO מקומי: "YYYY-MM-DDTHH:00"
  const formattedTarget = `${targetDateStr}T${targetTimeStr.slice(0, 2)}:00`;

  // הוספנו את הפרמטר models=ecmwf_ifs025 למשיכת הנתונים המדויקים ביותר לאזורנו
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m&models=ecmwf_ifs025&timezone=auto`;
  
  const response = await fetch(url);
  const data = await response.json();

  const times = data.hourly.time;
  
  // חיפוש השעה המדויקת לפי המחרוזת המקומית
  const index = times.findIndex(t => t.startsWith(formattedTarget));
  
  if (index === -1) {
    throw new Error("התאריך/שעה שנבחרו מחוץ לטווח התחזית של המודל האירופי.");
  }

  return {
    temp: data.hourly.temperature_2m[index],
    humidity: data.hourly.relative_humidity_2m[index]
  };
}

// 3. חישוב יא"ן (DI) לפי נוסחת Stull
export function calculateDI(temp, humidity) {
  const T = temp;
  const RH = humidity;

  const Tw = T * Math.atan(0.151977 * Math.sqrt(RH + 8.313659)) +
             Math.atan(T + RH) - 
             Math.atan(RH - 1.676331) + 
             0.00391838 * Math.pow(RH, 1.5) * Math.atan(0.023101 * RH) - 
             4.686035;

  const DI = (T + Tw) / 2;

  let status = { text: "אין עומס חום", color: "#969696" }; // אפור
  if (DI > 22 && DI <= 24) status = { text: "עומס חום קל (1)", color: "#10B981" }; // ירוק
  else if (DI > 24 && DI <= 26) status = { text: "עומס חום מתון (2)", color: "#f9de16" }; // צהוב
  else if (DI > 26 && DI <= 28) status = { text: "עומס חום בינוני (3)", color: "#F97316" }; // כתום
  else if (DI > 28) status = { text: "עומס חום כבד (4)", color: "#EF4444" }; // אדום

  return { di: DI.toFixed(1), tw: Tw.toFixed(1), status };
}