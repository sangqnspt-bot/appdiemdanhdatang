import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storageService';
import { AdvisorService } from './services/advisorService';
import { 
  Student, 
  ClassSession, 
  AttendanceRecord, 
  AuditLogEntry, 
  EarlyWarningStudent, 
  GeofenceConfig,
  AlertNotificationPayload
} from './types/attendance';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { AttendanceLiveView } from './components/AttendanceLiveView';
import { EarlyWarningSystemView } from './components/EarlyWarningSystemView';
import { ExcelPipelineView } from './components/ExcelPipelineView';
import { AuditLogView } from './components/AuditLogView';
import { AIAdvisorDrawer } from './components/AIAdvisorDrawer';
import { ApiKeySettingsModal } from './components/ApiKeySettingsModal';

export default function App() {
  // Initialize storage once on mount
  useEffect(() => {
    StorageService.init();

    // Check if user has API key configured in localStorage
    const key = AdvisorService.getEffectiveApiKey();
    if (!key) {
      // Per AI_INSTRUCTIONS.md: Khi chưa có key, hiển thị Modal bắt buộc nhập
      const timer = setTimeout(() => {
        setIsSettingsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // State management
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'attendance' | 'ews' | 'excel' | 'audit'>('dashboard');
  const [userRole, setUserRole] = useState<'teacher' | 'admin'>('teacher');
  const [isOffline, setIsOffline] = useState<boolean>(StorageService.isOfflineSimulated());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(StorageService.getOfflineQueue().length);
  
  // API Key & Model settings state (AI_INSTRUCTIONS.md compliance)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(() => !!AdvisorService.getEffectiveApiKey());
  const [currentModel, setCurrentModel] = useState<string>(() => AdvisorService.getSelectedModel());

  // Domain data states
  const [students, setStudents] = useState<Student[]>(StorageService.getStudents());
  const [sessions, setSessions] = useState<ClassSession[]>(StorageService.getSessions());
  const [records, setRecords] = useState<AttendanceRecord[]>(StorageService.getAttendanceRecords());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(StorageService.getAuditLogs());
  const [geofenceConfig, setGeofenceConfig] = useState<GeofenceConfig>(StorageService.getGeofenceConfig());
  const [ewsList, setEwsList] = useState<EarlyWarningStudent[]>(StorageService.getEarlyWarningList());

  // Active session for live attendance
  const [activeSession, setActiveSession] = useState<ClassSession>(
    sessions.find(s => s.status === 'in_progress') || sessions[0]
  );

  // AI Advisor Drawer
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);

  // Sync state refresh
  const refreshAllData = () => {
    setStudents(StorageService.getStudents());
    const updatedSessions = StorageService.getSessions();
    setSessions(updatedSessions);
    setRecords(StorageService.getAttendanceRecords());
    setAuditLogs(StorageService.getAuditLogs());
    setEwsList(StorageService.getEarlyWarningList());
    setPendingSyncCount(StorageService.getOfflineQueue().length);

    // Refresh active session reference
    const current = updatedSessions.find(s => s.id === activeSession.id);
    if (current) setActiveSession(current);
  };

  // Toggle Offline mode
  const handleToggleOffline = () => {
    const nextVal = !isOffline;
    setIsOffline(nextVal);
    StorageService.setOfflineSimulated(nextVal);

    if (!nextVal) {
      // Returned online -> auto sync if any records in queue
      const queue = StorageService.getOfflineQueue();
      if (queue.length > 0) {
        StorageService.syncOfflineQueue();
        refreshAllData();
      }
    }
  };

  const handleSyncOffline = () => {
    StorageService.syncOfflineQueue();
    refreshAllData();
  };

  // Record Attendance
  const handleUpdateRecord = (record: AttendanceRecord) => {
    StorageService.saveAttendanceRecord(record);
    refreshAllData();
  };

  // Lock Session (Data Immutability)
  const handleLockSession = (sessionId: string) => {
    const actorName = userRole === 'admin' ? 'Phòng Đào Tạo - Nguyễn Hoàng Nam' : activeSession.teacherName;
    StorageService.lockSession(sessionId, userRole === 'admin' ? 'adm-01' : activeSession.teacherId, actorName, userRole);
    refreshAllData();
  };

  // Admin Override
  const handleAdminOverride = (params: any) => {
    StorageService.adminOverrideRecord(params);
    refreshAllData();
  };

  // Dispatch EWS Alert
  const handleDispatchAlert = (payload: AlertNotificationPayload) => {
    const actorName = userRole === 'admin' ? 'Phòng Đào Tạo - Nguyễn Hoàng Nam' : 'Hệ Thống Tự Động EWS';
    StorageService.dispatchAlertNotification(payload, actorName);
    refreshAllData();
  };

  // Excel Imports
  const handleImportStudents = (newStudents: Student[]) => {
    StorageService.addStudents(newStudents);
    StorageService.addAuditLog({
      id: `log-imp-st-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: userRole === 'admin' ? 'adm-01' : 'tch-01',
      actorName: userRole === 'admin' ? 'Phòng Đào Tạo - Nguyễn Hoàng Nam' : activeSession.teacherName,
      actorRole: userRole,
      actionType: 'EXCEL_IMPORT',
      targetType: 'system',
      targetId: 'student-import-batch',
      description: `Đã nạp thành công ${newStudents.length} hồ sơ sinh viên chuẩn hóa vào CSDL hệ thống.`,
      ipAddress: '10.20.1.5'
    });
    refreshAllData();
  };

  const handleImportSessions = (newSessions: ClassSession[]) => {
    const all = StorageService.getSessions().concat(newSessions);
    StorageService.saveSessions(all);
    StorageService.addAuditLog({
      id: `log-imp-sess-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: userRole === 'admin' ? 'adm-01' : 'tch-01',
      actorName: userRole === 'admin' ? 'Phòng Đào Tạo - Nguyễn Hoàng Nam' : activeSession.teacherName,
      actorRole: userRole,
      actionType: 'EXCEL_IMPORT',
      targetType: 'system',
      targetId: 'schedule-import-batch',
      description: `Đã nạp thêm ${newSessions.length} ca học vào thời khóa biểu học kỳ sau khi kiểm tra không trùng lịch dạy.`,
      ipAddress: '10.20.1.5'
    });
    refreshAllData();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userRole={userRole}
        onToggleRole={() => setUserRole(userRole === 'admin' ? 'teacher' : 'admin')}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        pendingSyncCount={pendingSyncCount}
        onSyncOffline={handleSyncOffline}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasApiKey={hasApiKey}
        currentModel={currentModel}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            sessions={sessions}
            ewsList={ewsList}
            auditLogs={auditLogs}
            onNavigateTab={setCurrentTab}
            onSelectSession={setActiveSession}
            onOpenAdvisor={() => setIsAdvisorOpen(true)}
          />
        )}

        {currentTab === 'attendance' && (
          <AttendanceLiveView
            sessions={sessions}
            currentSession={activeSession}
            onSelectSession={setActiveSession}
            students={students}
            records={records}
            onUpdateRecord={handleUpdateRecord}
            onLockSession={handleLockSession}
            onAdminOverride={handleAdminOverride}
            geofenceConfig={geofenceConfig}
            userRole={userRole}
            isOffline={isOffline}
            onNavigateToEWS={() => setCurrentTab('ews')}
          />
        )}

        {currentTab === 'ews' && (
          <EarlyWarningSystemView
            ewsList={ewsList}
            onDispatchAlert={handleDispatchAlert}
            userRole={userRole}
          />
        )}

        {currentTab === 'excel' && (
          <ExcelPipelineView
            students={students}
            sessions={sessions}
            onImportStudents={handleImportStudents}
            onImportSessions={handleImportSessions}
          />
        )}

        {currentTab === 'audit' && (
          <AuditLogView
            logs={auditLogs}
          />
        )}
      </main>

      {/* EdTech AI Advisor Drawer */}
      <AIAdvisorDrawer
        isOpen={isAdvisorOpen}
        onClose={() => setIsAdvisorOpen(false)}
        ewsList={ewsList}
        activeSession={activeSession}
        auditLogs={auditLogs}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Settings & Model Selection Modal (AI_INSTRUCTIONS.md compliant) */}
      <ApiKeySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isMandatory={!hasApiKey}
        onSaved={(key, model) => {
          setHasApiKey(!!key);
          setCurrentModel(model);
        }}
      />

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-2xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Hệ Thống Quản Lý Đào Tạo & Điểm Danh Đa Tầng</span>
            <span aria-hidden="true">·</span>
            <span>Tiêu chuẩn bảo mật dữ liệu ISO 27001 & Quy chế Bộ GD&ĐT</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Geofencing Active (100m)</span>
            <span aria-hidden="true">·</span>
            <span>TOTP Rotating QR (15s)</span>
            <span aria-hidden="true">·</span>
            <span>EWS 20% Automated</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-indigo-600 font-semibold">{currentModel}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
