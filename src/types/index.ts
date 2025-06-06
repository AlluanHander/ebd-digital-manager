
export interface User {
  id: string;
  name: string;
  email: string;
  type: 'professor' | 'secretario';
  classIds?: string[];
  churchName: string;
  createdAt: string;
}

export interface Class {
  id: string;
  name: string;
  teacherIds: string[];
  teacherNames: string[];
  students: Student[];
  visitors: Visitor[];
  announcements: Announcement[];
  birthdays: Birthday[];
  inventory: Inventory;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  attendance: AttendanceRecord[];
  birthday?: string;
  createdAt: string;
}

export interface Visitor {
  id: string;
  name: string;
  classId: string;
  visitDate: string;
  createdAt: string;
}

export interface AnnouncementReply {
  id: string;
  content: string;
  authorName: string;
  authorType: 'professor' | 'secretario';
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  classId: string;
  createdBy: string;
  createdAt: string;
  authorName?: string;
  authorType?: 'professor' | 'secretario';
  replies?: AnnouncementReply[];
}

export interface Birthday {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  date: string;
  month: number;
  day: number;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  present: boolean;
  week: number;
  quarter: string;
}

export interface Inventory {
  id: string;
  classId: string;
  bibles: number;
  magazines: number;
  offerings: number;
  lastUpdated: string;
  quarter: string;
}

export interface Report {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  totalClasses: number;
  presentClasses: number;
  attendancePercentage: number;
  period: string;
}
