
-- Create table for storing group calls
CREATE TABLE public.group_calls (
  id text NOT NULL, -- room_id (8 chars)
  room_name text NOT NULL,
  host_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  created_at timestamp with time zone DEFAULT now(),
  ended_at timestamp with time zone,
  CONSTRAINT group_calls_pkey PRIMARY KEY (id),
  CONSTRAINT group_calls_host_fkey FOREIGN KEY (host_user_id) REFERENCES auth.users(id)
);

-- Create table for storing participants in group calls
CREATE TABLE public.group_call_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  call_id text NOT NULL,
  user_id uuid NOT NULL,
  joined_at timestamp with time zone DEFAULT now(),
  left_at timestamp with time zone,
  CONSTRAINT group_call_participants_pkey PRIMARY KEY (id),
  CONSTRAINT group_call_participants_call_fkey FOREIGN KEY (call_id) REFERENCES public.group_calls(id) ON DELETE CASCADE,
  CONSTRAINT group_call_participants_user_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.group_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_call_participants ENABLE ROW LEVEL SECURITY;

-- Policies for group_calls
-- Viewer: Authenticated users can view calls they are part of or hosted (simplified: all auth users can view for now to make history listing easier, or specific logic)
CREATE POLICY "Users can view all calls" ON public.group_calls
  FOR SELECT USING (auth.role() = 'authenticated');

-- Creator: Users can create calls
CREATE POLICY "Users can insert calls" ON public.group_calls
  FOR INSERT WITH CHECK (auth.uid() = host_user_id);

-- Updater: Only host can update (e.g., end call)
CREATE POLICY "Hosts can update their calls" ON public.group_calls
  FOR UPDATE USING (auth.uid() = host_user_id);

-- Policies for group_call_participants
CREATE POLICY "Users can view participants" ON public.group_call_participants
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can join calls" ON public.group_call_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);
