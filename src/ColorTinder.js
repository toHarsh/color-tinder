import React, { useState, useEffect } from 'react';
import { X, Check, RotateCcw, Palette, RefreshCw } from 'lucide-react';

// Helper function to convert HSL to RGB
const hslToRgb = (h, s, l) => {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

// Helper function to convert RGB to HSL
const rgbToHsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

// Helper function to generate random color schemes
const generateColorScheme = () => {
  const hue = Math.floor(Math.random() * 360);
  return {
    primary: `hsl(${hue}, 70%, 50%)`,
    secondary: `hsl(${(hue + 30) % 360}, 60%, 60%)`,
    neutral: `hsl(${(hue + 60) % 360}, 10%, 80%)`,
    accent: `hsl(${(hue + 180) % 360}, 80%, 60%)`,
    dark: `hsl(${hue}, 70%, 20%)`,
  };
};

const ColorTinder = () => {
  const [currentScheme, setCurrentScheme] = useState(generateColorScheme());
  const [likedSchemes, setLikedSchemes] = useState([]);
  const [dislikedSchemes, setDislikedSchemes] = useState([]);
  const [combinedScheme, setCombinedScheme] = useState(null);

  useEffect(() => {
    if (likedSchemes.length === 3) {
      const combined = createHarmoniousScheme(likedSchemes);
      setCombinedScheme(combined);
    } else {
      setCombinedScheme(null);
    }
  }, [likedSchemes]);

  const createHarmoniousScheme = (schemes) => {
    const hues = schemes.map(scheme => {
      const [h] = rgbToHsl(...hslToRgb(...scheme.primary.match(/\d+/g).map(Number)));
      return h;
    });
    const avgHue = hues.reduce((sum, hue) => sum + hue, 0) / hues.length;
    return {
      primary: `hsl(${avgHue}, 70%, 50%)`,
      secondary: `hsl(${(avgHue + 30) % 360}, 60%, 60%)`,
      neutral: `hsl(${avgHue}, 10%, 90%)`,
      accent: `hsl(${(avgHue + 180) % 360}, 80%, 60%)`,
      dark: `hsl(${avgHue}, 70%, 20%)`,
    };
  };

  const handleSwipe = (like) => {
    if (like && likedSchemes.length < 3) {
      setLikedSchemes([...likedSchemes, currentScheme]);
    } else if (!like) {
      setDislikedSchemes([...dislikedSchemes, currentScheme]);
    }
    setCurrentScheme(generateColorScheme());
  };

  const retrieveDisliked = () => {
    if (dislikedSchemes.length > 0) {
      const lastDisliked = dislikedSchemes[dislikedSchemes.length - 1];
      setCurrentScheme(lastDisliked);
      setDislikedSchemes(dislikedSchemes.slice(0, -1));
    }
  };

  const resetLikedSchemes = () => {
    setLikedSchemes([]);
    setCombinedScheme(null);
  };

  const removeLikedScheme = (index) => {
    const newLikedSchemes = likedSchemes.filter((_, i) => i !== index);
    setLikedSchemes(newLikedSchemes);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Palette size={24} className="mr-2" />
          <h1 className="text-2xl font-bold uppercase" style={{ fontFamily: 'Poppins, sans-serif' }}>Color Tinder</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 space-y-2">
            {Object.entries(currentScheme).map(([key, color]) => (
              <div key={key} className="h-12 rounded-lg" style={{ backgroundColor: color }}>
                <span className={`${key === 'neutral' ? 'text-gray-700' : 'text-white text-shadow'} pl-2 leading-[48px] capitalize`}>
                  {key} color
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center p-4 bg-gray-200">
            <button onClick={() => handleSwipe(false)} className="p-3 bg-red-500 text-white rounded-full mx-4">
              <X size={24} />
            </button>
            <button onClick={retrieveDisliked} className="p-3 bg-blue-500 text-white rounded-full mx-4">
              <RotateCcw size={24} />
            </button>
            <button onClick={() => handleSwipe(true)} className="p-3 bg-green-500 text-white rounded-full mx-4" disabled={likedSchemes.length >= 3}>
              <Check size={24} />
            </button>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Liked Schemes</h2>
            <button onClick={resetLikedSchemes} className="p-2 bg-gray-200 text-gray-700 rounded-full">
              <RefreshCw size={20} />
            </button>
          </div>
          <div className="flex justify-center space-x-4">
            {[0, 1, 2].map((index) => (
              <div key={index} className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-300 relative">
                {likedSchemes[index] ? (
                  <>
                    <div className="h-full flex flex-col">
                      {Object.values(likedSchemes[index]).map((color, colorIndex) => (
                        <div key={colorIndex} className="flex-1" style={{ backgroundColor: color }}></div>
                      ))}
                    </div>
                    <button 
                      onClick={() => removeLikedScheme(index)}
                      className="absolute top-0 right-0 bg-red-500 rounded-full p-1 m-1"
                    >
                      <X size={12} color="white" />
                    </button>
                  </>
                ) : (
                  <div className="h-full bg-gray-200"></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {combinedScheme && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-center">Harmonious Combined Scheme</h2>
            <div className="flex justify-center">
              <div className="w-full h-16 rounded-lg overflow-hidden flex">
                {Object.values(combinedScheme).map((color, index) => (
                  <div key={index} className="flex-1" style={{ backgroundColor: color }}></div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorTinder;