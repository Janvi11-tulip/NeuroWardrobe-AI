import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { UIMoodProfile } from '../types';

interface ThemeContextType {
  uiProfile: UIMoodProfile | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const uiProfile = useMemo(() => {
    return user?.analysis_results?.uiProfile || null;
  }, [user]);

  useEffect(() => {
    if (!uiProfile) {
      // Default Theme
      document.documentElement.style.setProperty('--radius-card', '2rem');
      document.documentElement.style.setProperty('--bg-primary', '#f5f2ed');
      document.documentElement.style.setProperty('--text-primary', '#141414');
      document.documentElement.style.setProperty('--accent-primary', '#141414');
      document.documentElement.style.setProperty('--font-heading', '"Playfair Display", serif');
      document.documentElement.style.setProperty('--animation-speed', '0.3s');
      document.documentElement.style.setProperty('--glass-blur', '16px');
      document.documentElement.style.setProperty('--border-opacity', '0.2');
      return;
    }

    const { themeType, edgeSoftness, visualIntensity, animationEnergy, primaryFont, accentColor, contrastPreference } = uiProfile;

    // Radius
    const radius = `${edgeSoftness * 3}rem`;
    document.documentElement.style.setProperty('--radius-card', radius);

    // Fonts
    const headingFont = primaryFont === 'serif' ? '"Playfair Display", serif' : '"Inter", sans-serif';
    document.documentElement.style.setProperty('--font-heading', headingFont);

    // Animation
    const speed = `${(1.1 - animationEnergy) * 0.5}s`;
    document.documentElement.style.setProperty('--animation-speed', speed);

    // Colors & Contrast
    let bg = '#f5f2ed';
    let text = '#141414';
    let borderOp = 0.2;
    let blur = '16px';

    if (themeType === 'bold') {
      bg = '#0a0a0a';
      text = '#ffffff';
      borderOp = 0.1;
      blur = '24px';
    } else if (themeType === 'soft') {
      bg = '#fdfcfb';
      text = '#4a4a4a';
      borderOp = 0.3;
      blur = '12px';
    } else if (themeType === 'energetic') {
      bg = '#ffffff';
      text = '#141414';
      borderOp = 0.4;
      blur = '8px';
    } else if (themeType === 'minimal') {
      bg = '#f5f5f5';
      text = '#666666';
      borderOp = 0.1;
      blur = '32px';
    }

    document.documentElement.style.setProperty('--bg-primary', bg);
    document.documentElement.style.setProperty('--text-primary', text);
    document.documentElement.style.setProperty('--accent-primary', accentColor || text);
    document.documentElement.style.setProperty('--border-opacity', borderOp.toString());
    document.documentElement.style.setProperty('--glass-blur', blur);
    
    // Visual Intensity (Shadows, etc)
    const shadow = visualIntensity > 0.5 ? '0 20px 40px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0,0,0,0.05)';
    document.documentElement.style.setProperty('--card-shadow', shadow);

  }, [uiProfile]);

  return (
    <ThemeContext.Provider value={{ uiProfile }}>
      <div className="transition-colors duration-500 min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
