import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Clock, 
  User, 
  AlertCircle, 
  FileText, 
  Lock, 
  RefreshCw, 
  Send, 
  Download 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { AuditLogEntry } from '../types/attendance';

interface AuditLogViewProps {
  logs: AuditLogEntry[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesAction = filterAction === 'all' || log.actionType === filterAction;
    const matchesSearch = 
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesAction && matchesSearch;
  });

  const handleExportAuditLogs = () => {
    const exportData = filteredLogs.map((log, idx) => ({
      'STT': idx + 1,
      'Thời Điểm': new Date(log.timestamp).toLocaleString('vi-VN'),
      'Người Thực Hiện': log.actorName,
      'Vai Trò': log.actorRole === 'admin' ? 'Quản trị viên' : log.actorRole === 'teacher' ? 'Giảng viên' : 'Hệ thống',
      'Hành Động': log.actionType,
      'Mô Tả': log.description,
      'Lý Do Can Thiệp': log.reason || '',
      'Trạng Thái Cũ': log.previousState || '',
      'Trạng Thái Mới': log.newState || '',
      'Địa Chỉ IP': log.ipAddress || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Nhat_Ky_Audit_Log');
    XLSX.writeFile(wb, `Audit_Log_Diem_Danh_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const getActionBadge = (type: string) => {
    switch (type) {
      case 'ADMIN_OVERRIDE':
        return {
          label: 'Can Thiệp Admin',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: AlertCircle
        };
      case 'SESSION_LOCKED':
        return {
          label: 'Khóa Sổ Buổi Học',
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          icon: Lock
        };
      case 'EWS_ALERT_DISPATCH':
        return {
          label: 'Cảnh Báo EWS',
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          icon: Send
        };
      case 'EXCEL_IMPORT':
        return {
          label: 'Nạp Tệp Excel',
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          icon: FileText
        };
      case 'OFFLINE_SYNC':
        return {
          label: 'Đồng Bộ Offline',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: RefreshCw
        };
      default:
        return {
          label: type,
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: Clock
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                Immutable Audit Trail
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Nguyên tắc bất biến của dữ liệu kiểm toán đào tạo
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Nhật Ký Kiểm Toán Hệ Thống (Audit Log)
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Ghi nhận chi tiết, bảo toàn lịch sử mọi thao tác: Khóa sổ buổi học, Can thiệp điểm danh sau khóa kèm lý do bắt buộc, nạp dữ liệu Excel, phát cảnh báo EWS và đồng bộ lưu đệm ngoại tuyến.
            </p>
          </div>

          <button
            onClick={handleExportAuditLogs}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors self-start lg:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Xuất Nhật Ký Kiểm Toán (Excel)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setFilterAction('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterAction === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({logs.length})
          </button>
          <button
            onClick={() => setFilterAction('ADMIN_OVERRIDE')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterAction === 'ADMIN_OVERRIDE'
                ? 'bg-white text-amber-800 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Can thiệp Admin
          </button>
          <button
            onClick={() => setFilterAction('SESSION_LOCKED')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterAction === 'SESSION_LOCKED'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Khóa buổi học
          </button>
          <button
            onClick={() => setFilterAction('EWS_ALERT_DISPATCH')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterAction === 'EWS_ALERT_DISPATCH'
                ? 'bg-white text-rose-800 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cảnh báo EWS
          </button>
          <button
            onClick={() => setFilterAction('EXCEL_IMPORT')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterAction === 'EXCEL_IMPORT'
                ? 'bg-white text-indigo-800 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nạp Excel
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo người thực hiện, lý do..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 pl-9 pr-3 py-2 bg-white text-slate-900 focus:outline-indigo-600"
          />
        </div>
      </div>

      {/* Audit Log Timeline Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-44">Thời Gian & IP</th>
                <th className="py-3 px-4">Loại Hành Động</th>
                <th className="py-3 px-4">Chủ Thể Thực Hiện</th>
                <th className="py-3 px-4">Nội Dung Thao Tác & Lưu Vết</th>
                <th className="py-3 px-4">Giải Trình / Lý Do Bắt Buộc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map((log) => {
                const badge = getActionBadge(log.actionType);
                const IconComponent = badge.icon;

                return (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Time & IP */}
                    <td className="py-3.5 px-4 font-mono text-2xs text-slate-500 whitespace-nowrap">
                      <div className="font-semibold text-slate-900">
                        {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                      </div>
                      <div>{new Date(log.timestamp).toLocaleDateString('vi-VN')}</div>
                      <span className="text-slate-400 font-mono mt-0.5 block">{log.ipAddress || '10.20.1.5'}</span>
                    </td>

                    {/* Action type */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-2xs font-semibold border ${badge.bg}`}>
                        <IconComponent className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>
                    </td>

                    {/* Actor */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{log.actorName}</div>
                      <span className="text-2xs text-slate-400">
                        Vai trò: {log.actorRole === 'admin' ? 'Quản trị viên' : log.actorRole === 'teacher' ? 'Giảng viên' : 'Hệ thống'}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4">
                      <p className="text-xs text-slate-800">{log.description}</p>
                      {(log.previousState || log.newState) && (
                        <div className="mt-1 flex items-center gap-2 text-2xs font-mono">
                          <span className="text-rose-600 line-through">{log.previousState}</span>
                          <span className="text-slate-400">→</span>
                          <span className="text-emerald-700 font-semibold">{log.newState}</span>
                        </div>
                      )}
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-4 text-xs">
                      {log.reason ? (
                        <div className="bg-amber-50/70 border border-amber-100 p-2 rounded text-2xs text-amber-900 font-medium">
                          {log.reason}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-2xs italic">Không yêu cầu giải trình</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
