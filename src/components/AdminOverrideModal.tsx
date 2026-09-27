import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { AttendanceRecord, AttendanceStatusType } from '../types/attendance';
import { StorageService } from '../services/storageService';

interface AdminOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
  onConfirmOverride: (params: {
    recordId: string;
    newStatus: AttendanceStatusType;
    lateMinutes?: number;
    earlyMinutes?: number;
    reason: string;
    adminName: string;
    evidenceNote?: string;
  }) => void;
}

export const AdminOverrideModal: React.FC<AdminOverrideModalProps> = ({
  isOpen,
  onClose,
  record,
  onConfirmOverride
}) => {
  if (!isOpen || !record) return null;

  const [newStatus, setNewStatus] = useState<AttendanceStatusType>(record.status);
  const [lateMinutes, setLateMinutes] = useState<number>(record.lateMinutes || 15);
  const [earlyMinutes, setEarlyMinutes] = useState<number>(record.earlyMinutes || 15);
  const [reason, setReason] = useState('');
  const [evidenceNote, setEvidenceNote] = useState('');
  const [adminName, setAdminName] = useState('Phòng Đào Tạo - Nguyễn Hoàng Nam');
  const [errorMsg, setErrorMsg] = useState('');

  const previousLabel = StorageService.getStatusLabel(record.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 10) {
      setErrorMsg('Vui lòng nhập lý do can thiệp chi tiết (tối thiểu 10 ký tự) để phục vụ thanh tra lưu vết Audit Log.');
      return;
    }

    onConfirmOverride({
      recordId: record.id,
      newStatus,
      lateMinutes: newStatus === 'late' ? lateMinutes : undefined,
      earlyMinutes: newStatus === 'early_departure' ? earlyMinutes : undefined,
      reason: reason.trim(),
      adminName: adminName.trim(),
      evidenceNote: evidenceNote.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header with Admin Badge */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-amber-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Can Thiệp Dữ Liệu Sau Khóa (Admin Override)
              </h3>
              <p className="text-xs text-amber-800 font-medium">
                Buổi học đã khóa sổ · Bắt buộc giải trình lưu vết Audit Log
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Target Student Info */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-slate-900">{record.studentName}</span>
              <span className="font-mono">{record.studentCode}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span>Trạng thái hiện tại:</span>
              <strong className="text-slate-900 font-medium">{previousLabel}</strong>
            </div>
          </div>

          {/* New Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Trạng Thái Mới Cần Điều Chỉnh
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as any)}
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-indigo-600"
            >
              <option value="present">Có mặt (Present)</option>
              <option value="late">Đi muộn (Late)</option>
              <option value="early_departure">Về sớm (Early Departure)</option>
              <option value="excused_absence">Vắng có phép (Excused Absence)</option>
              <option value="unexcused_absence">Vắng không phép (Unexcused Absence)</option>
            </select>
          </div>

          {/* Minute modifiers */}
          {newStatus === 'late' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Số Phút Đi Muộn
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={240}
                  value={lateMinutes}
                  onChange={(e) => setLateMinutes(Number(e.target.value))}
                  className="w-24 text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-indigo-600 font-mono"
                />
                <span className="text-xs text-slate-500">phút</span>
              </div>
            </div>
          )}

          {newStatus === 'early_departure' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Số Phút Về Sớm
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={240}
                  value={earlyMinutes}
                  onChange={(e) => setEarlyMinutes(Number(e.target.value))}
                  className="w-24 text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-indigo-600 font-mono"
                />
                <span className="text-xs text-slate-500">phút</span>
              </div>
            </div>
          )}

          {/* Compulsory Reason */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Lý Do Can Thiệp / Căn Cứ Pháp Lý (*)
              </label>
              <span className="text-2xs text-red-600 font-medium">Bắt buộc theo ISO & EWS</span>
            </div>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Ví dụ: Sinh viên nộp bổ sung giấy nằm viện có dấu mộc tròn của Bệnh viện Đa khoa theo Quyết định số 12/QĐ-ĐHQG..."
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-indigo-600"
            />
            {errorMsg && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errorMsg}</p>
            )}
          </div>

          {/* Admin Identity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Người Thực Hiện Can Thiệp
            </label>
            <input
              type="text"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-indigo-600"
            />
          </div>

          <div className="p-3 rounded-lg bg-slate-100 text-2xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Cơ chế bất biến (Data Immutability):</span>
            </div>
            <p>
              Bản ghi sau khi thay đổi sẽ tạo một thẻ kiểm toán Audit Log vĩnh viễn, lưu giữ danh tính người sửa, thời điểm và lý do đối soát.
            </p>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors shadow-xs"
            >
              Lưu & Ghi Nhật Ký Audit Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
