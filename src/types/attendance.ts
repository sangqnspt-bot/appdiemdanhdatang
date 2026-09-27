export type AttendanceStatusType = 
  | 'present'           // Có mặt
  | 'late'              // Đi muộn (kèm số phút)
  | 'early_departure'   // Về sớm (kèm số phút)
  | 'excused_absence'   // Vắng có lý do (đính kèm minh chứng số)
  | 'unexcused_absence';// Vắng không lý do

export interface AbsenceEvidence {
  id: string;
  fileName: string;
  fileType: string;
  fileSizeKb: number;
  uploadedAt: string;
  reasonType: 'medical' | 'official_duty' | 'family' | 'other';
  note: string;
  previewUrl?: string;
  approvedBy?: string;
  isApproved: boolean;
}

export interface Student {
  id: string;
  studentCode: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Nam' | 'Nữ';
  email: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  classId: string;
  className: string;
  major: string;
  academicYear: string;
  avatarUrl?: string;
}

export interface ClassSession {
  id: string;
  courseCode: string;
  courseName: string;
  classId: string;
  className: string;
  major: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  date: string; // YYYY-MM-DD
  timeSlot: {
    start: string; // HH:mm
    end: string;   // HH:mm
    shift: 'morning' | 'afternoon' | 'evening';
  };
  room: string;
  totalCredits: number;
  totalCourseSessions: number; // Tổng số buổi của môn
  sessionNumber: number;        // Buổi thứ mấy
  status: 'scheduled' | 'in_progress' | 'locked' | 'completed';
  lockedAt?: string;
  lockedBy?: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  status: AttendanceStatusType;
  lateMinutes?: number;
  earlyMinutes?: number;
  evidence?: AbsenceEvidence;
  timestamp: string;
  method: 'manual' | 'qr_dynamic' | 'geofence' | 'admin_override';
  verifiedBy: string; // Lecturer ID or Admin ID
  ipAddress?: string;
  distanceMeters?: number;
  isSynced: boolean; // For offline synchronization
  notes?: string;
}

export interface GeofenceConfig {
  campusName: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  allowedIpSubnets: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: 'admin' | 'teacher' | 'system';
  actionType: 
    | 'SESSION_LOCKED' 
    | 'ADMIN_OVERRIDE' 
    | 'EXCEL_IMPORT' 
    | 'EWS_ALERT_DISPATCH' 
    | 'OFFLINE_SYNC' 
    | 'EVIDENCE_APPROVED' 
    | 'GEOFENCE_SETTINGS_UPDATED';
  targetType: 'session' | 'record' | 'student' | 'system';
  targetId: string;
  description: string;
  reason?: string;
  previousState?: string;
  newState?: string;
  ipAddress?: string;
}

export interface EarlyWarningStudent {
  student: Student;
  courseCode: string;
  courseName: string;
  totalCourseSessions: number;
  attendedSessions: number;
  absentSessions: number;
  excusedAbsences: number;
  unexcusedAbsences: number;
  lateCount: number;
  absenceRate: number; // 0 - 100%
  riskLevel: 'safe' | 'warning' | 'critical'; // critical >= 20%
  lastAlertSentAt?: string;
  alertCount: number;
}

export interface AlertNotificationPayload {
  studentId: string;
  studentName: string;
  parentPhone: string;
  parentEmail: string;
  courseName: string;
  absenceRate: number;
  channels: ('SMS' | 'EMAIL' | 'PUSH')[];
  messageContent: string;
  urgency: 'high' | 'critical';
}
