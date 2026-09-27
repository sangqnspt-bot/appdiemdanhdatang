import { 
  Student, 
  ClassSession, 
  AttendanceRecord, 
  GeofenceConfig, 
  AuditLogEntry, 
  EarlyWarningStudent,
  AttendanceStatusType,
  AlertNotificationPayload
} from '../types/attendance';
import { 
  INITIAL_STUDENTS, 
  INITIAL_SESSIONS, 
  INITIAL_ATTENDANCE_RECORDS, 
  INITIAL_GEOFENCE_CONFIG, 
  INITIAL_AUDIT_LOGS,
  HISTORICAL_ABSENCES 
} from '../data/mockData';

const KEYS = {
  STUDENTS: 'smart_attend_students_v1',
  SESSIONS: 'smart_attend_sessions_v1',
  RECORDS: 'smart_attend_records_v1',
  GEOFENCE: 'smart_attend_geofence_v1',
  AUDIT_LOGS: 'smart_attend_audit_logs_v1',
  OFFLINE_QUEUE: 'smart_attend_offline_queue_v1',
  IS_OFFLINE_SIM: 'smart_attend_is_offline_sim_v1',
  EWS_DISPATCH_LOG: 'smart_attend_ews_dispatch_v1'
};

export class StorageService {
  // Read / Write helpers with fallback
  private static getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }
  }

  // Initialize data if fresh
  static init(): void {
    if (!localStorage.getItem(KEYS.STUDENTS)) {
      this.setItem(KEYS.STUDENTS, INITIAL_STUDENTS);
    }
    if (!localStorage.getItem(KEYS.SESSIONS)) {
      this.setItem(KEYS.SESSIONS, INITIAL_SESSIONS);
    }
    if (!localStorage.getItem(KEYS.RECORDS)) {
      this.setItem(KEYS.RECORDS, INITIAL_ATTENDANCE_RECORDS);
    }
    if (!localStorage.getItem(KEYS.GEOFENCE)) {
      this.setItem(KEYS.GEOFENCE, INITIAL_GEOFENCE_CONFIG);
    }
    if (!localStorage.getItem(KEYS.AUDIT_LOGS)) {
      this.setItem(KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    }
  }

  // Offline Simulation State
  static isOfflineSimulated(): boolean {
    return this.getItem<boolean>(KEYS.IS_OFFLINE_SIM, false);
  }

  static setOfflineSimulated(val: boolean): void {
    this.setItem(KEYS.IS_OFFLINE_SIM, val);
  }

  static getOfflineQueue(): AttendanceRecord[] {
    return this.getItem<AttendanceRecord[]>(KEYS.OFFLINE_QUEUE, []);
  }

  static syncOfflineQueue(): { count: number; syncedRecords: AttendanceRecord[] } {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) return { count: 0, syncedRecords: [] };

    const records = this.getAttendanceRecords();
    const map = new Map(records.map(r => [r.id, r]));

    for (const item of queue) {
      map.set(item.id, { ...item, isSynced: true });
    }

    const updatedRecords = Array.from(map.values());
    this.setItem(KEYS.RECORDS, updatedRecords);
    this.setItem(KEYS.OFFLINE_QUEUE, []);

    // Create Audit Log for offline sync
    this.addAuditLog({
      id: `log-sync-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: 'sys-offline',
      actorName: 'Bộ đệm Ngoại tuyến (Offline Caching)',
      actorRole: 'system',
      actionType: 'OFFLINE_SYNC',
      targetType: 'system',
      targetId: 'sync-batch',
      description: `Đã tự động đồng bộ hóa ${queue.length} bản ghi điểm danh lưu đệm lên máy chủ sau khi khôi phục kết nối mạng.`,
      ipAddress: '127.0.0.1'
    });

    return { count: queue.length, syncedRecords: queue };
  }

  // Students
  static getStudents(): Student[] {
    return this.getItem<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
  }

  static saveStudents(students: Student[]): void {
    this.setItem(KEYS.STUDENTS, students);
  }

  static addStudents(newStudents: Student[]): void {
    const existing = this.getStudents();
    const map = new Map(existing.map(s => [s.studentCode, s]));
    newStudents.forEach(s => map.set(s.studentCode, s));
    this.saveStudents(Array.from(map.values()));
  }

  // Sessions
  static getSessions(): ClassSession[] {
    return this.getItem<ClassSession[]>(KEYS.SESSIONS, INITIAL_SESSIONS);
  }

  static getSessionById(id: string): ClassSession | undefined {
    return this.getSessions().find(s => s.id === id);
  }

  static saveSessions(sessions: ClassSession[]): void {
    this.setItem(KEYS.SESSIONS, sessions);
  }

  static lockSession(sessionId: string, actorId: string, actorName: string, role: 'teacher' | 'admin'): ClassSession {
    const sessions = this.getSessions();
    const index = sessions.findIndex(s => s.id === sessionId);
    if (index === -1) throw new Error('Buổi học không tồn tại');

    const session = sessions[index];
    const updated: ClassSession = {
      ...session,
      status: 'locked',
      lockedAt: new Date().toISOString(),
      lockedBy: actorId
    };
    sessions[index] = updated;
    this.saveSessions(sessions);

    // Audit log
    this.addAuditLog({
      id: `log-lock-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId,
      actorName,
      actorRole: role,
      actionType: 'SESSION_LOCKED',
      targetType: 'session',
      targetId: sessionId,
      description: `Buổi học "${session.courseName}" (${session.className}) đã bị khóa. Tính bất biến của dữ liệu điểm danh được kích hoạt.`,
      ipAddress: '192.168.1.100'
    });

    return updated;
  }

  // Attendance Records
  static getAttendanceRecords(sessionId?: string): AttendanceRecord[] {
    const all = this.getItem<AttendanceRecord[]>(KEYS.RECORDS, INITIAL_ATTENDANCE_RECORDS);
    if (sessionId) {
      return all.filter(r => r.sessionId === sessionId);
    }
    return all;
  }

  static saveAttendanceRecord(record: AttendanceRecord): void {
    const isOffline = this.isOfflineSimulated();
    const all = this.getAttendanceRecords();
    const index = all.findIndex(r => r.id === record.id);

    const recordToSave: AttendanceRecord = {
      ...record,
      isSynced: !isOffline
    };

    if (index >= 0) {
      all[index] = recordToSave;
    } else {
      all.push(recordToSave);
    }

    this.setItem(KEYS.RECORDS, all);

    if (isOffline) {
      // Add to offline queue
      const queue = this.getOfflineQueue();
      const qIdx = queue.findIndex(q => q.id === record.id);
      if (qIdx >= 0) {
        queue[qIdx] = recordToSave;
      } else {
        queue.push(recordToSave);
      }
      this.setItem(KEYS.OFFLINE_QUEUE, queue);
    }
  }

  // Admin Override of locked record with compulsory Reason & Audit Log
  static adminOverrideRecord(params: {
    recordId: string;
    newStatus: AttendanceStatusType;
    lateMinutes?: number;
    earlyMinutes?: number;
    reason: string;
    adminId: string;
    adminName: string;
    evidenceNote?: string;
  }): AttendanceRecord {
    const all = this.getAttendanceRecords();
    const index = all.findIndex(r => r.id === params.recordId);
    if (index === -1) throw new Error('Bản ghi điểm danh không tồn tại');

    const oldRecord = all[index];
    const previousLabel = this.getStatusLabel(oldRecord.status);
    const newLabel = this.getStatusLabel(params.newStatus);

    const updated: AttendanceRecord = {
      ...oldRecord,
      status: params.newStatus,
      lateMinutes: params.lateMinutes,
      earlyMinutes: params.earlyMinutes,
      timestamp: new Date().toISOString(),
      method: 'admin_override',
      verifiedBy: params.adminId,
      notes: params.reason,
      evidence: params.evidenceNote ? {
        id: `evi-override-${Date.now()}`,
        fileName: 'Minh_Chung_Bo_Sung.pdf',
        fileType: 'application/pdf',
        fileSizeKb: 120,
        uploadedAt: new Date().toISOString(),
        reasonType: 'medical',
        note: params.evidenceNote,
        isApproved: true,
        approvedBy: params.adminName
      } : oldRecord.evidence
    };

    all[index] = updated;
    this.setItem(KEYS.RECORDS, all);

    // Audit log (CRITICAL REQUIREMENT)
    this.addAuditLog({
      id: `log-override-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: params.adminId,
      actorName: params.adminName,
      actorRole: 'admin',
      actionType: 'ADMIN_OVERRIDE',
      targetType: 'record',
      targetId: params.recordId,
      description: `Quản trị viên đã can thiệp điều chỉnh trạng thái điểm danh cho SV: ${oldRecord.studentName} (${oldRecord.studentCode}).`,
      reason: params.reason,
      previousState: previousLabel,
      newState: newLabel,
      ipAddress: '10.20.1.5'
    });

    return updated;
  }

  static getStatusLabel(status: AttendanceStatusType): string {
    switch (status) {
      case 'present': return 'Có mặt';
      case 'late': return 'Đi muộn';
      case 'early_departure': return 'Về sớm';
      case 'excused_absence': return 'Vắng có phép';
      case 'unexcused_absence': return 'Vắng không phép';
    }
  }

  // Geofence Config
  static getGeofenceConfig(): GeofenceConfig {
    return this.getItem<GeofenceConfig>(KEYS.GEOFENCE, INITIAL_GEOFENCE_CONFIG);
  }

  static saveGeofenceConfig(config: GeofenceConfig, actorName: string): void {
    this.setItem(KEYS.GEOFENCE, config);
    this.addAuditLog({
      id: `log-geo-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: 'adm-01',
      actorName,
      actorRole: 'admin',
      actionType: 'GEOFENCE_SETTINGS_UPDATED',
      targetType: 'system',
      targetId: 'geofence-config',
      description: `Cập nhật cấu hình Geofencing: Tọa độ (${config.latitude}, ${config.longitude}), Bán kính ${config.radiusMeters}m.`
    });
  }

  // Audit Logs
  static getAuditLogs(): AuditLogEntry[] {
    const logs = this.getItem<AuditLogEntry[]>(KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static addAuditLog(entry: AuditLogEntry): void {
    const logs = this.getItem<AuditLogEntry[]>(KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    logs.unshift(entry);
    this.setItem(KEYS.AUDIT_LOGS, logs);
  }

  // Early Warning System Calculation (EWS)
  static getEarlyWarningList(): EarlyWarningStudent[] {
    const students = this.getStudents();
    const sessions = this.getSessions();
    const records = this.getAttendanceRecords();

    // Default primary course reference: IT204 (15 sessions)
    const primaryCourse = sessions[0] || {
      courseCode: 'IT204',
      courseName: 'Lập trình Ứng dụng Web Nâng cao',
      totalCourseSessions: 15
    };

    const results: EarlyWarningStudent[] = [];

    for (const student of students) {
      const hist = HISTORICAL_ABSENCES[student.id] || { absentCount: 0, excusedCount: 0, lateCount: 0 };
      
      // Also count from today's session records
      const todayRecord = records.find(r => r.studentId === student.id && r.sessionId === primaryCourse.id);
      let sessionAbsent = 0;
      let sessionExcused = 0;
      let sessionLate = 0;

      if (todayRecord) {
        if (todayRecord.status === 'unexcused_absence') sessionAbsent += 1;
        if (todayRecord.status === 'excused_absence') sessionExcused += 1;
        if (todayRecord.status === 'late') sessionLate += 1;
      }

      const totalAbsent = hist.absentCount + sessionAbsent;
      const totalExcused = hist.excusedCount + sessionExcused;
      const totalLate = hist.lateCount + sessionLate;
      const totalSessions = primaryCourse.totalCourseSessions || 15;

      // Rate of absence = (unexcused + excused) / totalCourseSessions
      // Under MOET & Vocational regulations: absence rate >= 20% leads to exam disqualification
      const absenceRate = Math.min(100, Math.round(((totalAbsent + totalExcused) / totalSessions) * 100 * 10) / 10);

      let riskLevel: 'safe' | 'warning' | 'critical' = 'safe';
      if (absenceRate >= 20) {
        riskLevel = 'critical';
      } else if (absenceRate >= 13.3) { // 2 sessions out of 15
        riskLevel = 'warning';
      }

      results.push({
        student,
        courseCode: primaryCourse.courseCode,
        courseName: primaryCourse.courseName,
        totalCourseSessions: totalSessions,
        attendedSessions: Math.max(0, totalSessions - totalAbsent - totalExcused),
        absentSessions: totalAbsent + totalExcused,
        excusedAbsences: totalExcused,
        unexcusedAbsences: totalAbsent,
        lateCount: totalLate,
        absenceRate,
        riskLevel,
        alertCount: riskLevel === 'critical' ? 1 : 0
      });
    }

    return results.sort((a, b) => b.absenceRate - a.absenceRate);
  }

  // Dispatch Early Warning Notification
  static dispatchAlertNotification(payload: AlertNotificationPayload, actorName: string): void {
    // Record to Audit Log
    this.addAuditLog({
      id: `log-alert-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: 'sys-ews',
      actorName,
      actorRole: 'system',
      actionType: 'EWS_ALERT_DISPATCH',
      targetType: 'student',
      targetId: payload.studentId,
      description: `Đã phát thông báo Cảnh báo Sớm (EWS) qua kênh [${payload.channels.join(', ')}] đến Phụ huynh: ${payload.parentPhone} (${payload.studentName}) - Tỷ lệ vắng: ${payload.absenceRate}%. Nội dung: ${payload.messageContent.slice(0, 80)}...`,
      ipAddress: '127.0.0.1'
    });
  }
}
