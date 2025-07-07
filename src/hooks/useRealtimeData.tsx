
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Class } from '@/types';
import { getUsers, getClasses } from '@/lib/supabase-storage';

export const useRealtimeUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial data immediately
    const loadInitialData = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
        console.log('✅ Dados iniciais de usuários carregados:', data);
        setLoading(false);
      } catch (error) {
        console.error('❌ Erro ao carregar dados iniciais:', error);
        setLoading(false);
      }
    };

    loadInitialData();

    // Set up realtime subscription for users table
    const channel = supabase
      .channel('realtime-users', {
        config: {
          broadcast: { self: false },
          presence: { key: 'users' }
        }
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        async (payload) => {
          console.log('🔄 Mudança detectada na tabela users:', payload);
          try {
            // Reload all users data when any change occurs
            const updatedData = await getUsers();
            setUsers(updatedData);
            console.log('✅ Dados de usuários sincronizados em tempo real:', updatedData);
          } catch (error) {
            console.error('❌ Erro ao sincronizar dados de usuários:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da conexão realtime de usuários:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Conectado ao realtime de usuários!');
        }
      });

    return () => {
      console.log('🔌 Desconectando canal de usuários');
      supabase.removeChannel(channel);
    };
  }, []);

  const refetch = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao refetch usuários:', error);
      return [];
    }
  };

  return { users, loading, refetch };
};

export const useRealtimeClasses = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial data immediately
    const loadInitialData = async () => {
      try {
        const data = await getClasses();
        setClasses(data);
        console.log('✅ Dados iniciais de classes carregados:', data);
        setLoading(false);
      } catch (error) {
        console.error('❌ Erro ao carregar dados iniciais de classes:', error);
        setLoading(false);
      }
    };

    loadInitialData();

    // Set up realtime subscriptions for all class-related tables
    const classesChannel = supabase
      .channel('realtime-classes', {
        config: {
          broadcast: { self: false },
          presence: { key: 'classes' }
        }
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'classes'
        },
        async (payload) => {
          console.log('🔄 Mudança na tabela classes:', payload);
          await reloadClassesData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'students'
        },
        async (payload) => {
          console.log('🔄 Mudança na tabela students:', payload);
          await reloadClassesData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'visitors'
        },
        async (payload) => {
          console.log('🔄 Mudança na tabela visitors:', payload);
          await reloadClassesData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements'
        },
        async (payload) => {
          console.log('🔄 Mudança na tabela announcements:', payload);
          await reloadClassesData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'birthdays'
        },
        async (payload) => {
          console.log('🔄 Mudança na tabela birthdays:', payload);
          await reloadClassesData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory'
        },
        async (payload) => {
          console.log('🔄 Mudança na tabela inventory:', payload);
          await reloadClassesData();
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da conexão realtime de classes:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Conectado ao realtime de classes!');
        }
      });

    const reloadClassesData = async () => {
      try {
        const updatedData = await getClasses();
        setClasses(updatedData);
        console.log('✅ Dados de classes sincronizados em tempo real:', updatedData);
      } catch (error) {
        console.error('❌ Erro ao sincronizar dados de classes:', error);
      }
    };

    return () => {
      console.log('🔌 Desconectando canal de classes');
      supabase.removeChannel(classesChannel);
    };
  }, []);

  const refetch = async () => {
    try {
      const data = await getClasses();
      setClasses(data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao refetch classes:', error);
      return [];
    }
  };

  return { classes, loading, refetch };
};

export const useRealtimeSystemSettings = () => {
  const [churchName, setChurchName] = useState<string>('');
  const [secretaryCredentials, setSecretaryCredentials] = useState({ username: 'admin', password: '1234' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial data immediately
    const loadInitialSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('*')
          .single();
        
        if (data && !error) {
          setChurchName(data.church_name || '');
          setSecretaryCredentials({
            username: data.secretary_username || 'admin',
            password: data.secretary_password || '1234'
          });
          console.log('✅ Configurações do sistema carregadas:', data);
        }
        setLoading(false);
      } catch (error) {
        console.error('❌ Erro ao carregar configurações:', error);
        setLoading(false);
      }
    };

    loadInitialSettings();

    // Set up realtime subscription for system settings
    const channel = supabase
      .channel('realtime-settings', {
        config: {
          broadcast: { self: false },
          presence: { key: 'settings' }
        }
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings'
        },
        async (payload) => {
          console.log('🔄 Configurações do sistema mudaram:', payload);
          if (payload.new) {
            const newData = payload.new as any;
            setChurchName(newData.church_name || '');
            setSecretaryCredentials({
              username: newData.secretary_username || 'admin',
              password: newData.secretary_password || '1234'
            });
            console.log('✅ Configurações sincronizadas em tempo real:', newData);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da conexão realtime de configurações:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Conectado ao realtime de configurações!');
        }
      });

    return () => {
      console.log('🔌 Desconectando canal de configurações');
      supabase.removeChannel(channel);
    };
  }, []);

  return { churchName, secretaryCredentials, loading };
};
