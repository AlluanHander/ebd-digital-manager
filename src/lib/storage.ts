
import { User, Class, Student, Visitor, Announcement, Birthday, AttendanceRecord, Inventory } from '@/types';

const STORAGE_KEYS = {
  USERS: 'ebd_users',
  CLASSES: 'ebd_classes',
  CURRENT_USER: 'ebd_current_user',
  CHURCH_NAME: 'ebd_church_name',
  SAVED_CREDENTIALS: 'ebd_saved_credentials',
  ATTENDANCE: 'ebd_attendance',
  VISITORS: 'ebd_visitors',
  ANNOUNCEMENTS: 'ebd_announcements',
  BIRTHDAYS: 'ebd_birthdays',
  INVENTORY: 'ebd_inventory',
  PROFESSORS: 'ebd_professors', // Nova chave específica para professores
  LOGGED_PROFESSOR: 'ebd_logged_professor', // Professor logado
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

// Funções específicas para professores
export const saveProfessor = (professor: User): void => {
  console.log('Salvando professor:', professor);
  const professores = getProfessors();
  const existingIndex = professores.findIndex(p => p.id === professor.id || p.username === professor.username);
  
  if (existingIndex >= 0) {
    professores[existingIndex] = professor;
  } else {
    professores.push(professor);
  }
  
  setStorageItem(STORAGE_KEYS.PROFESSORS, professores);
  console.log('Professores salvos no localStorage:', professores);
};

export const getProfessors = (): User[] => {
  const professores = getStorageItem<User[]>(STORAGE_KEYS.PROFESSORS) || [];
  console.log('Professores carregados do localStorage:', professores);
  return professores;
};

export const findProfessorByCredentials = (username: string, password: string): User | null => {
  const professores = getProfessors();
  console.log('Procurando professor com credenciais:', { username, password });
  console.log('Professores disponíveis:', professores);
  
  const professor = professores.find(p => 
    p.username === username && 
    p.password === password &&
    p.type === 'professor'
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

// User management (mantendo compatibilidade)
export const getUsers = (): User[] => {
  return getStorageItem<User[]>(STORAGE_KEYS.USERS) || [];
};

export const saveUser = (user: User): void => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  setStorageItem(STORAGE_KEYS.USERS, users);
  
  // Se for professor, salvar também na lista específica de professores
  if (user.type === 'professor') {
    saveProfessor(user);
  }
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
  return getStorageItem<{email: string, password: string}>(STORAGE_KEYS.SAVED_CREDENTIALS);
};

export const setSavedCredentials = (email: string, password: string) => {
  setStorageItem(STORAGE_KEYS.SAVED_CREDENTIALS, {email, password});
};

export const clearSavedCredentials = () => {
  removeStorageItem(STORAGE_KEYS.SAVED_CREDENTIALS);
};
