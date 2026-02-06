-- Add missing role values to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'server';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'bartender';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'server_assistant';