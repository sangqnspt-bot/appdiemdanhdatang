import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Send, 
  Mail, 
  Phone, 
  Bell, 
  CheckCircle2, 
  Search, 
  Filter, 
  Download,
  ShieldAlert,
  FileSpreadsheet,
  Users,
  FileText
} from 'lucide-react';
import { EarlyWarningStudent, AlertNotificationPayload } from '../types/attendance';
import { StorageService } from '../services/storageService';
import { ExcelService } from '../services/excelService';
import { DocxExportService } from '../services/docxExportService';

interface EarlyWarningSystemViewProps {
  ewsList: EarlyWarningStudent[];
  onDispatchAlert: (payload: AlertNotificationPayload) => void;
  userRole: 'teacher' | 'admin';
}

export const EarlyWarningSystemView: React.FC<EarlyWarningSystemViewProps> = ({
  ewsList,
  onDispatchAlert,
  userRole
}) => {
  const [filterLevel, setFilterLevel] = useState<'all' | 'critical' | 'warning'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Notification Modal state
  const [selectedStudent, setSelectedStudent] = useState<EarlyWarningStudent | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<('SMS' | 'EMAIL' | 'PUSH')[]>(['SMS', 'EMAIL']);
  const [customMessage, setCustomMessage] = useState('');
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  // Filter students
  const filteredList = ewsList.filter(item => {
    const matchesLevel = filterLevel === 'all' 
      ? true 
      : filterLevel === 'critical' 
        ? item.riskLevel === 'critical' 
        : item.riskLevel === 'warning';

    const matchesSearch = 
      item.student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.student.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.student.className.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesLevel && matchesSearch;
  });

  const criticalCount = ewsList.filter(e => e.riskLevel === 'critical').length;
  const warningCount = ewsList.filter(e => e.riskLevel === 'warning').length;

  const handleOpenDispatch = (student: EarlyWarningStudent) => {
    setSelectedStudent(student);
    setCustomMessage(
      `[TRƯỜNG THÔNG BÁO CHUYÊN CẦN]: Kính gửi Quý phụ huynh em ${student.student.fullName} (${student.student.studentCode}, Lớp ${student.student.className}). Hiện tại sinh viên đã vắng ${student.absentSessions}/${student.totalCourseSessions} buổi môn ${student.courseName} (Tỷ lệ vắng: ${student.absenceRate}%). Em đã chạm ngưỡng rủi ro 20% và có nguy cơ bị ĐÌNH CHỈ THI HỌC PHẦN theo Quy chế Đào tạo. Kính đề nghị gia đình đôn đốc em liên hệ Cố vấn học tập trước ngày 30/09 để xử lý.`
    );
    setIsDispatchModalOpen(true);
  };

  const handleConfirmDispatch = () => {
    if (!selectedStudent) return;

    const payload: AlertNotificationPayload = {
      studentId: selectedStudent.student.id,
      studentName: selectedStudent.student.fullName,
      parentPhone: selectedStudent.student.parentPhone,
      parentEmail: selectedStudent.student.parentEmail,
      courseName: selectedStudent.courseName,
      absenceRate: selectedStudent.absenceRate,
      channels: selectedChannels,
      messageContent: customMessage,
      urgency: selectedStudent.riskLevel === 'critical' ? 'critical' : 'high'
    };

    onDispatchAlert(payload);
    setIsDispatchModalOpen(false);
    setDispatchSuccessMsg(`Đã phát cảnh báo khẩn cấp qua [${selectedChannels.join(', ')}] đến Phụ huynh em ${selectedStudent.student.fullName}!`);
    setTimeout(() => setDispatchSuccessMsg(null), 4000);
  };

  const handleBatchDispatchCritical = () => {
    const criticals = ewsList.filter(e => e.riskLevel === 'critical');
    if (criticals.length === 0) {
      alert('Hiện không có sinh viên nào trong diện Nguy hiểm (>= 20%).');
      return;
    }

    if (confirm(`Bạn có chắc muốn gửi thông báo cảnh báo tự động đa kênh đến ${criticals.length} phụ huynh sinh viên chạm ngưỡng 20%?`)) {
      criticals.forEach(c => {
        onDispatchAlert({
          studentId: c.student.id,
          studentName: c.student.fullName,
          parentPhone: c.student.parentPhone,
          parentEmail: c.student.parentEmail,
          courseName: c.courseName,
          absenceRate: c.absenceRate,
          channels: ['SMS', 'EMAIL'],
          messageContent: `[CẢNH BÁO TỰ ĐỘNG EWS 20%]: Sinh viên ${c.student.fullName} đã vắng ${c.absentSessions}/${c.totalCourseSessions} buổi môn ${c.courseName} (${c.absenceRate}%). Nguy cơ cấm thi theo Quy chế đào tạo.`,
          urgency: 'critical'
        });
      });

      setDispatchSuccessMsg(`Đã kích hoạt phát lệnh cảnh báo đồng loạt đến ${criticals.length} sinh viên vi phạm ngưỡng 20%!`);
      setTimeout(() => setDispatchSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner KPI */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                Early Warning System (EWS)
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Quy tắc cảnh báo ngưỡng 20% thời lượng học phần
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Hệ Thống Giám Sát Chuyên Cần & Cảnh Báo Sớm
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              Tự động phân tích nguy cơ cấm thi dựa trên số buổi vắng (có phép và không phép). Kích hoạt kênh thông báo đa phương thức tức thời đến Phụ huynh và Cố vấn học tập.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => DocxExportService.exportEwsDisciplinaryNotice(ewsList)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors"
              title="Xuất Biên bản Đình chỉ thi chính thức chuẩn thể thức Bộ GD&ĐT dạng Word (.doc/.docx)"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Xuất Biên Bản Cấm Thi (.docx)</span>
            </button>

            <button
              onClick={handleBatchDispatchCritical}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Phát Cảnh Báo Toàn Bộ (≥20%)</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-2xs font-semibold text-rose-800 uppercase tracking-wider block">
                Nguy Hiểm (≥ 20% - Cấm Thi)
              </span>
              <span className="text-2xl font-bold text-rose-700 font-mono mt-0.5 block">
                {criticalCount} sinh viên
              </span>
              <span className="text-2xs text-rose-600">Đã vượt ngưỡng quy chế đào tạo</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-2xs font-semibold text-amber-800 uppercase tracking-wider block">
                Tiệm Cận Cảnh Báo (13.3% - 19.9%)
              </span>
              <span className="text-2xl font-bold text-amber-700 font-mono mt-0.5 block">
                {warningCount} sinh viên
              </span>
              <span className="text-2xs text-amber-600">Cần nhắc nhở trước khi chạm 20%</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-2xs font-semibold text-emerald-800 uppercase tracking-wider block">
                Tỷ Lệ An Toàn (&lt; 13.3%)
              </span>
              <span className="text-2xl font-bold text-emerald-700 font-mono mt-0.5 block">
                {ewsList.length - criticalCount - warningCount} sinh viên
              </span>
              <span className="text-2xs text-emerald-600">Duy trì chuyên cần tốt</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {dispatchSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{dispatchSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Interactive Segmented Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setFilterLevel('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterLevel === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({ewsList.length})
          </button>
          <button
            onClick={() => setFilterLevel('critical')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterLevel === 'critical'
                ? 'bg-white text-rose-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Nguy hiểm ≥20% ({criticalCount})
          </button>
          <button
            onClick={() => setFilterLevel('warning')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterLevel === 'warning'
                ? 'bg-white text-amber-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tiệm cận ({warningCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, MSSV, lớp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs rounded-lg border border-slate-300 pl-9 pr-3 py-2 bg-white text-slate-900 focus:outline-indigo-600"
          />
        </div>
      </div>

      {/* Table of EWS Students */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Sinh Viên</th>
                <th className="py-3 px-4">Lớp & Chuyên Ngành</th>
                <th className="py-3 px-4">Số Buổi Vắng</th>
                <th className="py-3 px-4">Tỷ Lệ Vắng (%)</th>
                <th className="py-3 px-4">Mức Độ Rủi Ro</th>
                <th className="py-3 px-4">Liên Hệ Phụ Huynh</th>
                <th className="py-3 px-4 text-right">Phát Cảnh Báo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredList.map((item) => {
                const isCritical = item.riskLevel === 'critical';
                const isWarning = item.riskLevel === 'warning';

                return (
                  <tr key={item.student.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Student */}
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div>
                        <span className="block font-semibold text-slate-900">{item.student.fullName}</span>
                        <span className="font-mono text-2xs text-slate-500">{item.student.studentCode}</span>
                      </div>
                    </td>

                    {/* Class & Major */}
                    <td className="py-3.5 px-4">
                      <span className="block font-medium text-slate-900">{item.student.className}</span>
                      <span className="text-2xs text-slate-500">{item.student.major}</span>
                    </td>

                    {/* Absent Count */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-semibold text-slate-900">{item.absentSessions}/{item.totalCourseSessions} buổi</span>
                      <div className="text-2xs text-slate-500 mt-0.5">
                        <span>Không phép: {item.unexcusedAbsences}</span>
                        <span aria-hidden="true"> · </span>
                        <span>Có phép: {item.excusedAbsences}</span>
                      </div>
                    </td>

                    {/* Absence Rate Visual Bar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isCritical ? 'bg-rose-600' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, item.absenceRate)}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-xs">
                          {item.absenceRate}%
                        </span>
                      </div>
                      <span className="text-2xs text-slate-400">
                        Ngưỡng chuẩn: 20.0%
                      </span>
                    </td>

                    {/* Risk level badge */}
                    <td className="py-3.5 px-4">
                      {isCritical ? (
                        <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>NGUY HIỂM (≥20%)</span>
                        </span>
                      ) : isWarning ? (
                        <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                          <Bell className="w-4 h-4 shrink-0" />
                          <span>TIỆM CẬN (15%)</span>
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>An toàn</span>
                        </span>
                      )}
                    </td>

                    {/* Parent Contact */}
                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-medium text-slate-900 block">{item.student.parentName}</span>
                      <span className="font-mono text-2xs text-slate-500">{item.student.parentPhone}</span>
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => DocxExportService.exportParentSummonsLetter(item)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
                          title="Xuất Giấy Báo Phụ Huynh định dạng Word (.doc)"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenDispatch(item)}
                          className={`px-3 py-1.5 text-2xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 ${
                            isCritical
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : isWarning
                              ? 'bg-amber-500 hover:bg-amber-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <Send className="w-3 h-3" />
                          <span>Gửi Cảnh Báo</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-Channel Dispatch Modal */}
      {isDispatchModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-rose-600" />
                  <span>Kích Hoạt Cảnh Báo Sớm Đa Kênh (EWS)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gửi thông báo chính thức đến Gia đình sinh viên: {selectedStudent.student.fullName}
                </p>
              </div>
              <button 
                onClick={() => setIsDispatchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Channel Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Kênh Liên Lạc Tức Thời
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['SMS', 'EMAIL', 'PUSH'] as const).map(channel => (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => {
                        if (selectedChannels.includes(channel)) {
                          if (selectedChannels.length > 1) {
                            setSelectedChannels(selectedChannels.filter(c => c !== channel));
                          }
                        } else {
                          setSelectedChannels([...selectedChannels, channel]);
                        }
                      }}
                      className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        selectedChannels.includes(channel)
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {channel === 'SMS' && <Phone className="w-3.5 h-3.5" />}
                      {channel === 'EMAIL' && <Mail className="w-3.5 h-3.5" />}
                      {channel === 'PUSH' && <Bell className="w-3.5 h-3.5" />}
                      <span>{channel}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Người nhận:</span>
                  <span className="font-semibold text-slate-900">{selectedStudent.student.parentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số điện thoại:</span>
                  <span className="font-mono text-slate-900">{selectedStudent.student.parentPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-900">{selectedStudent.student.parentEmail}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Tỷ lệ vắng hiện tại:</span>
                  <strong className="text-rose-600 font-mono">{selectedStudent.absenceRate}% ({selectedStudent.absentSessions}/{selectedStudent.totalCourseSessions} buổi)</strong>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nội Dung Bản Tin Cảnh Báo Chuẩn Hóa
                </label>
                <textarea
                  rows={4}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-3 bg-white text-slate-900 focus:outline-indigo-600"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-2xs text-amber-900">
                <span className="font-semibold block mb-0.5">Nhật ký hệ thống (Audit Trail):</span>
                <span>Thao tác gửi thông báo này sẽ được lưu vết vĩnh viễn vào hệ thống phục vụ công tác thanh tra giáo dục và đối soát sau này.</span>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDispatch}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Phát Lệnh Gửi Khẩn Cấp</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
