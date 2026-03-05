import { useState, useEffect } from 'react';
import { WeatherData, User } from '../types';

export const useWeather = (user?: User | null) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        // Using a free public API (Open-Meteo) which doesn't require a key
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m,precipitation_probability&daily=precipitation_probability_max&timezone=auto`
        );
        const data = await response.json();
        
        setWeather({
          temp: data.current_weather.temperature,
          condition: data.current_weather.weathercode.toString(), // Simplified
          humidity: data.hourly.relativehumidity_2m[0],
          rainProb: data.daily.precipitation_probability_max[0],
          wind: data.current_weather.windspeed,
        });
      } catch (err) {
        setError('Failed to fetch weather');
      } finally {
        setLoading(false);
      }
    };

    if (user?.latitude && user?.longitude) {
      fetchWeather(user.latitude, user.longitude);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setError('Geolocation denied');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation not supported');
      setLoading(false);
    }
  }, [user]);

  return { weather, loading, error };
};
