-- Create user_sessions table to track active time on the portal
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,
  last_heartbeat TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON public.user_sessions(is_active) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions"
ON public.user_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
ON public.user_sessions
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
ON public.user_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all sessions
CREATE POLICY "Admins can view all sessions"
ON public.user_sessions
FOR SELECT
USING (is_admin(auth.uid()));

-- Admins can delete sessions (for cleanup)
CREATE POLICY "Admins can delete sessions"
ON public.user_sessions
FOR DELETE
USING (is_admin(auth.uid()));