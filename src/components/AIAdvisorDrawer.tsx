import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  RefreshCw, 
  AlertTriangle,
  Settings,
  Cpu,
  Layers
} from 'lucide-react';
import { AdvisorService, AdvisorResponse, StepStatus } from '../services/advisorService';
import { EarlyWarningStudent, AuditLogEntry, ClassSession } from '../types/attendance';

interface AIAdvisorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ewsList: EarlyWarningStudent[];
  activeSession?: ClassSession;
  auditLogs: AuditLogEntry[];
  onOpenSettings?: () => void;
}

export const AIAdvisorDrawer: React.FC<AIAdvisorDrawerProps> = ({
  isOpen,
  onClose,
  ewsList,
  activeSession,
  auditLogs,
  onOpenSettings
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AdvisorResponse | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Pipeline step state
  const [pipelineSteps, setPipelineSteps] = useState<[StepStatus, StepStatus, StepStatus]>([
    { stepIndex: 1, name: 'Bước 1: Rà Soát Bối Cảnh & Kiểm Toán Dữ Liệu', status: 'idle' },
    { stepIndex: 2, name: 'Bước 2: Xử Lý Logic & Đối Chiếu Ngưỡng EWS 20%', status: 'idle' },
    { stepIndex: 3, name: 'Bước 3: Lập Danh Mục Hành Động & Thẻ Lưu Vết', status: 'idle' }
  ]);
  const [currentRunningModel, setCurrentRunningModel] = useState<string>('');
  const [apiErrorBanner, setApiErrorBanner] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickQuestions = [
    'Phân tích sinh viên có nguy cơ cấm thi (ngưỡng 20%) và đề xuất xử lý',
    'Soạn thảo công văn thông báo cảnh báo chuyên cần gửi phụ huynh',
    'Giải thích cơ chế Tính bất biến (Data Immutability) và Admin Override',
    'Kiểm toán điều kiện xác thực Geofencing (100m) và dải IP nội bộ'
  ];

  const handleConsult = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    setResponse(null);
    setApiErrorBanner(null);

    // Reset steps
    setPipelineSteps([
      { stepIndex: 1, name: 'Bước 1: Rà Soát Bối Cảnh & Kiểm Toán Dữ Liệu', status: 'running' },
      { stepIndex: 2, name: 'Bước 2: Xử Lý Logic & Đối Chiếu Ngưỡng EWS 20%', status: 'idle' },
      { stepIndex: 3, name: 'Bước 3: Lập Danh Mục Hành Động & Thẻ Lưu Vết', status: 'idle' }
    ]);

    try {
      const res = await AdvisorService.analyzeQueryWithPipeline(
        queryText,
        {
          ewsList,
          activeSession,
          auditLogs,
          geofenceStatus: { distance: 18, isValid: true, ip: '192.168.1.105' }
        },
        (updatedSteps, activeModel, verbatimError) => {
          setPipelineSteps([...updatedSteps] as [StepStatus, StepStatus, StepStatus]);
          setCurrentRunningModel(activeModel);
          if (verbatimError) {
            setApiErrorBanner(verbatimError);
          }
        }
      );

      setResponse(res);
      if (res.verbatimError) {
        setApiErrorBanner(res.verbatimError);
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || '429 RESOURCE_EXHAUSTED';
      setApiErrorBanner(errMsg);
      setPipelineSteps(prev => [
        prev[0].status === 'success' ? prev[0] : { ...prev[0], status: 'failed', error: errMsg },
        { ...prev[1], status: 'stopped_due_to_error' },
        { ...prev[2], status: 'stopped_due_to_error' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response) return;
    const text = `
1. Xác nhận bối cảnh (Context Confirmation):
${response.contextConfirmation}

2. Xử lý logic (Logic Processing):
${response.logicProcessing.map(l => `- ${l}`).join('\n')}

3. Hành động tiếp theo (Action Items):
${response.actionItems.map(a => `- ${a}`).join('\n')}

4. Lịch sử lưu vết (Audit Note):
${response.auditNote}
`.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper for progress bar calculation
  const completedStepsCount = pipelineSteps.filter(s => s.status === 'success').length;
  const hasError = pipelineSteps.some(s => s.status === 'failed' || s.status === 'stopped_due_to_error') || !!apiErrorBanner;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                Cố Vấn EdTech Thông Minh
                <span className="text-2xs font-mono bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded border border-indigo-400/30">
                  AI Pipeline 3 Bước
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Fallback đa tầng: gemini-3-flash-preview → gemini-3-pro-preview → gemini-2.5-flash
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="text-slate-400 hover:text-white p-1.5 rounded-md transition-colors"
                title="Cài đặt API Key & Model"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-md transition-colors"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Quick Questions Section */}
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Kịch Bản Cố Vấn Khuyến Nghị
            </span>
            <div className="grid grid-cols-1 gap-2">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(q);
                    handleConsult(q);
                  }}
                  className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-xs text-slate-700 font-medium transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Pipeline Progress Visualizer (Step 1, Step 2, Step 3) */}
          {(loading || response || hasError) && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Tiến Trình Xử Lý Đa Tầng (3 Steps)
                </span>
                
                {currentRunningModel && (
                  <span className="text-2xs font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-semibold border border-indigo-200">
                    Model: {currentRunningModel}
                  </span>
                )}
              </div>

              {/* Progress Bar: Green ONLY when actually succeeded */}
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                <div 
                  className={`h-full transition-all duration-300 ${
                    hasError 
                      ? 'bg-rose-500' 
                      : completedStepsCount === 3 
                        ? 'bg-emerald-500' 
                        : 'bg-indigo-600 animate-pulse'
                  }`}
                  style={{ width: `${(completedStepsCount / 3) * 100}%` }}
                />
              </div>

              {/* Step Status Badges */}
              <div className="grid grid-cols-1 gap-2 pt-1">
                {pipelineSteps.map((step) => {
                  let badge = null;
                  if (step.status === 'success') {
                    badge = (
                      <span className="text-2xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Hoàn tất
                      </span>
                    );
                  } else if (step.status === 'running') {
                    badge = (
                      <span className="text-2xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin text-indigo-600" /> Đang chạy ({step.currentModel || 'AI'})
                      </span>
                    );
                  } else if (step.status === 'stopped_due_to_error') {
                    badge = (
                      <span className="text-2xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" /> Đã dừng do lỗi
                      </span>
                    );
                  } else if (step.status === 'failed') {
                    badge = (
                      <span className="text-2xs font-bold text-rose-700 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-rose-600" /> Thất bại
                      </span>
                    );
                  } else {
                    badge = (
                      <span className="text-2xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        Đang chờ
                      </span>
                    );
                  }

                  return (
                    <div 
                      key={step.stepIndex}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                        step.status === 'running' 
                          ? 'border-indigo-300 bg-indigo-50/50' 
                          : step.status === 'success' 
                            ? 'border-emerald-200 bg-emerald-50/20' 
                            : step.status === 'stopped_due_to_error' || step.status === 'failed'
                              ? 'border-rose-200 bg-rose-50/40'
                              : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-2xs font-mono font-bold ${
                          step.status === 'success' 
                            ? 'bg-emerald-600 text-white' 
                            : step.status === 'failed' || step.status === 'stopped_due_to_error'
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-300 text-slate-700'
                        }`}>
                          {step.stepIndex}
                        </span>
                        <span className="font-medium text-slate-800">
                          {step.name}
                        </span>
                      </div>
                      {badge}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VERBATIM RED ERROR BANNER according to AI_INSTRUCTIONS.md */}
          {apiErrorBanner && (
            <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-xl text-xs text-rose-900 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>LỖI API TOÀN BỘ MODEL (API ERROR - EXECUTION HALTED):</span>
              </div>
              <div className="p-2.5 bg-rose-100/70 border border-rose-300 rounded-lg font-mono text-2xs text-rose-950 font-bold break-all">
                {apiErrorBanner}
              </div>
              <p className="text-2xs text-rose-700 leading-relaxed">
                Tất cả các model trong chuỗi fallback (<code className="font-mono">gemini-3-flash-preview</code>, <code className="font-mono">gemini-3-pro-preview</code>, <code className="font-mono">gemini-2.5-flash</code>) đều không thể hoàn thành bước xử lý. Trạng thái quy trình đã chuyển sang <strong>"Đã dừng do lỗi"</strong>.
              </p>
              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  className="mt-1 px-3 py-1.5 text-2xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Cập nhật hoặc Thay đổi API Key</span>
                </button>
              )}
            </div>
          )}

          {/* Structured Output 4-part view */}
          {response && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Bản Đánh Giá & Quyết Định Cố Vấn
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-2xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã sao chép' : 'Sao chép văn bản'}</span>
                </button>
              </div>

              {/* Section 1: Context Confirmation */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-mono text-2xs flex items-center justify-center font-bold">
                    1
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Xác Nhận Bối Cảnh (Context Confirmation)
                  </h4>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed pl-7">
                  {response.contextConfirmation}
                </p>
              </div>

              {/* Section 2: Logic Processing */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-mono text-2xs flex items-center justify-center font-bold">
                    2
                  </span>
                  <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
                    Xử Lý Logic (Logic Processing)
                  </h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-800 pl-7 list-disc list-outside">
                  {response.logicProcessing.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 3: Action Items */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-mono text-2xs flex items-center justify-center font-bold">
                    3
                  </span>
                  <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                    Hành Động Tiếp Theo (Action Items)
                  </h4>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-800 pl-7 list-decimal list-outside">
                  {response.actionItems.map((item, idx) => (
                    <li key={idx} className="leading-relaxed font-medium">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 4: Audit Note */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-mono text-2xs flex items-center justify-center font-bold">
                    4
                  </span>
                  <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                    Lịch Sử Lưu Vết (Audit Note)
                  </h4>
                </div>
                <div className="pl-7">
                  <span className="font-mono text-2xs font-semibold text-amber-900 bg-white/80 px-2 py-1 rounded border border-amber-200 block">
                    {response.auditNote}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleConsult(prompt);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Nhập yêu cầu phân tích quy trình điểm danh, EWS 20%..."
              className="flex-1 text-xs rounded-lg border border-slate-300 px-3.5 py-2.5 bg-white text-slate-900 focus:outline-indigo-600"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className={`p-2.5 rounded-lg text-white font-semibold transition-colors flex items-center justify-center ${
                loading || !prompt.trim()
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-xs'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-2xs text-slate-400 mt-2 text-center">
            Trợ lý tự động liên kết các quy định đào tạo, tiêu chuẩn Geofence và dữ liệu lưu vết hệ thống.
          </p>
        </div>

      </div>
    </div>
  );
};
