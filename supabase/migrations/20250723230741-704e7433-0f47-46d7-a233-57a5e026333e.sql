-- Criar tabela para mensagens entre secretário e professor
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id uuid NOT NULL,
  from_user_name text NOT NULL,
  from_user_type text NOT NULL,
  to_user_id uuid,
  to_user_name text,
  to_user_type text,
  content text NOT NULL,
  message_type text NOT NULL DEFAULT 'direct', -- 'direct' ou 'broadcast'
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  read_at timestamp with time zone
);

-- Ativar RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações
CREATE POLICY "Allow all operations on messages"
ON public.messages 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Configurar realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;