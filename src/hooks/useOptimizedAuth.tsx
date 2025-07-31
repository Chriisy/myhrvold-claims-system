import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useRef } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'technician' | 'admin' | 'saksbehandler';
  department: 'oslo' | 'bergen' | 'trondheim' | 'stavanger' | 'kristiansand' | 'nord_norge' | 'innlandet' | 'vestfold' | 'agder' | 'ekstern';
  is_active: boolean;
  created_date: string;
  last_login?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  retryProfileFetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  error: null,
  signOut: async () => {},
  retryProfileFetch: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Profile cache to prevent redundant requests
const profileCache = new Map<string, { data: Profile | null; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const RETRY_DELAY = 2000; // 2 seconds

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs to prevent memory leaks and duplicate requests
  const mountedRef = useRef(true);
  const profileFetchingRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced and cached profile fetcher
  const fetchProfile = useCallback(async (userId: string, retries = 0): Promise<Profile | null> => {
    if (!mountedRef.current || profileFetchingRef.current) return null;

    // Check cache first
    const cached = profileCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    profileFetchingRef.current = true;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching profile:', error);
        }
        
        // Retry logic for network errors
        if (retries < 3 && (error.message.includes('NetworkError') || error.message.includes('fetch'))) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retries + 1)));
          return fetchProfile(userId, retries + 1);
        }
        
        setError(`Failed to load profile: ${error.message}`);
        return null;
      }

      // Cache the result
      profileCache.set(userId, { data, timestamp: Date.now() });
      setError(null);
      return data;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error in fetchProfile:', error);
      }
      
      // Retry for network errors
      if (retries < 3) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retries + 1)));
        return fetchProfile(userId, retries + 1);
      }
      
      setError('Network error. Please check your connection.');
      return null;
    } finally {
      profileFetchingRef.current = false;
    }
  }, []);

  // Manual retry function
  const retryProfileFetch = useCallback(async () => {
    if (session?.user?.id) {
      setError(null);
      setLoading(true);
      const profileData = await fetchProfile(session.user.id);
      if (mountedRef.current) {
        setProfile(profileData);
        setLoading(false);
      }
    }
  }, [session?.user?.id, fetchProfile]);

  // Optimized auth state handler
  const handleAuthChange = useCallback(async (event: string, session: Session | null) => {
    if (!mountedRef.current) return;
    
    
    // Clear any pending retries
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    setSession(session);
    setUser(session?.user ?? null);
    setError(null);
    
    if (session?.user) {
      // Defer profile fetching to prevent auth deadlock
      setTimeout(async () => {
        if (!mountedRef.current) return;
        
        try {
          const profileData = await fetchProfile(session.user.id);
          if (mountedRef.current) {
            setProfile(profileData);
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error loading profile:', error);
          }
          if (mountedRef.current) {
            setProfile(null);
            setError('Failed to load user profile');
          }
        } finally {
          if (mountedRef.current) {
            setLoading(false);
          }
        }
      }, 0);
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [fetchProfile]);

  useEffect(() => {
    mountedRef.current = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Get initial session with error handling
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error getting initial session:', error);
          }
          if (mountedRef.current) {
            setError('Failed to initialize authentication');
            setLoading(false);
          }
          return;
        }

        if (!mountedRef.current) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          if (mountedRef.current) {
            setProfile(profileData);
          }
        } else {
          setProfile(null);
        }
        
        if (mountedRef.current) {
          setLoading(false);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error initializing auth:', error);
        }
        if (mountedRef.current) {
          setError('Failed to initialize authentication');
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      subscription.unsubscribe();
    };
  }, [handleAuthChange, fetchProfile]);

  const signOut = useCallback(async () => {
    try {
      // Clear cache
      profileCache.clear();
      
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setError(null);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error signing out:', error);
      }
      setError('Failed to sign out');
    }
  }, []);

  const value = {
    user,
    session,
    profile,
    loading,
    error,
    signOut,
    retryProfileFetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};