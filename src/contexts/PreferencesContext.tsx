import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { UserPreferences } from '@/types';

// Initial state
const initialPreferences: UserPreferences = {
  theme: 'system',
  language: 'no',
  density: 'comfortable',
  notifications: {
    email: true,
    push: true,
    statusUpdates: true,
    supplierResponses: true,
    overdueAlerts: true,
  },
  dashboard: {
    widgets: ['recent-claims', 'pending-approvals', 'statistics', 'notifications'],
    layout: 'grid',
  },
};

// Action types
type PreferencesAction = 
  | { type: 'SET_THEME'; payload: UserPreferences['theme'] }
  | { type: 'SET_LANGUAGE'; payload: UserPreferences['language'] }
  | { type: 'SET_DENSITY'; payload: UserPreferences['density'] }
  | { type: 'UPDATE_NOTIFICATIONS'; payload: Partial<UserPreferences['notifications']> }
  | { type: 'UPDATE_DASHBOARD'; payload: Partial<UserPreferences['dashboard']> }
  | { type: 'LOAD_PREFERENCES'; payload: UserPreferences }
  | { type: 'RESET_PREFERENCES' };

// Reducer
const preferencesReducer = (state: UserPreferences, action: PreferencesAction): UserPreferences => {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_DENSITY':
      return { ...state, density: action.payload };
    case 'UPDATE_NOTIFICATIONS':
      return { 
        ...state, 
        notifications: { ...state.notifications, ...action.payload } 
      };
    case 'UPDATE_DASHBOARD':
      return { 
        ...state, 
        dashboard: { ...state.dashboard, ...action.payload } 
      };
    case 'LOAD_PREFERENCES':
      return action.payload;
    case 'RESET_PREFERENCES':
      return initialPreferences;
    default:
      return state;
  }
};

// Context
interface PreferencesContextType {
  preferences: UserPreferences;
  setTheme: (theme: UserPreferences['theme']) => void;
  setLanguage: (language: UserPreferences['language']) => void;
  setDensity: (density: UserPreferences['density']) => void;
  updateNotifications: (notifications: Partial<UserPreferences['notifications']>) => void;
  updateDashboard: (dashboard: Partial<UserPreferences['dashboard']>) => void;
  resetPreferences: () => void;
}

const PreferencesContext = createContext<PreferencesContextType | null>(null);

// Provider component
interface PreferencesProviderProps {
  children: React.ReactNode;
}

export const PreferencesProvider: React.FC<PreferencesProviderProps> = ({ children }) => {
  const [preferences, dispatch] = useReducer(preferencesReducer, initialPreferences);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user-preferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        dispatch({ type: 'LOAD_PREFERENCES', payload: { ...initialPreferences, ...parsed } });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('user-preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }, [preferences]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else if (preferences.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const updateTheme = (e: MediaQueryListEvent) => {
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };

      // Set initial theme
      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // Listen for changes
      mediaQuery.addEventListener('change', updateTheme);
      return () => mediaQuery.removeEventListener('change', updateTheme);
    }
  }, [preferences.theme]);

  // Apply density to document
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-density', preferences.density);
  }, [preferences.density]);

  const contextValue: PreferencesContextType = {
    preferences,
    setTheme: (theme) => dispatch({ type: 'SET_THEME', payload: theme }),
    setLanguage: (language) => dispatch({ type: 'SET_LANGUAGE', payload: language }),
    setDensity: (density) => dispatch({ type: 'SET_DENSITY', payload: density }),
    updateNotifications: (notifications) => dispatch({ type: 'UPDATE_NOTIFICATIONS', payload: notifications }),
    updateDashboard: (dashboard) => dispatch({ type: 'UPDATE_DASHBOARD', payload: dashboard }),
    resetPreferences: () => dispatch({ type: 'RESET_PREFERENCES' }),
  };

  return (
    <PreferencesContext.Provider value={contextValue}>
      {children}
    </PreferencesContext.Provider>
  );
};

// Hook to use preferences
export const usePreferences = (): PreferencesContextType => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};