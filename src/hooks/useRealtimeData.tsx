
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
        console.log('✅ [REALTIME] Dados iniciais de usuários carregados:', data.length, 'usuários');
        setLoading(false);
      } catch (error) {
        console.error('❌ [REALTIME] Erro ao carregar dados iniciais:', error);
        setLoading(false);
      }
    };

    loadInitialData();

    // Set up realtime subscription for users table
    const channel = supabase
      .channel('public:users')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        async (payload) => {
          console.log('🔄 [REALTIME] Mudança detectada na tabela users:', payload.eventType, payload);
          try {
            // Reload all users data when any change occurs
            const updatedData = await getUsers();
            setUsers(updatedData);
            console.log('✅ [REALTIME] Dados de usuários sincronizados:', updatedData.length, 'usuários');
          } catch (error) {
            console.error('❌ [REALTIME] Erro ao sincronizar dados de usuários:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 [REALTIME] Status da conexão de usuários:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ [REALTIME] Conectado ao canal de usuários!');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ [REALTIME] Erro no canal de usuários');
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ [REALTIME] Timeout no canal de usuários');
        }
      });

    return () => {
      console.log('🔌 [REALTIME] Desconectando canal de usuários');
      supabase.removeChannel(channel);
    };
  }, []);

  const refetch = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
      console.log('🔄 [REALTIME] Refetch manual de usuários:', data.length);
      return data;
    } catch (error) {
      console.error('❌ [REALTIME] Erro ao refetch usuários:', error);
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
        console.log('✅ [REALTIME] Dados iniciais de classes carregados:', data.length, 'classes');
        setLoading(false);
      } catch (error) {
        console.error('❌ [REALTIME] Erro ao carregar dados iniciais de classes:', error);
        setLoading(false);
      }
    };

    loadInitialData();

    // Set up realtime subscriptions for all class-related tables
    const channels = [];

    // Classes table
    const classesChannel = supabase
      .channel('public:classes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'classes'
        },
        async (payload) => {
          console.log('🔄 [REALTIME] Mudança na tabela classes:', payload.eventType);
          await reloadClassesData();
        }
      )
      .subscribe();
    channels.push(classesChannel);

    // Students table
    const studentsChannel = supabase
      .channel('public:students')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'students'
        },
        async (payload) => {
          console.log('🔄 [REALTIME] Mudança na tabela students:', payload.eventType);
          await reloadClassesData();
        }
      )
      .subscribe();
    channels.push(studentsChannel);

    // Visitors table
    const visitorsChannel = supabase
      .channel('public:visitors')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'visitors'
        },
        async (payload) => {
          console.log('🔄 [REALTIME] Mudança na tabela visitors:', payload.eventType);
          await reloadClassesData();
        }
      )
      .subscribe();
    channels.push(visitorsChannel);

    // Announcements table
    const announcementsChannel = supabase
      .channel('public:announcements')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements'
        },
        async (payload) => {
          console.log('🔄 [REALTIME] Mudança na tabela announcements:', payload.eventType);
          await reloadClassesData();
        }
      )
      .subscribe();
    channels.push(announcementsChannel);

    // Birthdays table
    const birthdaysChannel = supabase
      .channel('public:birthdays')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'birthdays'
        },
        async (payload) => {
          console.log('🔄 [REALTIME] Mudança na tabela birthdays:', payload.eventType);
          await reloadClassesData();
        }
      )
      .subscribe();
    channels.push(birthdaysChannel);

    // Inventory table
    const inventoryChannel = supabase
      .channel('public:inventory')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory'
        },
        async (payload) => {
          console.log('🔄 [REALTIME] Mudança na tabela inventory:', payload.eventType);
          await reloadClassesData();
        }
      )
      .subscribe();
    channels.push(inventoryChannel);

    const reloadClassesData = async () => {
      try {
        const updatedData = await getClasses();
        setClasses(updatedData);
        console.log('✅ [REALTIME] Dados de classes sincronizados:', updatedData.length, 'classes');
      } catch (error) {
        console.error('❌ [REALTIME] Erro ao sincronizar dados de classes:', error);
      }
    };

    return () => {
      console.log('🔌 [REALTIME] Desconectando canais de classes');
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, []);

  const refetch = async () => {
    try {
      const data = await getClasses();
      setClasses(data);
      console.log('🔄 [REALTIME] Refetch manual de classes:', data.length);
      return data;
    } catch (error) {
      console.error('❌ [REALTIME] Erro ao refetch classes:', error);
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
          console.log('✅ [REALTIME] Configurações do sistema carregadas:', data);
        }
        setLoading(false);
      } catch (error) {
        console.error('❌ [REALTIME] Erro ao carregar configurações:', error);
        setLoading(false);
      }
    };

    loadInitialSettings();

    // Set up realtime subscription for system settings
    const channel = supabase
      .channel('public:system_settings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings'
        },
        async (payload) => {
          console.log('🔄 [REALTIME] Configurações do sistema mudaram:', payload.eventType, payload);
          if (payload.new) {
            const newData = payload.new as any;
            setChurchName(newData.church_name || '');
            setSecretaryCredentials({
              username: newData.secretary_username || 'admin',
              password: newData.secretary_password || '1234'
            });
            console.log('✅ [REALTIME] Configurações sincronizadas:', newData);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 [REALTIME] Status da conexão de configurações:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ [REALTIME] Conectado ao canal de configurações!');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ [REALTIME] Erro no canal de configurações');
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ [REALTIME] Timeout no canal de configurações');
        }
      });

    return () => {
      console.log('🔌 [REALTIME] Desconectando canal de configurações');
      supabase.removeChannel(channel);
    };
  }, []);

  return { churchName, secretaryCredentials, loading };
};
