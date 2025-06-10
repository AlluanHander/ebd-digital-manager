import { User, Class, Student, Visitor, Announcement, Birthday, AttendanceRecord, Inventory } from '@/types';

// Re-export everything from supabase-storage for compatibility
export * from './supabase-storage';

// Keep existing localStorage functions for backward compatibility
const STORAGE_KEYS = {
  SAVED_CREDENTIALS: 'ebd_saved_credentials',
};

// Utility functions
export const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

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

// Storage functions
export const getStorageItem = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting ${key} from storage:`, error);
    return null;
  }
};

export const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    console.log(`Saved to localStorage [${key}]:`, value);
  } catch (error) {
    console.error(`Error setting ${key} to storage:`, error);
  }
};

export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from storage:`, error);
  }
};

// Credenciais do secretário
export const getSecretaryCredentials = () => {
  return getStorageItem<{username: string, password: string}>(STORAGE_KEYS.SECRETARY_CREDENTIALS) || { username: 'admin', password: '1234' };
};

export const setSecretaryCredentials = (credentials: {username: string, password: string}) => {
  setStorageItem(STORAGE_KEYS.SECRETARY_CREDENTIALS, credentials);
};

// User management - FONTE ÚNICA DE VERDADE
export const getUsers = (): User[] => {
  return getStorageItem<User[]>(STORAGE_KEYS.USERS) || [];
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id || u.username === user.username);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  setStorageItem(STORAGE_KEYS.USERS, users);
  console.log('Usuário salvo:', user);
  console.log('Todos os usuários:', users);
};

export const deleteUser = (userId: string): void => {
  const users = getUsers().filter(u => u.id !== userId);
  setStorageItem(STORAGE_KEYS.USERS, users);
  console.log('Usuário removido, usuários restantes:', users);
};

// Funções específicas para professores - usa a mesma fonte
export const getProfessors = (): User[] => {
  const allUsers = getUsers();
  const professors = allUsers.filter(u => u.type === 'professor');
  console.log('Professores encontrados:', professors);
  return professors;
};

export const findProfessorByCredentials = (username: string, password: string): User | null => {
  const professors = getProfessors();
  console.log('Procurando professor com credenciais:', { username, password });
  console.log('Professores disponíveis:', professors);
  
  const professor = professors.find(p => 
    p.username === username && 
    p.password === password
  );
  
  console.log('Professor encontrado:', professor);
  return professor || null;
};

export const setLoggedProfessor = (professor: User): void => {
  console.log('Salvando professor logado:', professor);
  setStorageItem(STORAGE_KEYS.LOGGED_PROFESSOR, professor);
};

export const getLoggedProfessor = (): User | null => {
  const professor = getStorageItem<User>(STORAGE_KEYS.LOGGED_PROFESSOR);
  console.log('Professor logado carregado:', professor);
  return professor;
};

export const logoutProfessor = (): void => {
  console.log('Fazendo logout do professor');
  removeStorageItem(STORAGE_KEYS.LOGGED_PROFESSOR);
};

export const getCurrentUser = (): User | null => {
  return getStorageItem<User>(STORAGE_KEYS.CURRENT_USER);
};

export const setCurrentUser = (user: User): void => {
  setStorageItem(STORAGE_KEYS.CURRENT_USER, user);
};

export const logout = (): void => {
  removeStorageItem(STORAGE_KEYS.CURRENT_USER);
  logoutProfessor();
};

// Church management
export const getChurchName = (): string => {
  return getStorageItem<string>(STORAGE_KEYS.CHURCH_NAME) || '';
};

export const setChurchName = (name: string): void => {
  setStorageItem(STORAGE_KEYS.CHURCH_NAME, name);
};

// Classes management
export const getClasses = (): Class[] => {
  return getStorageItem<Class[]>(STORAGE_KEYS.CLASSES) || [];
};

export const saveClass = (classData: Class): void => {
  const classes = getClasses();
  const existingIndex = classes.findIndex(c => c.id === classData.id);
  
  if (existingIndex >= 0) {
    classes[existingIndex] = classData;
  } else {
    classes.push(classData);
  }
  
  setStorageItem(STORAGE_KEYS.CLASSES, classes);
};

export const deleteClass = (classId: string): void => {
  const classes = getClasses().filter(c => c.id !== classId);
  setStorageItem(STORAGE_KEYS.CLASSES, classes);
};

// Attendance management
export const saveAttendance = (attendance: AttendanceRecord): void => {
  const records = getStorageItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE) || [];
  const existingIndex = records.findIndex(r => 
    r.studentId === attendance.studentId && 
    r.date === attendance.date
  );
  
  if (existingIndex >= 0) {
    records[existingIndex] = attendance;
  } else {
    records.push(attendance);
  }
  
  setStorageItem(STORAGE_KEYS.ATTENDANCE, records);
};

export const getAttendanceRecords = (): AttendanceRecord[] => {
  return getStorageItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE) || [];
};

// Saved credentials
export const getSavedCredentials = () => {
  try {
    const item = localStorage.getItem(STORAGE_KEYS.SAVED_CREDENTIALS);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error getting saved credentials:', error);
    return null;
  }
};

export const setSavedCredentials = (email: string, password: string) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_CREDENTIALS, JSON.stringify({email, password}));
  } catch (error) {
    console.error('Error setting saved credentials:', error);
  }
};

export const clearSavedCredentials = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.SAVED_CREDENTIALS);
  } catch (error) {
    console.error('Error clearing saved credentials:', error);
  }
};
