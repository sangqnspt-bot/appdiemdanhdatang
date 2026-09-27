import React, { useState } from 'react';
import { X, FileText, CheckCircle2, AlertCircle, Upload, Shield } from 'lucide-react';
import { AbsenceEvidence } from '../types/attendance';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  studentCode: string;
  evidence?: AbsenceEvidence;
  onSaveEvidence: (evidence: AbsenceEvidence) => void;
  canApprove: boolean;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  isOpen,
  onClose,
  studentName,
  studentCode,
  evidence,
  onSaveEvidence,
  canApprove
}) => {
  const [reasonType, setReasonType] = useState<'medical' | 'official_duty' | 'family' | 'other'>(
    evidence?.reasonType || 'medical'
  );
  const [note, setNote] = useState(evidence?.note || '');
  const [fileName, setFileName] = useState(evidence?.fileName || 'Giay_Kham_Chua_Benh.pdf');
  const [isApproved, setIsApproved] = useState(evidence?.isApproved ?? true);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveEvidence({
      id: evidence?.id || `evi-${Date.now()}`,
      fileName,
      fileType: 'application/pdf',
      fileSizeKb: evidence?.fileSizeKb || 380,
      uploadedAt: evidence?.uploadedAt || new Date().toISOString(),
      reasonType,
      note,
      isApproved,
      approvedBy: isApproved ? 'Phòng Đào Tạo / Giảng viên' : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Minh Chứng Số Hóa Nghỉ Học Có Phép
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sinh viên: {studentName} · MSSV: {studentCode}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Loại Lý Do
            </label>
            <select
              value={reasonType}
              onChange={(e) => setReasonType(e.target.value as any)}
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-indigo-600"
            >
              <option value="medical">Y tế / Ốm đau (Có đơn thuốc/giấy khám BS)</option>
              <option value="official_duty">Công tác trường / Thi Olympic / Đoàn thể</option>
              <option value="family">Việc gia đình có xác nhận phụ huynh</option>
              <option value="other">Lý do chính đáng khác</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Tệp Minh Chứng Số
            </label>
            <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-red-100 text-red-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-900 block">{fileName}</span>
                  <span className="text-2xs text-slate-500">Định dạng PDF/Ảnh · Đã mã hóa lưu trữ</span>
                </div>
              </div>
              <label className="cursor-pointer text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded shadow-2xs">
                <span>Thay tệp</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setFileName(e.target.files[0].name);
                    }
                  }} 
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nội Dung Trình Bày & Chẩn Đoán Y Khoa
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập chi tiết chẩn đoán của cơ sở y tế hoặc lý do nghỉ học cụ thể..."
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-indigo-600"
            />
          </div>

          {canApprove && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 flex items-start gap-3">
              <Shield className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="text-xs text-indigo-900">
                <span className="font-semibold block">Quyền Phê Duyệt Hồ Sơ</span>
                <span>Hồ sơ hợp lệ sẽ không bị tính vào diện Vắng không phép gây cấm thi theo Quy chế Đào tạo.</span>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="approve-chk"
                    checked={isApproved}
                    onChange={(e) => setIsApproved(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="approve-chk" className="font-medium text-slate-800 cursor-pointer">
                    Xác nhận hồ sơ đạt chuẩn và phê duyệt phép
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            Lưu Minh Chứng
          </button>
        </div>
      </div>
    </div>
  );
};
