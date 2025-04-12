'use client';

import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, RadialBarChart, RadialBar, PolarAngleAxis, RadarChart, PolarGrid, Radar, PolarRadiusAxis } from 'recharts';
import { useState, useEffect } from 'react';
import { IconSun, IconCloud, IconCloudRain, IconCloudStorm, IconWindmill, IconSunHigh, IconCloudFog, IconMist, IconDroplet, IconEye, IconGauge, IconTemperature, IconUmbrella } from '@tabler/icons-react';

// Helper function to get weather icon based on conditions
const getWeatherIcon = (temp: number, cloudCover: number, precipitation: number) => {
  if (precipitation > 20) return <IconCloudStorm size={24} className="text-slate-600 dark:text-[#f9f9f9]" />;
  if (precipitation > 10) return <IconCloudRain size={24} className="text-slate-600 dark:text-[#f9f9f9]" />;
  if (cloudCover > 70) return <IconCloud size={24} className="text-slate-600 dark:text-[#f9f9f9]" />;
  if (cloudCover > 30) return <IconCloudFog size={24} className="text-slate-600 dark:text-[#f9f9f9]" />;
  if (temp > 25) return <IconSunHigh size={24} className="text-slate-600 dark:text-[#f9f9f9]" />;
  return <IconSun size={24} className="text-slate-600 dark:text-[#f9f9f9]" />;
};

// determine wilaya (province) name from coordinates
const getLocationName = (latitude: number, longitude: number): string => {
  // Coordinates for Algiers
  if (latitude >= 36.65 && latitude <= 36.85 && longitude >= 2.95 && longitude <= 3.25) {
    return 'Alger';
  }
  // Coordinates for Oran
  else if (latitude >= 35.60 && latitude <= 35.80 && longitude >= -0.70 && longitude <= -0.50) {
    return 'Oran';
  }
  // Coordinates for Constantine
  else if (latitude >= 36.25 && latitude <= 36.45 && longitude >= 6.55 && longitude <= 6.75) {
    return 'Constantine';
  }
  // Coordinates for other major cities...
  else if (latitude >= 36.85 && latitude <= 37.05 && longitude >= 7.70 && longitude <= 7.90) {
    return 'Annaba';
  }
  else if (latitude >= 36.40 && latitude <= 36.60 && longitude >= 2.75 && longitude <= 2.95) {
    return 'Blida';
  }
  // Default case when coordinates don't match any specific region
  return 'Unknown Location';
};

// Save latitude and longitude to local storage
const saveUserLocation = (latitude, longitude) => {
    localStorage.setItem('userLatitude', latitude.toString());
    localStorage.setItem('userLongitude', longitude.toString());
};

// Retrieve latitude and longitude from local storage
const getUserLocation = () => {
    const latitude = localStorage.getItem('userLatitude');
    const longitude = localStorage.getItem('userLongitude');

    if (latitude && longitude) {
        return {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
        };
    }

    return null;
};

// Simulated weather data (replace with actual API data)
const generateWeatherData = (lat, lon) => { // Added lat and lon parameters
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Algiers typical weather patterns (modify as needed, based on location)
    const baseTemp = 22 + Math.sin(i * Math.PI / 3.5) * 5;
    const humidity = 65 + Math.cos(i * Math.PI / 3) * 15;
    const cloudCover = Math.round(Math.random() * 100);
    const precipitation = Math.round(Math.random() * 30);

    return {
      day: days[date.getDay()],
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      temp: Math.round(baseTemp),
      tempMin: Math.round(baseTemp - 5 + Math.random() * 2),
      tempMax: Math.round(baseTemp + 5 + Math.random() * 2),
      humidity: Math.round(humidity),
      windSpeed: Math.round(5 + Math.random() * 15),
      precipitation,
      uvIndex: Math.round(6 + Math.random() * 4),
      pressure: Math.round(1013 + Math.random() * 10),
      visibility: Math.round(8 + Math.random() * 4),
      cloudCover,
      isToday: i === 0
    };
  });
};

// Generate hourly data for the day
const generateHourlyData = () => {
  return Array.from({ length: 24 }, (_, i) => {
    const baseTemp = 22 + Math.sin((i - 6) * Math.PI / 12) * 8;
    // Pressure typically follows a twice-daily cycle (semidiurnal pattern)
    const basePressure = 1013 + Math.sin(i * Math.PI / 12) * 3 + Math.sin(i * Math.PI / 6) * 2;
    return {
      hour: `${String(i).padStart(2, '0')}:00`,
      Temperature: Math.round(baseTemp),
      'Feels Like': Math.round(baseTemp + (Math.random() * 4 - 2)),
      Humidity: Math.round(65 + Math.cos(i * Math.PI / 12) * 15),
      Pressure: Math.round(basePressure)
    };
  });
};

// Wind data for radar chart
const generateWindData = () => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions.map(dir => ({
    direction: dir,
    speed: Math.round(5 + Math.random() * 15),
    gust: Math.round(8 + Math.random() * 20)
  }));
};

// UV Index data for radial chart
const generateUVData = () => {
  return [
    { name: 'Current', value: 8, fill: '#2fb96c' },
    { name: 'Safe Limit', value: 11, fill: '#972b2b' }
  ];
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#020818] border border-[#172d662c] shadow-xl px-3 py-2 rounded-lg">
        <p className="text-[#f9f9f9] text-sm font-medium mb-1">{label}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} className="text-[#2fb96c] text-sm font-bold">
            {item.name}: {item.value} {item.unit || ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Weather() {
  const [weatherData, setWeatherData] = useState([]); // Changed to useState to allow for setting the data
  const [hourlyData] = useState(generateHourlyData());
  const [windData] = useState(generateWindData());
  const [uvData] = useState(generateUVData());
  const [location, setLocation] = useState({ latitude: 36.7525, longitude: 3.04197 }); // Default Algiers
  const cardStyle = "p-3 bg-[#020818] border-0 shadow-lg relative before:absolute before:inset-0 before:p-[1px] before:bg-gradient-to-br before:from-[#ffffff10] before:via-[#ffffff05] before:to-transparent before:rounded-lg before:-z-10 before:pointer-events-none backdrop-blur-sm";

  useEffect(() => {
    const storedLocation = getUserLocation();

    if (storedLocation) {
      setLocation(storedLocation);
    } else {
        // Set default location and save it
        saveUserLocation(36.7525, 3.04197);
        setLocation({ latitude: 36.7525, longitude: 3.04197 });
    }
  }, []);

  useEffect(() => {
    if (location.latitude && location.longitude) {

        const fetchWeatherData = async () => {
            const simulatedData = generateWeatherData(location.latitude, location.longitude);
            setWeatherData(simulatedData);

        };
      fetchWeatherData();
    }

  }, [location.latitude, location.longitude]); //  dependency array makes this run when location changes.

    //If weather data is not loaded yet, then we need to prevent rendering, or render some loading info.
    if (!weatherData || weatherData.length === 0) {
        return <div>Loading weather data...</div>
    }

    const todayData = weatherData[0];
    
    // Get the location name from current coordinates
    const locationName = getLocationName(location.latitude, location.longitude);

  return (
    <div className="flex flex-1 flex-col p-4 gap-4">
      {/* Current Weather Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={`${cardStyle} bg-gradient-to-br from-[#2fb96c20] to-[#02081800]`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-medium text-[#b3b3b3] uppercase tracking-wider">Current Weather - {locationName}</h2>
              <div className="mt-4 flex items-center text-bgap-4">
                {getWeatherIcon(todayData.temp, todayData.cloudCover, todayData.precipitation)}
                <div>
                  <span className="text-4xl font-bold dark:text-[#f9f9f9]">{todayData.temp}°</span>
                  <span className="text-[#b3b3b3] ml-2">Feels like {todayData.temp + 2}°</span>
                </div>
              </div>
              <p className="text-[#b3b3b3] mt-2">
                {todayData.cloudCover > 70 ? 'Cloudy' :
                  todayData.cloudCover > 30 ? 'Partly Cloudy' :
                    todayData.temp > 25 ? 'Hot and Sunny' : 'Sunny'} with {todayData.precipitation}% chance of rain
              </p>
            </div>
          </div>
        </Card>

        <Card className={cardStyle}>
          <h2 className="text-xs font-medium text-[#b3b3b3] uppercase tracking-wider">Today's Highlights</h2>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="flex flex-col items-center p-2 rounded-lg bg-[#172d662c]">
              <IconGauge size={20} className="text-[#2fb96c]" />
              <span className="text-[#b3b3b3] text-xs mt-1">Pressure</span>
              <span className="text-slate-700 dark:text-[#f9f9f9] font-bold">{todayData.pressure}hPa</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-[#172d662c]">
              <IconDroplet size={20} className="text-[#2fb96c]" />
              <span className="text-[#b3b3b3] text-xs mt-1">Humidity</span>
              <span className="text-slate-700 dark:text-[#f9f9f9] font-bold">{todayData.humidity}%</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-[#172d662c]">
              <IconEye size={20} className="text-[#2fb96c]" />
              <span className="text-[#b3b3b3] text-xs mt-1">Visibility</span>
              <span className="text-slate-700 dark:text-[#f9f9f9] font-bold">{todayData.visibility}km</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 7-Day Forecast */}
      <Card className={cardStyle}>
        <h2 className="text-xs font-medium px-1 text-[#b3b3b3] uppercase tracking-wider">7-Day Forecast</h2>
        <div className="grid grid-cols-7 gap-2 mt-4">
          {weatherData.map((day, index) => (
            <div
              key={index}
              className={`flex flex-col items-center p-2 rounded-lg transition-all duration-300 backdrop-blur-sm ${day.isToday
                  ? 'bg-gradient-to-br from-[#2fb96c30] to-[#02081800] border border-[#2fb96c]'
                  : 'bg-[#172d662c] hover:bg-[#172d6640]'
                }`}
              style={{
                boxShadow: day.isToday ? '0 0 20px rgba(47, 185, 108, 0.1)' : 'none ',
              }}
            >
              <span className={`text-sm font-medium ${day.isToday ? 'text-[#2fb96c]' : 'dark:text-[#f9f9f9]'
                }`}>{day.day.slice(0, 3)}</span>
              <span className="text-[#b3b3b3] text-xs">{day.date}</span>
              {getWeatherIcon(day.temp, day.cloudCover, day.precipitation)}
              <span className={`text-2xl font-bold my-2 ${day.isToday ? 'text-[#2fb96c]' : 'dark:text-[#f9f9f9]'
                }`}>{day.temp}°</span>
              <div className="flex gap-2 text-xs">
                <span className="text-[#2fb96c]">{day.tempMax}°</span>
                <span className="text-[#b3b3b3]">{day.tempMin}°</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#b3b3b3] mt-1">
                <IconWindmill size={12} className="text-[#b3b3b3]" />
                <span>{day.windSpeed}km/h</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#b3b3b3]">
                <IconUmbrella size={12} className="text-[#b3b3b3]" />
                <span>{day.precipitation}%</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Temperature Chart */}
      <Card className={cardStyle}>
        <h2 className="text-xs font-medium px-1 text-[#b3b3b3] uppercase tracking-wider">24-Hour Temperature Forecast</h2>
        <div className="h-[260px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#172d662c" />
              <XAxis
                dataKey="hour"
                stroke="var(--text-light)"
                fontSize={11}
                axisLine={{ stroke: '#f9f9f940' }}
                tickLine={false}
                tick={{ fill: 'var(--foreground, #000000)', className: 'dark:fill-[#f9f9f9]' }}
              />
              <YAxis
                stroke="var(--text-light)"
                fontSize={11}
                axisLine={{ stroke: '#f9f9f940' }}
                tickLine={false}
                unit="°"
                tick={{ fill: 'var(--foreground, #000000)', className: 'dark:fill-[#f9f9f9]' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" />
              <Line
                type="monotone"
                dataKey="Temperature"
                stroke="#2fb96c"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: '#2fb96c', stroke: '#f9f9f9' }}
              />
              <Line
                type="monotone"
                dataKey="Feels Like"
                stroke="#465fa44d"
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Bottom Section - Now in 2 rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Wind Patterns */}
        <Card className={cardStyle}>
          <h2 className="text-xs font-medium px-1 text-[#b3b3b3] uppercase tracking-wider">Wind Patterns</h2>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={windData}>
                <PolarGrid stroke="#172d662c" />
                <PolarAngleAxis
                  dataKey="direction"
                  stroke="#f9f9f9"
                  fontSize={11}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 30]}
                  stroke="#f9f9f9"
                  fontSize={11}
                />
                <Radar
                  name="Wind Speed"
                  dataKey="speed"
                  stroke="#2fb96c"
                  fill="#2fb96c"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Wind Gust"
                  dataKey="gust"
                  stroke="#465fa44d"
                  fill="#465fa44d"
                  fillOpacity={0.3}
                />
                <Legend iconType="circle" />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* UV Index */}
        <Card className={cardStyle}>
          <h2 className="text-xs font-medium px-1text-[#b3b3b3] uppercase tracking-wider">UV Index</h2>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="100%"
                data={uvData}
                startAngle={180}
                endAngle={0}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 11]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  background
                  dataKey="value"
                  angleAxisId={0}
                  data={uvData}
                  cornerRadius={15}
                />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-slate-600 dark:fill-[#f9f9f9] text-2xl font-bold"
                >
                  {uvData[0].value}
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Humidity Distribution */}
        <Card className={cardStyle}>
          <h2 className="text-xs font-medium px-1 text-[#b3b3b3] uppercase tracking-wider">Humidity Distribution</h2>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#172d662c" />
                <XAxis
                  dataKey="hour"
                  stroke="var(--text-light)"
                  fontSize={11}
                  axisLine={{ stroke: '#f9f9f940' }}
                  tickLine={false}
                  tick={{ fill: 'var(--foreground, #000000)', className: 'dark:fill-[#f9f9f9]' }}
                  interval={2}
                />
                <YAxis
                  stroke="var(--text-light)"
                  fontSize={11}
                  axisLine={{ stroke: '#f9f9f940' }}
                  tickLine={false}
                  unit="%"
                  tick={{ fill: 'var(--foreground, #000000)', className: 'dark:fill-[#f9f9f9]' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="Humidity"
                  fill="#2fb96c"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pressure Trend */}
        <Card className={cardStyle}>
          <h2 className="text-xs font-medium px-1 text-[#b3b3b3] uppercase tracking-wider">Pressure Trend</h2>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#172d662c" />
                <XAxis
                  dataKey="hour"
                  stroke="var(--text-light)"
                  fontSize={11}
                  axisLine={{ stroke: '#f9f9f940' }}
                  tickLine={false}
                  tick={{ fill: 'var(--foreground, #000000)', className: 'dark:fill-[#f9f9f9]' }}
                  interval={2}
                />
                <YAxis
                  stroke="var(--text-light)"
                  fontSize={11}
                  axisLine={{ stroke: '#f9f9f940' }}
                  tickLine={false}
                  domain={[1000, 1030]}
                  unit="hPa"
                  tick={{ fill: 'var(--foreground, #000000)', className: 'dark:fill-[#f9f9f9]' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="Pressure"
                  stroke="#2fb96c"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}