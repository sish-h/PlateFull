/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// App-specific colors for consistency - FIXED STRUCTURE
export const colors = {
  primary: '#F8930F',
  primaryDark: '#F8930F',
  secondary: '#FF6B6B',
  secondaryDark: '#E55555',
  accent: '#FFE66D',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  whiteGrey: '#E7E7E6',
  goldB: '#E5A339',
  
  // FIXED: Use string values instead of object
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  backgroundDark: '#151718',
  
  text: {
    primary: '#2C3E50',
    secondary: '#7F8C8D',
    inverse: '#FFFFFF',
    muted: '#95A5A6',
    disabled: '#BDC3C7',
    grey: '#687076',
  },
  
  // FIXED: Use string values instead of object  
  border: '#E1E8ED',
  borderMedium: '#D0D7DE',
  borderDark: '#8B9DC3',
  
  // FIXED: Added missing shadow properties
  shadow: {
    light: '#000000',
    dark: '#000000',
  },
  
  food: {
    fruits: '#FF6B6B',
    vegetables: '#4ECDC4',
    proteins: '#FFA07A', 
    grains: '#D4B5A0',
    dairy: '#FFF8DC',
    fats: '#FFE66D',
  },
  
  gamification: {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    xp: '#9B59B6',
    streak: '#E74C3C',
  },
  
  gradients: {
    primary: ['#4ECDC4', '#F8930F'] as const,
    secondary: ['#FF6B6B', '#E55555'] as const,
    accent: ['#FFE66D', '#F4D03F'] as const,
    success: ['#4CAF50', '#45A049'] as const,
    food: ['#FF8A80', '#FF5722'] as const,
    white: ['#FFFFFF1A', '#FFFFFF80', '#FFFFFF1A'] as const,
  },
}; 