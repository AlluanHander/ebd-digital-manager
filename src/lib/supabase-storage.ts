
import { supabase } from '@/integrations/supabase/client';
import { User, Class, Student, Visitor, Announcement, Birthday, AttendanceRecord, Inventory } from '@/types';

// Utility functions
export const generateId = () => crypto.randomUUID();

export const getCurrentQuarter = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  return `${year}-Q${Math.floor(month / 3) + 1}`;
};

export const getCurrentWeek = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = (now.getTime() - startOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
};

// System Settings
export const getSecretaryCredentials = async () => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('secretary_username, secretary_password')
      .single();
    
    if (error) {
      console.error('Error fetching secretary credentials:', error);
      return { username: 'admin', password: '1234' };
    }
    
    return { username: data.secretary_username, password: data.secretary_password };
  } catch (error) {
    console.error('Error fetching secretary credentials:', error);
    return { username: 'admin', password: '1234' };
  }
};

export const setSecretaryCredentials = async (credentials: {username: string, password: string}) => {
  try {
    const { error } = await supabase
      .from('system_settings')
      .update({
        secretary_username: credentials.username,
        secretary_password: credentials.password,
        updated_at: new Date().toISOString()
      })
      .eq('id', (await supabase.from('system_settings').select('id').single()).data?.id);
    
    if (error) {
      console.error('Error updating secretary credentials:', error);
    }
  } catch (error) {
    console.error('Error updating secretary credentials:', error);
  }
};

export const getChurchName = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('church_name')
      .single();
    
    if (error) {
      console.error('Error fetching church name:', error);
      return '';
    }
    
    return data.church_name || '';
  } catch (error) {
    console.error('Error fetching church name:', error);
    return '';
  }
};

export const setChurchName = async (name: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('system_settings')
      .update({
        church_name: name,
        updated_at: new Date().toISOString()
      })
      .eq('id', (await supabase.from('system_settings').select('id').single()).data?.id);
    
    if (error) {
      console.error('Error updating church name:', error);
    }
  } catch (error) {
    console.error('Error updating church name:', error);
  }
};

// User management
export const getUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    return data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      password: user.password,
      phone: user.phone,
      type: user.type as 'professor' | 'secretario',
      churchName: user.church_name,
      classIds: [],
      createdAt: user.created_at
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const saveUser = async (user: User): Promise<void> => {
  try {
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      password: user.password,
      phone: user.phone,
      type: user.type,
      church_name: user.churchName,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('users')
      .upsert(userData, { onConflict: 'id' });
    
    if (error) {
      console.error('Error saving user:', error);
    } else {
      console.log('User saved successfully:', userData);
    }
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error('Error deleting user:', error);
    }
  } catch (error) {
    console.error('Error deleting user:', error);
  }
};

export const getProfessors = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('type', 'professor')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching professors:', error);
      return [];
    }
    
    return data.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      password: user.password,
      phone: user.phone,
      type: user.type as 'professor' | 'secretario',
      churchName: user.church_name,
      classIds: [],
      createdAt: user.created_at
    }));
  } catch (error) {
    console.error('Error fetching professors:', error);
    return [];
  }
};

export const findProfessorByCredentials = async (username: string, password: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('type', 'professor')
      .eq('username', username)
      .eq('password', password)
      .single();
    
    if (error) {
      console.error('Error finding professor:', error);
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      username: data.username,
      password: data.password,
      phone: data.phone,
      type: data.type as 'professor' | 'secretario',
      churchName: data.church_name,
      classIds: [],
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Error finding professor:', error);
    return null;
  }
};

// Classes management
export const getClasses = async (): Promise<Class[]> => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .select(`
        *,
        students(*),
        visitors(*),
        announcements(*),
        birthdays(*),
        inventory(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching classes:', error);
      return [];
    }
    
    return data.map(classData => ({
      id: classData.id,
      name: classData.name,
      teacherIds: classData.teacher_ids || [],
      teacherNames: classData.teacher_names || [],
      students: (classData.students || []).map((student: any) => ({
        id: student.id,
        name: student.name,
        classId: student.class_id,
        birthday: student.birthday,
        attendance: [],
        createdAt: student.created_at
      })),
      visitors: (classData.visitors || []).map((visitor: any) => ({
        id: visitor.id,
        name: visitor.name,
        classId: visitor.class_id,
        visitDate: visitor.visit_date,
        createdAt: visitor.created_at
      })),
      announcements: (classData.announcements || []).map((announcement: any) => ({
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        classId: announcement.class_id,
        createdBy: announcement.created_by,
        authorName: announcement.author_name,
        authorType: announcement.author_type as 'professor' | 'secretario',
        createdAt: announcement.created_at
      })),
      birthdays: (classData.birthdays || []).map((birthday: any) => ({
        id: birthday.id,
        studentId: birthday.student_id,
        studentName: birthday.student_name,
        classId: birthday.class_id,
        date: birthday.date,
        month: birthday.month,
        day: birthday.day,
        createdAt: birthday.created_at
      })),
      inventory: classData.inventory?.[0] ? {
        id: classData.inventory[0].id,
        classId: classData.inventory[0].class_id,
        bibles: classData.inventory[0].bibles,
        magazines: classData.inventory[0].magazines,
        offerings: classData.inventory[0].offerings,
        quarter: classData.inventory[0].quarter,
        lastUpdated: classData.inventory[0].last_updated
      } : {
        id: generateId(),
        classId: classData.id,
        bibles: 0,
        magazines: 0,
        offerings: 0,
        quarter: getCurrentQuarter(),
        lastUpdated: new Date().toISOString()
      },
      createdAt: classData.created_at
    }));
  } catch (error) {
    console.error('Error fetching classes:', error);
    return [];
  }
};

export const saveClass = async (classData: Class): Promise<void> => {
  try {
    const { error } = await supabase
      .from('classes')
      .upsert({
        id: classData.id,
        name: classData.name,
        teacher_ids: classData.teacherIds,
        teacher_names: classData.teacherNames,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    
    if (error) {
      console.error('Error saving class:', error);
    }
  } catch (error) {
    console.error('Error saving class:', error);
  }
};

export const deleteClass = async (classId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);
    
    if (error) {
      console.error('Error deleting class:', error);
    }
  } catch (error) {
    console.error('Error deleting class:', error);
  }
};

// Attendance management
export const saveAttendance = async (attendance: AttendanceRecord): Promise<void> => {
  try {
    const { error } = await supabase
      .from('attendance_records')
      .upsert({
        id: attendance.id,
        student_id: attendance.studentId,
        class_id: attendance.classId,
        date: attendance.date,
        present: attendance.present,
        week: attendance.week,
        quarter: attendance.quarter
      }, { onConflict: 'id' });
    
    if (error) {
      console.error('Error saving attendance:', error);
    }
  } catch (error) {
    console.error('Error saving attendance:', error);
  }
};

export const getAttendanceRecords = async (): Promise<AttendanceRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching attendance records:', error);
      return [];
    }
    
    return data.map(record => ({
      id: record.id,
      studentId: record.student_id,
      classId: record.class_id,
      date: record.date,
      present: record.present,
      week: record.week,
      quarter: record.quarter
    }));
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return [];
  }
};

// Local storage compatibility functions (for current user session)
const STORAGE_KEYS = {
  CURRENT_USER: 'ebd_current_user',
  LOGGED_PROFESSOR: 'ebd_logged_professor',
};

export const getCurrentUser = (): User | null => {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting current user from storage:`, error);
    return null;
  }
};

export const setCurrentUser = (user: User): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } catch (error) {
    console.error(`Error setting current user to storage:`, error);
  }
};

export const getLoggedProfessor = (): User | null => {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.LOGGED_PROFESSOR);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting logged professor from storage:`, error);
    return null;
  }
};

export const setLoggedProfessor = (professor: User): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGGED_PROFESSOR, JSON.stringify(professor));
  } catch (error) {
    console.error(`Error setting logged professor to storage:`, error);
  }
};

export const logout = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.LOGGED_PROFESSOR);
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

export const logoutProfessor = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.LOGGED_PROFESSOR);
  } catch (error) {
    console.error('Error during professor logout:', error);
  }
};

// Placeholder functions for deprecated localStorage functions
export const getSavedCredentials = () => null;
export const setSavedCredentials = () => {};
export const clearSavedCredentials = () => {};
