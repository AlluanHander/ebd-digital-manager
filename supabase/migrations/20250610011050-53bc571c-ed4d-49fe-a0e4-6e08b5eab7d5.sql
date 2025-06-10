
-- Criar tabelas para usuários (professores e secretários)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  phone TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('professor', 'secretario')),
  church_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para classes
CREATE TABLE public.classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  teacher_ids TEXT[] DEFAULT '{}',
  teacher_names TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para estudantes
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  birthday TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para visitantes
CREATE TABLE public.visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  visit_date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para avisos
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  author_name TEXT,
  author_type TEXT CHECK (author_type IN ('professor', 'secretario')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para aniversários
CREATE TABLE public.birthdays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  month INTEGER NOT NULL,
  day INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para registros de presença
CREATE TABLE public.attendance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  present BOOLEAN NOT NULL,
  week INTEGER NOT NULL,
  quarter TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para inventário
CREATE TABLE public.inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  bibles INTEGER NOT NULL DEFAULT 0,
  magazines INTEGER NOT NULL DEFAULT 0,
  offerings INTEGER NOT NULL DEFAULT 0,
  quarter TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para configurações do sistema
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_name TEXT,
  secretary_username TEXT NOT NULL DEFAULT 'admin',
  secretary_password TEXT NOT NULL DEFAULT '1234',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir configurações padrão
INSERT INTO public.system_settings (church_name, secretary_username, secretary_password)
VALUES ('Igreja Local', 'admin', '1234');

-- Habilitar Row Level Security (RLS) para todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthdays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Criar políticas permissivas para todas as tabelas (acesso público)
-- Nota: Em um ambiente de produção, você pode querer políticas mais restritivas

CREATE POLICY "Allow all operations on users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on classes" ON public.classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on visitors" ON public.visitors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on birthdays" ON public.birthdays FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on attendance_records" ON public.attendance_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on inventory" ON public.inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on system_settings" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);

-- Habilitar realtime para todas as tabelas
ALTER TABLE public.users REPLICA IDENTITY FULL;
ALTER TABLE public.classes REPLICA IDENTITY FULL;
ALTER TABLE public.students REPLICA IDENTITY FULL;
ALTER TABLE public.visitors REPLICA IDENTITY FULL;
ALTER TABLE public.announcements REPLICA IDENTITY FULL;
ALTER TABLE public.birthdays REPLICA IDENTITY FULL;
ALTER TABLE public.attendance_records REPLICA IDENTITY FULL;
ALTER TABLE public.inventory REPLICA IDENTITY FULL;
ALTER TABLE public.system_settings REPLICA IDENTITY FULL;

-- Adicionar tabelas à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.classes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
ALTER PUBLICATION supabase_realtime ADD TABLE public.visitors;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.birthdays;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;
