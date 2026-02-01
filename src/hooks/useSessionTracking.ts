import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const INACTIVITY_TIMEOUT = 120000; // 2 minutes of inactivity ends session

export function useSessionTracking() {
  const { user } = useAuth();
  const sessionIdRef = useRef<string | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateLastActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  const startSession = useCallback(async () => {
    if (!user || sessionIdRef.current) return;

    try {
      // End any stale active sessions for this user first
      await supabase
        .from('user_sessions')
        .update({ 
          is_active: false,
          session_end: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_active', true);

      // Create new session
      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          session_start: new Date().toISOString(),
          last_heartbeat: new Date().toISOString(),
          is_active: true,
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error starting session:', error);
        return;
      }

      sessionIdRef.current = data.id;
      console.log('Session started:', data.id);
    } catch (error) {
      console.error('Error starting session:', error);
    }
  }, [user]);

  const sendHeartbeat = useCallback(async () => {
    if (!sessionIdRef.current || !user) return;

    const now = Date.now();
    const timeSinceActivity = now - lastActivityRef.current;

    // If user has been inactive too long, end the session
    if (timeSinceActivity > INACTIVITY_TIMEOUT) {
      await endSession();
      return;
    }

    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({
          last_heartbeat: new Date().toISOString(),
          duration_seconds: Math.floor((now - (await getSessionStart())) / 1000),
        })
        .eq('id', sessionIdRef.current);

      if (error) {
        console.error('Error sending heartbeat:', error);
      }
    } catch (error) {
      console.error('Error sending heartbeat:', error);
    }
  }, [user]);

  const getSessionStart = async (): Promise<number> => {
    if (!sessionIdRef.current) return Date.now();

    const { data } = await supabase
      .from('user_sessions')
      .select('session_start')
      .eq('id', sessionIdRef.current)
      .single();

    return data ? new Date(data.session_start).getTime() : Date.now();
  };

  const endSession = useCallback(async () => {
    if (!sessionIdRef.current) return;

    try {
      const sessionStart = await getSessionStart();
      const duration = Math.floor((Date.now() - sessionStart) / 1000);

      await supabase
        .from('user_sessions')
        .update({
          is_active: false,
          session_end: new Date().toISOString(),
          duration_seconds: duration,
        })
        .eq('id', sessionIdRef.current);

      console.log('Session ended:', sessionIdRef.current, 'Duration:', duration, 'seconds');
      sessionIdRef.current = null;
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    // Start session when user logs in
    startSession();

    // Set up heartbeat interval
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // Track user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    activityEvents.forEach(event => {
      window.addEventListener(event, updateLastActivity, { passive: true });
    });

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, send final heartbeat
        sendHeartbeat();
      } else {
        // Page is visible again, update activity
        updateLastActivity();
        // If session was ended due to inactivity, start new one
        if (!sessionIdRef.current) {
          startSession();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle page unload
    const handleBeforeUnload = () => {
      if (sessionIdRef.current) {
        // Use sendBeacon for reliable data sending on page close
        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_sessions?id=eq.${sessionIdRef.current}`;
        const data = JSON.stringify({
          is_active: false,
          session_end: new Date().toISOString(),
        });
        
        navigator.sendBeacon(url, new Blob([data], { type: 'application/json' }));
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Cleanup
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      activityEvents.forEach(event => {
        window.removeEventListener(event, updateLastActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // End session on unmount
      endSession();
    };
  }, [user, startSession, sendHeartbeat, endSession, updateLastActivity]);

  return { endSession };
}
