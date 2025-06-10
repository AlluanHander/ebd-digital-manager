
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Class } from '@/types';
import { getUsers, getClasses } from '@/lib/storage';

export const useRealtimeUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial data
    const loadUsers = async () => {
      const data = await getUsers();
      setUsers(data);
      setLoading(false);
    };
    loadUsers();

    // Set up realtime subscription
    const channel = supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        async (payload) => {
          console.log('Users table changed:', payload);
          // Reload data when changes occur
          const updatedData = await getUsers();
          setUsers(updatedData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { users, loading, refetch: async () => {
    const data = await getUsers();
    setUsers(data);
  }};
};

export const useRealtimeClasses = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial data
    const loadClasses = async () => {
      const data = await getClasses();
      setClasses(data);
      setLoading(false);
    };
    loadClasses();

    // Set up realtime subscriptions for all related tables
    const classesChannel = supabase
      .channel('classes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'classes'
        },
        async (payload) => {
          console.log('Classes table changed:', payload);
          const updatedData = await getClasses();
          setClasses(updatedData);
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
          console.log('Students table changed:', payload);
          const updatedData = await getClasses();
          setClasses(updatedData);
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
          console.log('Visitors table changed:', payload);
          const updatedData = await getClasses();
          setClasses(updatedData);
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
          console.log('Announcements table changed:', payload);
          const updatedData = await getClasses();
          setClasses(updatedData);
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
          console.log('Birthdays table changed:', payload);
          const updatedData = await getClasses();
          setClasses(updatedData);
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
          console.log('Inventory table changed:', payload);
          const updatedData = await getClasses();
          setClasses(updatedData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(classesChannel);
    };
  }, []);

  return { classes, loading, refetch: async () => {
    const data = await getClasses();
    setClasses(data);
  }};
};

export const useRealtimeSystemSettings = () => {
  const [churchName, setChurchName] = useState<string>('');
  const [secretaryCredentials, setSecretaryCredentials] = useState({ username: 'admin', password: '1234' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial data
    const loadSettings = async () => {
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
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading system settings:', error);
        setLoading(false);
      }
    };
    loadSettings();

    // Set up realtime subscription
    const channel = supabase
      .channel('system-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings'
        },
        async (payload) => {
          console.log('System settings changed:', payload);
          // Reload settings when changes occur
          if (payload.new) {
            setChurchName((payload.new as any).church_name || '');
            setSecretaryCredentials({
              username: (payload.new as any).secretary_username || 'admin',
              password: (payload.new as any).secretary_password || '1234'
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { churchName, secretaryCredentials, loading };
};
