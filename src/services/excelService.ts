import * as XLSX from 'xlsx';
import { Student, ClassSession, EarlyWarningStudent } from '../types/attendance';

export interface ExcelValidationItem {
  row: number;
  data: Record<string, any>;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ExcelPipelineReport {
  fileName: string;
  totalRows: number;
  validCount: number;
  errorCount: number;
  warningCount: number;
  items: ExcelValidationItem[];
  conflictDetails?: string[];
}

export class ExcelService {
  // Download standard Student List template
  static downloadStudentTemplate(): void {
    const templateData = [
      {
        'Mã Sinh Viên (*)': 'SV220301',
        'Họ và Tên (*)': 'Lê Quang Minh',
        'Ngày Sinh (YYYY-MM-DD)': '2004-05-12',
        'Giới Tính': 'Nam',
        'Lớp (*)': 'CNTT-K22A',
        'Khoa / Chuyên Ngành': 'Công nghệ Thông tin',
        'Số Điện Thoại': '0912345678',
        'Email SV': 'minh.lq@edu.vn',
        'Họ Tên Phụ Huynh (*)': 'Lê Quang Vinh',
        'SĐT Phụ Huynh (*)': '0903889901',
        'Email Phụ Huynh': 'vinh.le@gmail.com'
      },
      {
        'Mã Sinh Viên (*)': 'SV220302',
        'Họ và Tên (*)': 'Nguyễn Phương Thảo',
        'Ngày Sinh (YYYY-MM-DD)': '2004-09-20',
        'Giới Tính': 'Nữ',
        'Lớp (*)': 'CNTT-K22A',
        'Khoa / Chuyên Ngành': 'Công nghệ Thông tin',
        'Số Điện Thoại': '0912345679',
        'Email SV': 'thao.np@edu.vn',
        'Họ Tên Phụ Huynh (*)': 'Nguyễn Văn Hòa',
        'SĐT Phụ Huynh (*)': '0903889902',
        'Email Phụ Huynh': 'hoa.nguyen@gmail.com'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh_Sach_SV_Chuan');
    XLSX.writeFile(workbook, 'Mau_Danh_Sach_Sinh_Vien_Chuan_Hoa.xlsx');
  }

  // Download Schedule Template (Thời khóa biểu)
  static downloadScheduleTemplate(): void {
    const templateData = [
      {
        'Mã Môn Học (*)': 'IT204',
        'Tên Môn Học (*)': 'Lập trình Web Nâng cao',
        'Mã Lớp (*)': 'CNTT-K22A',
        'Mã Giảng Viên (*)': 'GV01',
        'Họ Tên Giảng Viên (*)': 'TS. Nguyễn Thanh Sơn',
        'Phòng Học (*)': 'Lab 402',
        'Ngày (YYYY-MM-DD) (*)': '2026-09-27',
        'Giờ Bắt Đầu (HH:mm) (*)': '07:30',
        'Giờ Kết Thúc (HH:mm) (*)': '11:30',
        'Số Tiết': 4
      },
      {
        'Mã Môn Học (*)': 'ME302',
        'Tên Môn Học (*)': 'PLC & SCADA',
        'Mã Lớp (*)': 'CĐT-K22B',
        'Mã Giảng Viên (*)': 'GV02',
        'Họ Tên Giảng Viên (*)': 'ThS. Trần Quang Vinh',
        'Phòng Học (*)': 'Xưởng PLC 105',
        'Ngày (YYYY-MM-DD) (*)': '2026-09-27',
        'Giờ Bắt Đầu (HH:mm) (*)': '13:00',
        'Giờ Kết Thúc (HH:mm) (*)': '17:00',
        'Số Tiết': 4
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Thoi_Khoa_Bieu');
    XLSX.writeFile(workbook, 'Mau_Thoi_Khoa_Bieu_Chuan_Hoa.xlsx');
  }

  // Parse and validate Student list Excel
  static async validateStudentExcel(
    file: File, 
    existingStudents: Student[]
  ): Promise<ExcelPipelineReport> {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    const existingCodeSet = new Set(existingStudents.map(s => s.studentCode.trim().toUpperCase()));
    const fileCodeSet = new Set<string>();

    const items: ExcelValidationItem[] = [];
    let validCount = 0;
    let errorCount = 0;
    let warningCount = 0;

    rawRows.forEach((row, index) => {
      const rowNum = index + 2; // header is row 1
      const errors: string[] = [];
      const warnings: string[] = [];

      // Extract keys flexibly (handling with/without (*))
      const code = (row['Mã Sinh Viên (*)'] || row['Mã Sinh Viên'] || row['MaSV'] || row['studentCode'] || '').toString().trim();
      const name = (row['Họ và Tên (*)'] || row['Họ và Tên'] || row['HoTen'] || row['fullName'] || '').toString().trim();
      const dob = (row['Ngày Sinh (YYYY-MM-DD)'] || row['Ngày Sinh'] || row['NgaySinh'] || row['dateOfBirth'] || '').toString().trim();
      const className = (row['Lớp (*)'] || row['Lớp'] || row['Lop'] || row['className'] || '').toString().trim();
      const parentName = (row['Họ Tên Phụ Huynh (*)'] || row['Họ Tên Phụ Huynh'] || row['Phụ Huynh'] || row['parentName'] || '').toString().trim();
      const parentPhone = (row['SĐT Phụ Huynh (*)'] || row['SĐT Phụ Huynh'] || row['SDT Phụ Huynh'] || row['parentPhone'] || '').toString().trim();

      // Rule 1: Required fields
      if (!code) errors.push('Thiếu Mã sinh viên bắt buộc.');
      if (!name) errors.push('Thiếu Họ và tên bắt buộc.');
      if (!className) errors.push('Thiếu thông tin Lớp.');
      if (!parentPhone) errors.push('Thiếu Số điện thoại phụ huynh (cần cho cảnh báo EWS).');

      // Rule 2: Duplicate check
      if (code) {
        const upperCode = code.toUpperCase();
        if (fileCodeSet.has(upperCode)) {
          errors.push(`Trùng lặp Mã sinh viên (${code}) ngay trong tệp tải lên.`);
        } else {
          fileCodeSet.add(upperCode);
        }

        if (existingCodeSet.has(upperCode)) {
          warnings.push(`Mã sinh viên (${code}) đã tồn tại trong CSDL. Sẽ được cập nhật ghi đè.`);
        }
      }

      // Rule 3: Vietnamese Phone format
      if (parentPhone) {
        const cleanPhone = parentPhone.replace(/\D/g, '');
        if (cleanPhone.length < 10 || cleanPhone.length > 11 || !cleanPhone.startsWith('0')) {
          errors.push(`SĐT phụ huynh (${parentPhone}) không hợp lệ (cần 10 chữ số, bắt đầu bằng số 0).`);
        }
      }

      // Rule 4: Date check
      if (dob && !dob.match(/^\d{4}-\d{2}-\d{2}$/) && !dob.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        warnings.push(`Định dạng ngày sinh (${dob}) khuyến nghị dạng YYYY-MM-DD.`);
      }

      const isValid = errors.length === 0;
      if (isValid) {
        validCount++;
        if (warnings.length > 0) warningCount++;
      } else {
        errorCount++;
      }

      items.push({
        row: rowNum,
        data: row,
        isValid,
        errors,
        warnings
      });
    });

    return {
      fileName: file.name,
      totalRows: rawRows.length,
      validCount,
      errorCount,
      warningCount,
      items
    };
  }

  // Parse and validate Schedule Excel with Conflict Detection (Trùng lịch giảng dạy)
  static async validateScheduleExcel(
    file: File,
    existingSessions: ClassSession[]
  ): Promise<ExcelPipelineReport> {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    const items: ExcelValidationItem[] = [];
    const conflictDetails: string[] = [];
    let validCount = 0;
    let errorCount = 0;
    let warningCount = 0;

    // Track slots by teacher: `${teacherId}_${date}` -> array of { start, end, room, row }
    const teacherSlots: Record<string, { start: string; end: string; room: string; row: number; classCode: string }[]> = {};
    const roomSlots: Record<string, { start: string; end: string; teacher: string; row: number; classCode: string }[]> = {};

    rawRows.forEach((row, index) => {
      const rowNum = index + 2;
      const errors: string[] = [];
      const warnings: string[] = [];

      const courseCode = (row['Mã Môn Học (*)'] || row['Mã Môn Học'] || '').toString().trim();
      const courseName = (row['Tên Môn Học (*)'] || row['Tên Môn Học'] || '').toString().trim();
      const teacherId = (row['Mã Giảng Viên (*)'] || row['Mã GV'] || '').toString().trim();
      const teacherName = (row['Họ Tên Giảng Viên (*)'] || row['Tên Giảng Viên'] || '').toString().trim();
      const classCode = (row['Mã Lớp (*)'] || row['Lớp'] || '').toString().trim();
      const room = (row['Phòng Học (*)'] || row['Phòng Học'] || '').toString().trim();
      const date = (row['Ngày (YYYY-MM-DD) (*)'] || row['Ngày'] || '').toString().trim();
      const startTime = (row['Giờ Bắt Đầu (HH:mm) (*)'] || row['Giờ Bắt Đầu'] || '').toString().trim();
      const endTime = (row['Giờ Kết Thúc (HH:mm) (*)'] || row['Giờ Kết Thúc'] || '').toString().trim();

      if (!courseCode || !courseName) errors.push('Thiếu mã hoặc tên môn học.');
      if (!teacherId || !teacherName) errors.push('Thiếu thông tin giảng viên.');
      if (!classCode) errors.push('Thiếu mã lớp học.');
      if (!room) errors.push('Thiếu phòng học.');
      if (!date) errors.push('Thiếu ngày học.');
      if (!startTime || !endTime) errors.push('Thiếu khung giờ bắt đầu hoặc kết thúc.');

      // Check logical conflict: Lecturer overlap
      if (teacherId && date && startTime && endTime) {
        const teacherKey = `${teacherId.toUpperCase()}_${date}`;
        if (!teacherSlots[teacherKey]) teacherSlots[teacherKey] = [];

        // Check overlap with existing slots in file
        for (const slot of teacherSlots[teacherKey]) {
          const isOverlap = !(endTime <= slot.start || startTime >= slot.end);
          if (isOverlap) {
            const conflictMsg = `Xung đột lịch dạy: Giảng viên ${teacherName} (${teacherId}) bị trùng lịch lúc ${startTime}-${endTime} với lớp ${slot.classCode} (Dòng ${slot.row}).`;
            errors.push(conflictMsg);
            conflictDetails.push(conflictMsg);
          }
        }
        teacherSlots[teacherKey].push({ start: startTime, end: endTime, room, row: rowNum, classCode });

        // Check room conflict
        const roomKey = `${room.toUpperCase()}_${date}`;
        if (!roomSlots[roomKey]) roomSlots[roomKey] = [];
        for (const rSlot of roomSlots[roomKey]) {
          const isOverlap = !(endTime <= rSlot.start || startTime >= rSlot.end);
          if (isOverlap) {
            const rConflictMsg = `Xung đột phòng học: Phòng ${room} bị trùng giờ ${startTime}-${endTime} giữa lớp ${classCode} và lớp ${rSlot.classCode} (Dòng ${rSlot.row}).`;
            errors.push(rConflictMsg);
            conflictDetails.push(rConflictMsg);
          }
        }
        roomSlots[roomKey].push({ start: startTime, end: endTime, teacher: teacherName, row: rowNum, classCode });
      }

      const isValid = errors.length === 0;
      if (isValid) {
        validCount++;
        if (warnings.length > 0) warningCount++;
      } else {
        errorCount++;
      }

      items.push({
        row: rowNum,
        data: row,
        isValid,
        errors,
        warnings
      });
    });

    return {
      fileName: file.name,
      totalRows: rawRows.length,
      validCount,
      errorCount,
      warningCount,
      items,
      conflictDetails
    };
  }

  // Export Attendance & EWS Report to formatted Excel
  static exportAttendanceExcel(
    session: ClassSession,
    ewsList: EarlyWarningStudent[],
    records: any[]
  ): void {
    const reportDate = new Date().toLocaleDateString('vi-VN');

    // Sheet 1: Bảng Điểm Danh Chi Tiết Buổi Học
    const sessionDetails = records.map((r, idx) => ({
      'STT': idx + 1,
      'Mã Sinh Viên': r.studentCode,
      'Họ và Tên': r.studentName,
      'Trạng Thái': this.getVietnameseStatus(r.status),
      'Chi Tiết (Phút)': r.lateMinutes ? `Muộn ${r.lateMinutes}p` : r.earlyMinutes ? `Sớm ${r.earlyMinutes}p` : '',
      'Minh Chứng Số': r.evidence?.fileName || 'Không',
      'Thời Điểm Điểm Danh': new Date(r.timestamp).toLocaleTimeString('vi-VN'),
      'Phương Thức': r.method === 'qr_dynamic' ? 'QR Code Động' : r.method === 'geofence' ? 'Geofence/GPS' : 'Thủ công',
      'Khoảng Cách (m)': r.distanceMeters ?? 'N/A',
      'Địa Chỉ IP': r.ipAddress || 'N/A',
      'Ghi Chú': r.notes || ''
    }));

    // Sheet 2: Danh Sách Cảnh Báo Sớm EWS (Tỷ Lệ Vắng >= 20%)
    const ewsReport = ewsList.map((e, idx) => ({
      'STT': idx + 1,
      'Mã SV': e.student.studentCode,
      'Họ và Tên': e.student.fullName,
      'Lớp': e.student.className,
      'Chuyên Ngành': e.student.major,
      'Tổng Số Buổi Môn': e.totalCourseSessions,
      'Số Buổi Vắng': e.absentSessions,
      'Vắng Không Phép': e.unexcusedAbsences,
      'Vắng Có Phép': e.excusedAbsences,
      'Đi Muộn': e.lateCount,
      'Tỷ Lệ Vắng (%)': `${e.absenceRate}%`,
      'Mức Độ Rủi Ro': e.riskLevel === 'critical' ? 'NGUY HIỂM (>=20% - Cấm thi)' : e.riskLevel === 'warning' ? 'CẢNH BÁO (Tiệm cận)' : 'AN TOÀN',
      'Phụ Huynh': e.student.parentName,
      'SĐT Phụ Huynh': e.student.parentPhone,
      'Email Phụ Huynh': e.student.parentEmail
    }));

    const workbook = XLSX.utils.book_new();

    const ws1 = XLSX.utils.json_to_sheet(sessionDetails);
    XLSX.utils.book_append_sheet(workbook, ws1, `Diem_Danh_${session.courseCode}`);

    const ws2 = XLSX.utils.json_to_sheet(ewsReport);
    XLSX.utils.book_append_sheet(workbook, ws2, 'Canh_Bao_Som_EWS');

    XLSX.writeFile(workbook, `Bao_Cao_Diem_Danh_${session.courseCode}_${session.className}_${reportDate.replace(/\//g, '-')}.xlsx`);
  }

  private static getVietnameseStatus(status: string): string {
    switch (status) {
      case 'present': return 'Có mặt';
      case 'late': return 'Đi muộn';
      case 'early_departure': return 'Về sớm';
      case 'excused_absence': return 'Vắng có phép';
      case 'unexcused_absence': return 'Vắng không phép';
      default: return status;
    }
  }
}
