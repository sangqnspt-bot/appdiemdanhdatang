import { Student, ClassSession, AttendanceRecord, GeofenceConfig, AuditLogEntry } from '../types/attendance';

export const INITIAL_GEOFENCE_CONFIG: GeofenceConfig = {
  campusName: 'Khu Công Nghệ Cao - Cơ Sở Đào Tạo Chính',
  address: 'Đường D1, Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh',
  latitude: 10.8546,
  longitude: 106.7852,
  radiusMeters: 100, // 100m geofence radius
  allowedIpSubnets: ['192.168.1.0/24', '172.16.10.0/24', '10.20.0.0/16']
};

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'st-001',
    studentCode: 'SV220101',
    fullName: 'Nguyễn Văn An',
    dateOfBirth: '2004-03-15',
    gender: 'Nam',
    email: 'an.nv@edu.vn',
    phone: '0912345601',
    parentName: 'Nguyễn Văn Ba',
    parentPhone: '0903112201',
    parentEmail: 'ba.nguyen@gmail.com',
    classId: 'class-it-01',
    className: 'CNTT-K22A',
    major: 'Công nghệ Thông tin',
    academicYear: '2022-2025'
  },
  {
    id: 'st-002',
    studentCode: 'SV220102',
    fullName: 'Trần Thị Mai',
    dateOfBirth: '2004-07-22',
    gender: 'Nữ',
    email: 'mai.tt@edu.vn',
    phone: '0912345602',
    parentName: 'Trần Văn Tám',
    parentPhone: '0903112202',
    parentEmail: 'tam.tran@gmail.com',
    classId: 'class-it-01',
    className: 'CNTT-K22A',
    major: 'Công nghệ Thông tin',
    academicYear: '2022-2025'
  },
  {
    id: 'st-003',
    studentCode: 'SV220103',
    fullName: 'Lê Hoàng Long',
    dateOfBirth: '2004-01-10',
    gender: 'Nam',
    email: 'long.lh@edu.vn',
    phone: '0912345603',
    parentName: 'Lê Hoàng Hùng',
    parentPhone: '0903112203',
    parentEmail: 'hung.le@gmail.com',
    classId: 'class-it-01',
    className: 'CNTT-K22A',
    major: 'Công nghệ Thông tin',
    academicYear: '2022-2025'
  },
  {
    id: 'st-004',
    studentCode: 'SV220104',
    fullName: 'Phạm Minh Đức',
    dateOfBirth: '2004-11-05',
    gender: 'Nam',
    email: 'duc.pm@edu.vn',
    phone: '0912345604',
    parentName: 'Phạm Văn Nam',
    parentPhone: '0903112204',
    parentEmail: 'nam.pham@gmail.com',
    classId: 'class-it-01',
    className: 'CNTT-K22A',
    major: 'Công nghệ Thông tin',
    academicYear: '2022-2025'
  },
  {
    id: 'st-005',
    studentCode: 'SV220105',
    fullName: 'Võ Thảo Linh',
    dateOfBirth: '2004-09-18',
    gender: 'Nữ',
    email: 'linh.vt@edu.vn',
    phone: '0912345605',
    parentName: 'Võ Trọng Nghĩa',
    parentPhone: '0903112205',
    parentEmail: 'nghia.vo@gmail.com',
    classId: 'class-it-01',
    className: 'CNTT-K22A',
    major: 'Công nghệ Thông tin',
    academicYear: '2022-2025'
  },
  {
    id: 'st-006',
    studentCode: 'SV220106',
    fullName: 'Đặng Tuấn Kiệt',
    dateOfBirth: '2004-05-30',
    gender: 'Nam',
    email: 'kiet.dt@edu.vn',
    phone: '0912345606',
    parentName: 'Đặng Quốc Huy',
    parentPhone: '0903112206',
    parentEmail: 'huy.dang@gmail.com',
    classId: 'class-it-01',
    className: 'CNTT-K22A',
    major: 'Công nghệ Thông tin',
    academicYear: '2022-2025'
  },
  {
    id: 'st-007',
    studentCode: 'SV220107',
    fullName: 'Hoàng Bích Phương',
    dateOfBirth: '2004-12-14',
    gender: 'Nữ',
    email: 'phuong.hb@edu.vn',
    phone: '0912345607',
    parentName: 'Hoàng Văn Thắng',
    parentPhone: '0903112207',
    parentEmail: 'thang.hoang@gmail.com',
    classId: 'class-it-01',
    className: 'CNTT-K22A',
    major: 'Công nghệ Thông tin',
    academicYear: '2022-2025'
  },
  {
    id: 'st-008',
    studentCode: 'SV220108',
    fullName: 'Bùi Gia Huy',
    dateOfBirth: '2004-04-02',
    gender: 'Nam',
    email: 'huy.bg@edu.vn',
    phone: '0912345608',
    parentName: 'Bùi Thanh Liêm',
    parentPhone: '0903112208',
    parentEmail: 'liem.bui@gmail.com',
    classId: 'class-it-01',
    className: 'CNTT-K22A',
    major: 'Công nghệ Thông tin',
    academicYear: '2022-2025'
  },
  {
    id: 'st-009',
    studentCode: 'SV220109',
    fullName: 'Ngô Khánh Vy',
    dateOfBirth: '2004-08-25',
    gender: 'Nữ',
    email: 'vy.nk@edu.vn',
    phone: '0912345609',
    parentName: 'Ngô Văn Cường',
    parentPhone: '0903112209',
    parentEmail: 'cuong.ngo@gmail.com',
    classId: 'class-it-01',
    className: 'CNTT-K22A',
    major: 'Công nghệ Thông tin',
    academicYear: '2022-2025'
  },
  {
    id: 'st-010',
    studentCode: 'SV220110',
    fullName: 'Dương Hữu Tài',
    dateOfBirth: '2004-02-19',
    gender: 'Nam',
    email: 'tai.dh@edu.vn',
    phone: '0912345610',
    parentName: 'Dương Đình Hải',
    parentPhone: '0903112210',
    parentEmail: 'hai.duong@gmail.com',
    classId: 'class-it-01',
    className: 'CNTT-K22A',
    major: 'Công nghệ Thông tin',
    academicYear: '2022-2025'
  },
  {
    id: 'st-011',
    studentCode: 'SV220201',
    fullName: 'Phan Quốc Bảo',
    dateOfBirth: '2004-06-11',
    gender: 'Nam',
    email: 'bao.pq@edu.vn',
    phone: '0912345611',
    parentName: 'Phan Văn Dũng',
    parentPhone: '0903112211',
    parentEmail: 'dung.phan@gmail.com',
    classId: 'class-mecha-01',
    className: 'CĐT-K22B',
    major: 'Cơ điện tử & Tự động hóa',
    academicYear: '2022-2025'
  },
  {
    id: 'st-012',
    studentCode: 'SV220202',
    fullName: 'Đỗ Hải Yến',
    dateOfBirth: '2004-10-08',
    gender: 'Nữ',
    email: 'yen.dh@edu.vn',
    phone: '0912345612',
    parentName: 'Đỗ Văn Thành',
    parentPhone: '0903112212',
    parentEmail: 'thanh.do@gmail.com',
    classId: 'class-mecha-01',
    className: 'CĐT-K22B',
    major: 'Cơ điện tử & Tự động hóa',
    academicYear: '2022-2025'
  }
];

export const INITIAL_SESSIONS: ClassSession[] = [
  {
    id: 'sess-today-01',
    courseCode: 'IT204',
    courseName: 'Lập trình Ứng dụng Web Nâng cao',
    classId: 'class-it-01',
    className: 'CNTT-K22A',
    major: 'Công nghệ Thông tin',
    teacherId: 'tch-01',
    teacherName: 'TS. Nguyễn Thanh Sơn',
    teacherEmail: 'son.nt@edu.vn',
    date: '2026-09-27',
    timeSlot: {
      start: '07:30',
      end: '11:30',
      shift: 'morning'
    },
    room: 'Phòng Lab 402 - Tòa A',
    totalCredits: 3,
    totalCourseSessions: 15,
    sessionNumber: 8,
    status: 'in_progress'
  },
  {
    id: 'sess-today-02',
    courseCode: 'ME302',
    courseName: 'Điều khiển Lập trình PLC & SCADA',
    classId: 'class-mecha-01',
    className: 'CĐT-K22B',
    major: 'Cơ điện tử & Tự động hóa',
    teacherId: 'tch-02',
    teacherName: 'ThS. Trần Quang Vinh',
    teacherEmail: 'vinh.tq@edu.vn',
    date: '2026-09-27',
    timeSlot: {
      start: '13:00',
      end: '17:00',
      shift: 'afternoon'
    },
    room: 'Xưởng Thực hành PLC 105',
    totalCredits: 4,
    totalCourseSessions: 20,
    sessionNumber: 11,
    status: 'scheduled'
  },
  {
    id: 'sess-prev-01',
    courseCode: 'IT204',
    courseName: 'Lập trình Ứng dụng Web Nâng cao',
    classId: 'class-it-01',
    className: 'CNTT-K22A',
    major: 'Công nghệ Thông tin',
    teacherId: 'tch-01',
    teacherName: 'TS. Nguyễn Thanh Sơn',
    teacherEmail: 'son.nt@edu.vn',
    date: '2026-09-20',
    timeSlot: {
      start: '07:30',
      end: '11:30',
      shift: 'morning'
    },
    room: 'Phòng Lab 402 - Tòa A',
    totalCredits: 3,
    totalCourseSessions: 15,
    sessionNumber: 7,
    status: 'locked',
    lockedAt: '2026-09-20T11:45:00.000Z',
    lockedBy: 'tch-01'
  }
];

export const INITIAL_ATTENDANCE_RECORDS: AttendanceRecord[] = [
  // Session today initial states
  {
    id: 'rec-001',
    sessionId: 'sess-today-01',
    studentId: 'st-001',
    studentCode: 'SV220101',
    studentName: 'Nguyễn Văn An',
    status: 'present',
    timestamp: '2026-09-27T07:35:12.000Z',
    method: 'qr_dynamic',
    verifiedBy: 'tch-01',
    ipAddress: '192.168.1.104',
    distanceMeters: 18,
    isSynced: true
  },
  {
    id: 'rec-002',
    sessionId: 'sess-today-01',
    studentId: 'st-002',
    studentCode: 'SV220102',
    studentName: 'Trần Thị Mai',
    status: 'present',
    timestamp: '2026-09-27T07:38:40.000Z',
    method: 'qr_dynamic',
    verifiedBy: 'tch-01',
    ipAddress: '192.168.1.112',
    distanceMeters: 22,
    isSynced: true
  },
  {
    id: 'rec-003',
    sessionId: 'sess-today-01',
    studentId: 'st-003',
    studentCode: 'SV220103',
    studentName: 'Lê Hoàng Long',
    status: 'late',
    lateMinutes: 25,
    timestamp: '2026-09-27T07:55:00.000Z',
    method: 'manual',
    verifiedBy: 'tch-01',
    ipAddress: '192.168.1.140',
    distanceMeters: 30,
    isSynced: true,
    notes: 'Kẹt xe đường Đỗ Xuân Hợp'
  },
  {
    id: 'rec-004',
    sessionId: 'sess-today-01',
    studentId: 'st-004',
    studentCode: 'SV220104',
    studentName: 'Phạm Minh Đức',
    status: 'unexcused_absence',
    timestamp: '2026-09-27T08:15:00.000Z',
    method: 'manual',
    verifiedBy: 'tch-01',
    isSynced: true
  },
  {
    id: 'rec-005',
    sessionId: 'sess-today-01',
    studentId: 'st-005',
    studentCode: 'SV220105',
    studentName: 'Võ Thảo Linh',
    status: 'excused_absence',
    timestamp: '2026-09-27T07:20:00.000Z',
    method: 'manual',
    verifiedBy: 'tch-01',
    isSynced: true,
    evidence: {
      id: 'evi-001',
      fileName: 'Giay_Kham_Benh_Vien_Thu_Duc.pdf',
      fileType: 'application/pdf',
      fileSizeKb: 450,
      uploadedAt: '2026-09-26T20:15:00.000Z',
      reasonType: 'medical',
      note: 'Sốt xuất huyết điều trị ngoại trú theo chỉ định của BS',
      isApproved: true,
      approvedBy: 'tch-01'
    }
  },
  {
    id: 'rec-006',
    sessionId: 'sess-today-01',
    studentId: 'st-006',
    studentCode: 'SV220106',
    studentName: 'Đặng Tuấn Kiệt',
    status: 'present',
    timestamp: '2026-09-27T07:33:10.000Z',
    method: 'qr_dynamic',
    verifiedBy: 'tch-01',
    ipAddress: '192.168.1.155',
    distanceMeters: 14,
    isSynced: true
  },
  {
    id: 'rec-007',
    sessionId: 'sess-today-01',
    studentId: 'st-007',
    studentCode: 'SV220107',
    studentName: 'Hoàng Bích Phương',
    status: 'unexcused_absence',
    timestamp: '2026-09-27T08:00:00.000Z',
    method: 'manual',
    verifiedBy: 'tch-01',
    isSynced: true
  },
  {
    id: 'rec-008',
    sessionId: 'sess-today-01',
    studentId: 'st-008',
    studentCode: 'SV220108',
    studentName: 'Bùi Gia Huy',
    status: 'early_departure',
    earlyMinutes: 45,
    timestamp: '2026-09-27T10:45:00.000Z',
    method: 'manual',
    verifiedBy: 'tch-01',
    isSynced: true,
    notes: 'Có giấy triệu tập khám sức khỏe nghĩa vụ quân sự'
  },
  {
    id: 'rec-009',
    sessionId: 'sess-today-01',
    studentId: 'st-009',
    studentCode: 'SV220109',
    studentName: 'Ngô Khánh Vy',
    status: 'present',
    timestamp: '2026-09-27T07:32:00.000Z',
    method: 'qr_dynamic',
    verifiedBy: 'tch-01',
    ipAddress: '192.168.1.102',
    distanceMeters: 12,
    isSynced: true
  },
  {
    id: 'rec-010',
    sessionId: 'sess-today-01',
    studentId: 'st-010',
    studentCode: 'SV220110',
    studentName: 'Dương Hữu Tài',
    status: 'present',
    timestamp: '2026-09-27T07:40:00.000Z',
    method: 'qr_dynamic',
    verifiedBy: 'tch-01',
    ipAddress: '192.168.1.189',
    distanceMeters: 35,
    isSynced: true
  }
];

// Seed historical cumulative absences across previous sessions for IT204 (15 sessions total)
// Threshold 20% = 3 sessions (3/15 = 20%)
export const HISTORICAL_ABSENCES: Record<string, { absentCount: number; excusedCount: number; lateCount: number }> = {
  'st-004': { absentCount: 4, excusedCount: 0, lateCount: 2 }, // 4/15 = 26.7% -> Critical EWS
  'st-007': { absentCount: 3, excusedCount: 0, lateCount: 1 }, // 3/15 = 20.0% -> Critical EWS
  'st-003': { absentCount: 2, excusedCount: 1, lateCount: 3 }, // 3 total absences (20%) -> Warning
  'st-005': { absentCount: 1, excusedCount: 2, lateCount: 0 }, // Excused
  'st-001': { absentCount: 0, excusedCount: 0, lateCount: 0 },
  'st-002': { absentCount: 0, excusedCount: 0, lateCount: 1 },
  'st-006': { absentCount: 1, excusedCount: 0, lateCount: 0 },
  'st-008': { absentCount: 1, excusedCount: 1, lateCount: 2 },
  'st-009': { absentCount: 0, excusedCount: 0, lateCount: 0 },
  'st-010': { absentCount: 1, excusedCount: 0, lateCount: 1 },
  'st-011': { absentCount: 5, excusedCount: 0, lateCount: 1 }, // 5/20 = 25% -> Critical EWS for Mechatronics
  'st-012': { absentCount: 1, excusedCount: 1, lateCount: 0 }
};

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    timestamp: '2026-09-20T11:45:10.000Z',
    actorId: 'tch-01',
    actorName: 'TS. Nguyễn Thanh Sơn',
    actorRole: 'teacher',
    actionType: 'SESSION_LOCKED',
    targetType: 'session',
    targetId: 'sess-prev-01',
    description: 'Giảng viên đã kết thúc và khóa sổ buổi học #7 (Môn IT204). Dữ liệu điểm danh được chuyển sang chế độ bất biến.',
    ipAddress: '192.168.1.100'
  },
  {
    id: 'log-002',
    timestamp: '2026-09-22T09:14:00.000Z',
    actorId: 'adm-01',
    actorName: 'Phòng Đào Tạo - Nguyễn Hoàng Nam',
    actorRole: 'admin',
    actionType: 'ADMIN_OVERRIDE',
    targetType: 'record',
    targetId: 'rec-hist-082',
    description: 'Cập nhật điểm danh sau khóa cho sinh viên SV220105 (Võ Thảo Linh).',
    reason: 'Sinh viên nộp bổ sung Giấy xác nhận nằm viện do Khoa xét duyệt theo Công văn số 44/ĐHQG',
    previousState: 'Vắng không phép',
    newState: 'Vắng có phép',
    ipAddress: '10.20.1.5'
  },
  {
    id: 'log-003',
    timestamp: '2026-09-25T14:30:00.000Z',
    actorId: 'sys-ews',
    actorName: 'Hệ thống Cảnh báo Sớm EWS',
    actorRole: 'system',
    actionType: 'EWS_ALERT_DISPATCH',
    targetType: 'student',
    targetId: 'st-004',
    description: 'Tự động gửi cảnh báo khẩn cấp tới Phụ huynh (0903112204) và SV220104 qua SMS & Email do tỷ lệ vắng đạt 26.7% môn IT204.',
    ipAddress: '127.0.0.1'
  },
  {
    id: 'log-004',
    timestamp: '2026-09-26T08:00:00.000Z',
    actorId: 'adm-01',
    actorName: 'Phòng Đào Tạo - Nguyễn Hoàng Nam',
    actorRole: 'admin',
    actionType: 'EXCEL_IMPORT',
    targetType: 'system',
    targetId: 'batch-import-2026-09-26',
    description: 'Nạp danh sách lớp CNTT-K22A và phân lịch học kỳ 1 năm học 2026-2027 từ tệp Excel chuẩn hóa (đã qua bộ lọc kiểm tra trùng lịch).',
    ipAddress: '10.20.1.5'
  }
];
