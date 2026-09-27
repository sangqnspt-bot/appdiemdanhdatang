import React, { useState } from 'react';
import { 
  Lock, 
  Unlock, 
  QrCode, 
  ListOrdered, 
  Check, 
  Clock, 
  LogOut, 
  FileCheck2, 
  X, 
  Download, 
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Users
} from 'lucide-react';
import { 
  ClassSession, 
  Student, 
  AttendanceRecord, 
  GeofenceConfig, 
  AttendanceStatusType,
  AbsenceEvidence
} from '../types/attendance';
import { ContextValidationBar } from './ContextValidationBar';
import { DynamicQRGenerator } from './DynamicQRGenerator';
import { EvidenceModal } from './EvidenceModal';
import { AdminOverrideModal } from './AdminOverrideModal';
import { ExcelService } from '../services/excelService';
import { StorageService } from '../services/storageService';

interface AttendanceLiveViewProps {
  sessions: ClassSession[];
  currentSession: ClassSession;
  onSelectSession: (session: ClassSession) => void;
  students: Student[];
  records: AttendanceRecord[];
  onUpdateRecord: (record: AttendanceRecord) => void;
  onLockSession: (sessionId: string) => void;
  onAdminOverride: (params: any) => void;
  geofenceConfig: GeofenceConfig;
  userRole: 'teacher' | 'admin';
  isOffline: boolean;
  onNavigateToEWS: () => void;
}

export const AttendanceLiveView: React.FC<AttendanceLiveViewProps> = ({
  sessions,
  currentSession,
  onSelectSession,
  students,
  records,
  onUpdateRecord,
  onLockSession,
  onAdminOverride,
  geofenceConfig,
  userRole,
  isOffline,
  onNavigateToEWS
}) => {
  const [activeMode, setActiveMode] = useState<'table' | 'qr'>('table');
  
  // Geolocation simulator state (defaults within campus)
  const [simLat, setSimLat] = useState(geofenceConfig.latitude + 0.0001);
  const [simLng, setSimLng] = useState(geofenceConfig.longitude + 0.0001);
  const [simIp, setSimIp] = useState('192.168.1.105');

  // Modal states
  const [evidenceModalData, setEvidenceModalData] = useState<{
    isOpen: boolean;
    studentName: string;
    studentCode: string;
    recordId: string;
    evidence?: AbsenceEvidence;
  }>({
    isOpen: false,
    studentName: '',
    studentCode: '',
    recordId: ''
  });

  const [overrideModalData, setOverrideModalData] = useState<{
    isOpen: boolean;
    record: AttendanceRecord | null;
  }>({
    isOpen: false,
    record: null
  });

  // Filter students belonging to this class
  const classStudents = students.filter(s => s.classId === currentSession.classId);

  // Compute map of studentId -> AttendanceRecord
  const recordMap = new Map<string, AttendanceRecord>(
    records.filter(r => r.sessionId === currentSession.id).map(r => [r.studentId, r])
  );

  const unmarkedStudents = classStudents.filter(s => !recordMap.has(s.id));

  // Statistics
  const presentCount = classStudents.filter(s => recordMap.get(s.id)?.status === 'present').length;
  const lateCount = classStudents.filter(s => recordMap.get(s.id)?.status === 'late').length;
  const earlyCount = classStudents.filter(s => recordMap.get(s.id)?.status === 'early_departure').length;
  const excusedCount = classStudents.filter(s => recordMap.get(s.id)?.status === 'excused_absence').length;
  const unexcusedCount = classStudents.filter(s => recordMap.get(s.id)?.status === 'unexcused_absence').length;

  const isLocked = currentSession.status === 'locked' || currentSession.status === 'completed';

  // Handlers
  const handleSetStatus = (
    student: Student,
    status: AttendanceStatusType,
    lateMinutes?: number,
    earlyMinutes?: number,
    evidence?: AbsenceEvidence
  ) => {
    if (isLocked && userRole !== 'admin') {
      alert('Buổi học đã khóa. Mọi thay đổi bắt buộc phải do Quản trị viên can thiệp kèm lý do Audit Log.');
      return;
    }

    const existing = recordMap.get(student.id);
    const newRecord: AttendanceRecord = {
      id: existing?.id || `rec-${Date.now()}-${student.id}`,
      sessionId: currentSession.id,
      studentId: student.id,
      studentCode: student.studentCode,
      studentName: student.fullName,
      status,
      lateMinutes: status === 'late' ? (lateMinutes || 15) : undefined,
      earlyMinutes: status === 'early_departure' ? (earlyMinutes || 15) : undefined,
      evidence: status === 'excused_absence' ? evidence : existing?.evidence,
      timestamp: new Date().toISOString(),
      method: activeMode === 'qr' ? 'qr_dynamic' : 'manual',
      verifiedBy: userRole === 'admin' ? 'adm-01' : currentSession.teacherId,
      ipAddress: simIp,
      distanceMeters: 18,
      isSynced: !isOffline
    };

    onUpdateRecord(newRecord);
  };

  const handleMarkAllPresent = () => {
    if (isLocked) return;
    classStudents.forEach(s => {
      if (!recordMap.has(s.id)) {
        handleSetStatus(s, 'present');
      }
    });
  };

  const handleExportSession = () => {
    const sessionRecords = classStudents.map(s => {
      const rec = recordMap.get(s.id);
      return rec || {
        studentCode: s.studentCode,
        studentName: s.fullName,
        status: 'Chưa điểm danh',
        timestamp: new Date().toISOString(),
        method: 'none'
      };
    });
    ExcelService.exportAttendanceExcel(currentSession, StorageService.getEarlyWarningList(), sessionRecords);
  };

  return (
    <div className="space-y-6">
      
      {/* Session Selection & Status Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs text-slate-500">
              <span>Học phần:</span>
              <strong className="font-mono text-slate-900">{currentSession.courseCode}</strong>
              <span aria-hidden="true">·</span>
              <span>Lớp:</span>
              <strong className="text-slate-900">{currentSession.className}</strong>
              <span aria-hidden="true">·</span>
              <span>Buổi #{currentSession.sessionNumber}/{currentSession.totalCourseSessions}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {currentSession.courseName}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Giảng viên: <span className="font-medium text-slate-900">{currentSession.teacherName}</span> · Phòng: <span className="font-mono">{currentSession.room}</span> · Giờ: <span className="font-mono">{currentSession.timeSlot.start} - {currentSession.timeSlot.end}</span>
            </p>
          </div>

          {/* Session Switcher & Lock Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={currentSession.id}
              onChange={(e) => {
                const found = sessions.find(s => s.id === e.target.value);
                if (found) onSelectSession(found);
              }}
              className="text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-indigo-600"
            >
              {sessions.map(s => (
                <option key={s.id} value={s.id}>
                  {s.className} - {s.courseCode} ({s.date} {s.status === 'locked' ? '· Đã khóa' : '· Đang mở'})
                </option>
              ))}
            </select>

            {isLocked ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Dữ Liệu Đã Khóa (Bất Biến)</span>
                </span>
                {userRole === 'admin' && (
                  <span className="text-2xs text-slate-500 italic">
                    (Admin có quyền can thiệp Override kèm lý do)
                  </span>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  if (confirm(`Bạn có chắc muốn KHÓA SỔ buổi học "${currentSession.courseName}"? Sau khi khóa, dữ liệu sẽ bất biến và chuyển sang chế độ thanh tra.`)) {
                    onLockSession(currentSession.id);
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Khóa Sổ Buổi Học</span>
              </button>
            )}

            <button
              onClick={handleExportSession}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>

        {/* Real-time Attendance Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-5 pt-4 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 text-2xs block">Có Mặt (Present)</span>
            <span className="text-base font-bold text-emerald-600 font-mono">
              {presentCount}/{classStudents.length}
            </span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 text-2xs block">Đi Muộn (Late)</span>
            <span className="text-base font-bold text-amber-600 font-mono">
              {lateCount} SV
            </span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 text-2xs block">Về Sớm (Early)</span>
            <span className="text-base font-bold text-indigo-600 font-mono">
              {earlyCount} SV
            </span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 text-2xs block">Vắng Có Phép</span>
            <span className="text-base font-bold text-blue-600 font-mono">
              {excusedCount} SV
            </span>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 text-2xs block">Vắng Không Phép</span>
            <span className="text-base font-bold text-rose-600 font-mono">
              {unexcusedCount} SV
            </span>
          </div>
        </div>
      </div>

      {/* 3-Tier Context Validation Bar */}
      <ContextValidationBar
        session={currentSession}
        currentTeacherId={currentSession.teacherId}
        currentTeacherName={currentSession.teacherName}
        geofenceConfig={geofenceConfig}
        currentLat={simLat}
        currentLng={simLng}
        currentIp={simIp}
        onChangeLocation={(lat, lng, ip) => {
          setSimLat(lat);
          setSimLng(lng);
          setSimIp(ip);
        }}
      />

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeMode === 'table'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Bảng Điểm Danh Chi Tiết ({classStudents.length} SV)</span>
          </button>
          <button
            onClick={() => setActiveMode('qr')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeMode === 'qr'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Mã QR Động TOTP</span>
          </button>
        </div>

        {activeMode === 'table' && !isLocked && (
          <button
            onClick={handleMarkAllPresent}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Đánh dấu toàn bộ có mặt
          </button>
        )}
      </div>

      {/* Dynamic QR Mode View */}
      {activeMode === 'qr' && (
        <DynamicQRGenerator
          sessionId={currentSession.id}
          courseName={currentSession.courseName}
          className={currentSession.className}
          unmarkedStudents={unmarkedStudents}
          onStudentScanned={(studentId) => {
            const student = students.find(s => s.id === studentId);
            if (student) handleSetStatus(student, 'present');
          }}
        />
      )}

      {/* Table Mode View: 5-Status Granular Selector */}
      {activeMode === 'table' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4">Sinh Viên</th>
                  <th className="py-3 px-4">MSSV</th>
                  <th className="py-3 px-4">Trạng Thái Điểm Danh</th>
                  <th className="py-3 px-4">Minh Chứng Số</th>
                  <th className="py-3 px-4">Thời Gian & IP</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {classStudents.map((student, idx) => {
                  const record = recordMap.get(student.id);
                  const status = record?.status;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* STT */}
                      <td className="py-3 px-4 text-center font-mono text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Student info */}
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-semibold flex items-center justify-center text-2xs">
                            {student.fullName.split(' ').slice(-1)[0][0]}
                          </div>
                          <div>
                            <span className="block font-semibold text-slate-900">{student.fullName}</span>
                            <span className="text-2xs text-slate-400">{student.parentPhone}</span>
                          </div>
                        </div>
                      </td>

                      {/* MSSV */}
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {student.studentCode}
                      </td>

                      {/* 5-Status Interactive Buttons */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1">
                          
                          {/* Present */}
                          <button
                            disabled={isLocked && userRole !== 'admin'}
                            onClick={() => handleSetStatus(student, 'present')}
                            className={`px-2 py-1 rounded text-2xs font-semibold transition-colors ${
                              status === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Có mặt
                          </button>

                          {/* Late */}
                          <button
                            disabled={isLocked && userRole !== 'admin'}
                            onClick={() => {
                              const min = prompt('Nhập số phút đi muộn (phút):', record?.lateMinutes?.toString() || '15');
                              if (min !== null) {
                                handleSetStatus(student, 'late', parseInt(min) || 15);
                              }
                            }}
                            className={`px-2 py-1 rounded text-2xs font-semibold transition-colors ${
                              status === 'late'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Đi muộn {status === 'late' && record?.lateMinutes ? `(${record.lateMinutes}p)` : ''}
                          </button>

                          {/* Early Departure */}
                          <button
                            disabled={isLocked && userRole !== 'admin'}
                            onClick={() => {
                              const min = prompt('Nhập số phút về sớm (phút):', record?.earlyMinutes?.toString() || '30');
                              if (min !== null) {
                                handleSetStatus(student, 'early_departure', undefined, parseInt(min) || 30);
                              }
                            }}
                            className={`px-2 py-1 rounded text-2xs font-semibold transition-colors ${
                              status === 'early_departure'
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Về sớm {status === 'early_departure' && record?.earlyMinutes ? `(${record.earlyMinutes}p)` : ''}
                          </button>

                          {/* Excused Absence */}
                          <button
                            disabled={isLocked && userRole !== 'admin'}
                            onClick={() => {
                              setEvidenceModalData({
                                isOpen: true,
                                studentName: student.fullName,
                                studentCode: student.studentCode,
                                recordId: record?.id || '',
                                evidence: record?.evidence
                              });
                            }}
                            className={`px-2 py-1 rounded text-2xs font-semibold transition-colors flex items-center gap-1 ${
                              status === 'excused_absence'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <span>Vắng có phép</span>
                            {record?.evidence && <FileCheck2 className="w-3 h-3" />}
                          </button>

                          {/* Unexcused Absence */}
                          <button
                            disabled={isLocked && userRole !== 'admin'}
                            onClick={() => handleSetStatus(student, 'unexcused_absence')}
                            className={`px-2 py-1 rounded text-2xs font-semibold transition-colors ${
                              status === 'unexcused_absence'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Vắng không phép
                          </button>
                        </div>
                      </td>

                      {/* Evidence status */}
                      <td className="py-3 px-4">
                        {record?.evidence ? (
                          <button
                            onClick={() => {
                              setEvidenceModalData({
                                isOpen: true,
                                studentName: student.fullName,
                                studentCode: student.studentCode,
                                recordId: record.id,
                                evidence: record.evidence
                              });
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 underline"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[140px]">{record.evidence.fileName}</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-2xs">—</span>
                        )}
                      </td>

                      {/* Time & IP */}
                      <td className="py-3 px-4 font-mono text-2xs text-slate-500">
                        {record?.timestamp ? (
                          <div>
                            <span>{new Date(record.timestamp).toLocaleTimeString('vi-VN')}</span>
                            <span className="block text-slate-400">{record.ipAddress || '192.168.1.100'}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Chưa ghi</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        {isLocked ? (
                          userRole === 'admin' ? (
                            <button
                              onClick={() => {
                                if (record) {
                                  setOverrideModalData({
                                    isOpen: true,
                                    record
                                  });
                                }
                              }}
                              className="px-2.5 py-1 text-2xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded shadow-2xs transition-colors"
                            >
                              Can thiệp (Override)
                            </button>
                          ) : (
                            <span className="text-slate-400 text-2xs italic flex items-center justify-end gap-1">
                              <Lock className="w-3 h-3" /> Đã khóa
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400 text-2xs">Sẵn sàng</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Evidence Modal */}
      <EvidenceModal
        isOpen={evidenceModalData.isOpen}
        onClose={() => setEvidenceModalData({ ...evidenceModalData, isOpen: false })}
        studentName={evidenceModalData.studentName}
        studentCode={evidenceModalData.studentCode}
        evidence={evidenceModalData.evidence}
        canApprove={userRole === 'admin' || userRole === 'teacher'}
        onSaveEvidence={(evi) => {
          const student = students.find(s => s.studentCode === evidenceModalData.studentCode);
          if (student) {
            handleSetStatus(student, 'excused_absence', undefined, undefined, evi);
          }
        }}
      />

      {/* Admin Override Modal */}
      <AdminOverrideModal
        isOpen={overrideModalData.isOpen}
        onClose={() => setOverrideModalData({ isOpen: false, record: null })}
        record={overrideModalData.record}
        onConfirmOverride={(params) => {
          onAdminOverride(params);
        }}
      />
    </div>
  );
};
