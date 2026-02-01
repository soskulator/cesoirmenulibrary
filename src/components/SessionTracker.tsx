import { useSessionTracking } from '@/hooks/useSessionTracking';

export function SessionTracker() {
  // This component just activates the session tracking hook
  useSessionTracking();
  return null;
}
