import React from 'react';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  GraduationCap, 
  ArrowUpRight, 
  Lock, 
  CheckCircle2, 
  Calendar,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Activity,
  Presentation,
  Download
} from 'lucide-react';
import { ClassSession, EarlyWarningStudent, AuditLogEntry } from '../types/attendance';
import { PptxExportService } from '../services/pptxExportService';
import { AttendanceHeatmap } from './AttendanceHeatmap';
import { GamificationWidget } from './GamificationWidget';

interface DashboardViewProps {
  sessions: ClassSession[];
  ewsList: EarlyWarningStudent[];
  auditLogs: AuditLogEntry[];
  onNavigateTab: (tab: 'attendance' | 'ews' | 'excel' | 'audit') => void;
  onSelectSession: (session: ClassSession) => void;
  onOpenAdvisor: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sessions,
  ewsList,
  auditLogs,
  onNavigateTab,
  onSelectSession,
  onOpenAdvisor
}) => {
  const criticalEwsCount = ewsList.filter(e => e.riskLevel === 'critical').length;
  const warningEwsCount = ewsList.filter(e => e.riskLevel === 'warning').length;
  const lockedSessionsCount = sessions.filter(s => s.status === 'locked').length;
  const activeSessionsCount = sessions.filter(s => s.status === 'in_progress' || s.status === 'scheduled').length;

  // Vocational Majors Comparative Analysis
  const majorStats = [
    { name: 'Công nghệ Thông tin', code: 'CNTT', attendanceRate: 92.4, studentCount: 120, riskCount: 2 },
    { name: 'Cơ điện tử & Tự động hóa', code: 'CĐT', attendanceRate: 88.6, studentCount: 85, riskCount: 1 },
    { name: 'Thiết kế Đồ họa Kỹ thuật số', code: 'TKĐH', attendanceRate: 94.8, studentCount: 65, riskCount: 0 },
    { name: 'Kỹ thuật Mạng & An toàn Thông tin', code: 'ATTT', attendanceRate: 90.2, studentCount: 90, riskCount: 1 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Hero Executive Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium">
              <span>Học kỳ 1 · Năm học 2026 - 2027</span>
              <span aria-hidden="true">·</span>
              <span>Cơ sở Đào tạo Thủ Đức</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Hệ Thống Quản Lý Đào Tạo & Điểm Danh Đa Tầng
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Vận hành trên 3 trụ cột cốt lõi: Tính toàn vẹn dữ liệu từ Excel, kiểm soát bối cảnh 3 tầng (Giảng viên · Khung giờ · Geofence/IP), và cơ chế cảnh báo sớm EWS ngưỡng 20%.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* PPTX Export Button from SKILL EDUCATION pptx-official */}
            <button
              onClick={() => PptxExportService.exportExecutiveMeetingDeck(sessions, ewsList, auditLogs)}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-500 text-white shadow-xs transition-colors flex items-center gap-1.5"
              title="Xuất Slide PowerPoint báo cáo giao ban đào tạo cho Ban Giám Hiệu"
            >
              <Presentation className="w-4 h-4" />
              <span>Xuất Slide Giao Ban (.pptx)</span>
            </button>

            <button
              onClick={() => onNavigateTab('attendance')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Vào Điểm Danh Ca Học</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAdvisor}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Cố Vấn AI EdTech</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tỷ Lệ Chuyên Cần Toàn Trường</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">91.4%</span>
            <span className="text-2xs font-semibold text-emerald-600">+1.2% so với kỳ trước</span>
          </div>
          <div className="mt-2 text-2xs text-slate-500">
            Dữ liệu đối soát trực tiếp từ cảm biến Geofence & Dynamic QR
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Cảnh Báo Sớm EWS (Nguy Cơ &ge;20%)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 font-mono tracking-tight">
              {criticalEwsCount} SV
            </span>
            <span className="text-2xs font-medium text-slate-500">
              +{warningEwsCount} ở ngưỡng rủi ro
            </span>
          </div>
          <div className="mt-2 text-2xs text-slate-500 flex items-center justify-between">
            <span>Nguy cơ đình chỉ thi</span>
            <button 
              onClick={() => onNavigateTab('ews')}
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Xử lý ngay &rarr;
            </button>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tính Bất Biến Ca Học (Locking)</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {lockedSessionsCount}/{sessions.length}
            </span>
            <span className="text-2xs font-semibold text-indigo-600">Đã khóa sổ</span>
          </div>
          <div className="mt-2 text-2xs text-slate-500">
            Dữ liệu đóng băng, mọi can thiệp yêu cầu Admin Override
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Chuẩn Hóa Dữ Liệu & Audit Log</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {auditLogs.length}
            </span>
            <span className="text-2xs font-semibold text-slate-600">Bản ghi lưu vết</span>
          </div>
          <div className="mt-2 text-2xs text-slate-500 flex items-center justify-between">
            <span>Không thể xóa/sửa</span>
            <button 
              onClick={() => onNavigateTab('audit')}
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Kiểm toán &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* D3.js Attendance Heatmap Integration */}
      <AttendanceHeatmap ewsList={ewsList} />

      {/* Gamification Widget Integration */}
      <GamificationWidget />

      {/* Main Grid: Major Stats & Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Major Attendance Breakdown */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Tỷ Lệ Chuyên Cần Theo Khối Ngành Đào Tạo</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Phân tích đối sánh tỷ lệ có mặt và số lượng sinh viên chạm ngưỡng cảnh báo EWS
              </p>
            </div>
            <span className="text-2xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
              ISO 27001 Data Integrity
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {majorStats.map((major) => (
              <div key={major.code} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-2xs">
                      {major.code}
                    </span>
                    <strong className="text-slate-800">{major.name}</strong>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-2xs">{major.studentCount} sinh viên</span>
                    <span className="font-mono font-bold text-indigo-600 text-xs">{major.attendanceRate}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all"
                    style={{ width: `${major.attendanceRate}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-2xs text-slate-500">
                  <span>Mục tiêu chuyên cần kỳ: &ge; 90%</span>
                  {major.riskCount > 0 ? (
                    <span className="text-rose-600 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {major.riskCount} SV chạm ngưỡng cấm thi (20%)
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Tất cả an toàn
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live / Recent Class Sessions */}
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Thời Khóa Biểu Hôm Nay</span>
              </h3>
              <span className="text-2xs font-mono text-slate-400">
                {sessions.length} ca học
              </span>
            </div>

            <div className="space-y-3">
              {sessions.slice(0, 3).map((sess) => {
                const isLocked = sess.status === 'locked';
                return (
                  <div
                    key={sess.id}
                    onClick={() => {
                      onSelectSession(sess);
                      onNavigateTab('attendance');
                    }}
                    className="p-3 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 cursor-pointer transition-all shadow-2xs group"
                  >
                    <div className="flex items-center justify-between text-2xs text-slate-500 mb-1">
                      <span className="font-mono font-semibold text-indigo-600">{sess.courseCode}</span>
                      <span className="flex items-center gap-1">
                        {isLocked ? (
                          <span className="text-rose-600 font-semibold flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Đã khóa
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Đang diễn ra
                          </span>
                        )}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {sess.courseName}
                    </h4>

                    <div className="mt-2 flex items-center justify-between text-2xs text-slate-500">
                      <span>Lớp: <strong className="text-slate-800">{sess.className}</strong></span>
                      <span className="font-mono">{sess.timeSlot.start} - {sess.timeSlot.end}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit Log Activity Snapshot */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-700" />
                <span>Nhật Ký Lưu Vết Gần Nhất</span>
              </h3>
              <button
                onClick={() => onNavigateTab('audit')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Xem tất cả
              </button>
            </div>

            <div className="space-y-3">
              {auditLogs.slice(0, 3).map((log) => (
                <div key={log.id} className="text-xs pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-2xs text-slate-400">
                    <span className="font-semibold text-slate-700">{log.actorName}</span>
                    <span className="font-mono">{new Date(log.timestamp).toLocaleTimeString('vi-VN')}</span>
                  </div>
                  <p className="text-2xs text-slate-600 mt-1 line-clamp-2">
                    {log.description}
                  </p>
                  {log.reason && (
                    <span className="inline-block mt-1 text-2xs text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                      Lý do: {log.reason}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
