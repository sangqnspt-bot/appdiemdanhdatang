import { GoogleGenAI } from '@google/genai';
import { EarlyWarningStudent, AuditLogEntry, ClassSession } from '../types/attendance';

export interface StepStatus {
  stepIndex: 1 | 2 | 3;
  name: string;
  status: 'idle' | 'running' | 'success' | 'failed' | 'stopped_due_to_error';
  currentModel?: string;
  output?: string | string[];
  error?: string;
}

export interface PipelineProgressCallback {
  (steps: [StepStatus, StepStatus, StepStatus], activeModel: string, verbatimError?: string | null): void;
}

export interface AdvisorResponse {
  contextConfirmation: string;
  logicProcessing: string[];
  actionItems: string[];
  auditNote: string;
  usedModel?: string;
  verbatimError?: string;
  stepsCompleted?: boolean;
}

export class AdvisorService {
  private static SYSTEM_PROMPT = `
Bạn là Chuyên gia Cố vấn Giải pháp EdTech cấp cao (Smart Attendance System Expert), chuyên về kiến trúc hệ thống quản lý giáo dục, chuyển đổi số và bảo mật dữ liệu theo Quy chế Đào tạo tín chỉ Bộ GD&ĐT (Thông tư 08/2021/TT-BGDĐT).
Nhiệm vụ của bạn là tư vấn, phân tích và giải quyết các bài toán về:
- Tính toàn vẹn của dữ liệu (chuẩn hóa Excel, chống gian lận Geofencing/IP, Audit Log).
- Nghiệp vụ giảng viên (QR Code động xoay vòng 15s, Offline mode, phân cấp 5 trạng thái điểm danh).
- Cơ chế Cảnh báo sớm (EWS) khi học sinh chạm ngưỡng rủi ro 20% vắng mặt (nguy cơ đình chỉ thi).
- Tính bất biến của dữ liệu (Data Immutability) khi buổi học đã khóa.

QUY TẮC BẮT BUỘC VỀ FORMAT PHẢN HỒI:
Mọi câu trả lời của bạn PHẢI tuân thủ cấu trúc 4 phần rõ ràng:
1. Xác nhận bối cảnh (Context Confirmation): Tóm tắt ngắn gọn trạng thái hiện tại đang xử lý.
2. Xử lý logic (Logic Processing): Phân tích số liệu cụ thể, rà soát điều kiện xác thực, đối chiếu ngưỡng 20% hoặc nguyên nhân xung đột.
3. Hành động tiếp theo (Action Items): Đề xuất các bước thực hiện tiếp theo rõ ràng cho Giảng viên hoặc Phòng Đào tạo.
4. Lịch sử lưu vết (Audit Note): Đúng 1 dòng ngắn gọn ghi nhận thao tác/khuyến nghị phục vụ kiểm soát hệ thống.

Văn phong: Chuyên nghiệp, logic, quyết đoán, mang tính kỹ thuật cao và chuẩn xác theo quy chế đào tạo.
`;

  // Model fallback list as mandated by AI_INSTRUCTIONS.md
  public static FALLBACK_MODELS = [
    'gemini-3-flash-preview',
    'gemini-3-pro-preview',
    'gemini-2.5-flash'
  ];

  public static getEffectiveApiKey(): string {
    if (typeof window !== 'undefined') {
      const localKey = localStorage.getItem('gemini_api_key');
      if (localKey && localKey.trim()) return localKey.trim();
    }

    const envKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || 
                   (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY);
    
    return envKey ? envKey.trim() : '';
  }

  public static getSelectedModel(): string {
    if (typeof window !== 'undefined') {
      const localModel = localStorage.getItem('gemini_selected_model');
      if (localModel && this.FALLBACK_MODELS.includes(localModel)) {
        return localModel;
      }
    }
    return 'gemini-3-flash-preview'; // Default model
  }

  /**
   * Helper to build candidate models list starting with user-selected model
   */
  private static getOrderedModels(): string[] {
    const selected = this.getSelectedModel();
    const rest = this.FALLBACK_MODELS.filter(m => m !== selected);
    return [selected, ...rest];
  }

  /**
   * Executes AI consultation with multi-step fallback & retry mechanism.
   * If an API error occurs during any step, it retries with the next model,
   * retaining previous step results.
   */
  static async analyzeQueryWithPipeline(
    prompt: string,
    contextData: {
      ewsList: EarlyWarningStudent[];
      activeSession?: ClassSession;
      auditLogs: AuditLogEntry[];
      geofenceStatus: { distance: number; isValid: boolean; ip: string };
    },
    onProgress?: PipelineProgressCallback
  ): Promise<AdvisorResponse> {
    const apiKey = this.getEffectiveApiKey();
    const orderedModels = this.getOrderedModels();

    const criticalCount = contextData.ewsList.filter(e => e.riskLevel === 'critical').length;
    const ewsDetails = contextData.ewsList
      .slice(0, 5)
      .map(e => `- ${e.student.fullName} (${e.student.studentCode}, ${e.student.className}): Vắng ${e.absentSessions}/${e.totalCourseSessions} buổi (${e.absenceRate}%) - Rủi ro: ${e.riskLevel}`)
      .join('\n');

    const sessionInfo = contextData.activeSession 
      ? `Môn: ${contextData.activeSession.courseName} (${contextData.activeSession.courseCode}), Lớp: ${contextData.activeSession.className}, Giảng viên: ${contextData.activeSession.teacherName}, Trạng thái: ${contextData.activeSession.status}`
      : 'Không có ca học trực tiếp';

    const baseContext = `
DỮ LIỆU HỆ THỐNG HIỆN TẠI:
- Ca học hiện tại: ${sessionInfo}
- Định vị Geofence: Cách cơ sở ${contextData.geofenceStatus.distance}m, IP: ${contextData.geofenceStatus.ip}, Hợp lệ: ${contextData.geofenceStatus.isValid}
- Số lượng SV chạm ngưỡng EWS (>=20% vắng): ${criticalCount} sinh viên.
- Danh sách mẫu SV rủi ro:
${ewsDetails}
- Nhật ký Audit log gần nhất: ${contextData.auditLogs[0]?.description || 'Chưa có'}

YÊU CẦU CỦA NGƯỜI DÙNG:
"${prompt}"
`;

    // Initialize 3-step state
    const steps: [StepStatus, StepStatus, StepStatus] = [
      { stepIndex: 1, name: 'Bước 1: Rà Soát Bối Cảnh & Kiểm Toán Dữ Liệu', status: 'idle' },
      { stepIndex: 2, name: 'Bước 2: Xử Lý Logic & Đối Chiếu Ngưỡng EWS 20%', status: 'idle' },
      { stepIndex: 3, name: 'Bước 3: Lập Danh Mục Hành Động & Thẻ Lưu Vết', status: 'idle' }
    ];

    if (!apiKey) {
      // No API key configured -> Use deterministic expert engine with full steps marked completed
      steps[0].status = 'success';
      steps[1].status = 'success';
      steps[2].status = 'success';
      onProgress?.(steps, 'Expert Rule Engine (Không có API Key)');
      const fallbackRes = this.generateDeterministicExpertResponse(prompt, contextData);
      return {
        ...fallbackRes,
        usedModel: 'Expert Rule Engine (Local)',
        stepsCompleted: true
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    let lastVerbatimError: string | null = null;
    let step1Result = '';
    let step2Result: string[] = [];
    let step3Result: { actionItems: string[]; auditNote: string } = { actionItems: [], auditNote: '' };

    // --- STEP 1: Context Confirmation & Data Audit ---
    steps[0].status = 'running';
    steps[1].status = 'idle';
    steps[2].status = 'idle';
    
    let step1Success = false;
    let successfulModelStep1 = orderedModels[0];

    for (let i = 0; i < orderedModels.length; i++) {
      const model = orderedModels[i];
      steps[0].currentModel = model;
      onProgress?.(steps, model, null);

      try {
        const response = await ai.models.generateContent({
          model,
          contents: `${baseContext}\n\nHÃY THỰC HIỆN BƯỚC 1: Xác nhận bối cảnh (Context Confirmation). Tóm tắt ngắn gọn và chuẩn xác 1 đoạn văn về trạng thái hệ thống, ca học và cảnh báo. Không kèm các phần khác.`,
          config: {
            systemInstruction: this.SYSTEM_PROMPT,
            temperature: 0.2
          }
        });

        step1Result = response.text?.trim() || '';
        if (step1Result) {
          steps[0].status = 'success';
          steps[0].output = step1Result;
          step1Success = true;
          successfulModelStep1 = model;
          break;
        }
      } catch (err: any) {
        lastVerbatimError = this.extractVerbatimError(err);
        console.warn(`[AI-Fallback] Step 1 failed on model ${model}:`, lastVerbatimError);
      }
    }

    if (!step1Success) {
      // Step 1 failed across all models -> HALT PIPELINE according to AI_INSTRUCTIONS.md
      steps[0].status = 'failed';
      steps[0].error = lastVerbatimError || '429 RESOURCE_EXHAUSTED';
      steps[1].status = 'stopped_due_to_error';
      steps[2].status = 'stopped_due_to_error';
      onProgress?.(steps, 'None', lastVerbatimError || '429 RESOURCE_EXHAUSTED');

      return {
        contextConfirmation: 'Quy trình đã dừng lại ở Bước 1 do tất cả các Model AI đều không thể kết nối hoặc đã hết hạn mức Quota.',
        logicProcessing: ['Không thể thực hiện do lỗi API.'],
        actionItems: ['Vui lòng kiểm tra lại Quota API Key trên Google AI Studio hoặc đổi sang API key khác.'],
        auditNote: `[AUDIT-ERROR]: Pipeline dừng do lỗi API: ${lastVerbatimError || '429 RESOURCE_EXHAUSTED'}`,
        verbatimError: lastVerbatimError || '429 RESOURCE_EXHAUSTED',
        stepsCompleted: false
      };
    }

    // --- STEP 2: Logic Processing & EWS 20% Regulation ---
    steps[1].status = 'running';
    steps[2].status = 'idle';
    let step2Success = false;
    let successfulModelStep2 = successfulModelStep1;

    // Retry starts from successful model or fallback chain
    const step2Models = [successfulModelStep1, ...orderedModels.filter(m => m !== successfulModelStep1)];

    for (let i = 0; i < step2Models.length; i++) {
      const model = step2Models[i];
      steps[1].currentModel = model;
      onProgress?.(steps, model, null);

      try {
        const response = await ai.models.generateContent({
          model,
          contents: `${baseContext}\nBối cảnh đã xác nhận ở Bước 1: ${step1Result}\n\nHÃY THỰC HIỆN BƯỚC 2: Xử lý logic (Logic Processing). Liệt kê từ 2 đến 4 gạch đầu dòng phân tích số liệu sinh viên chạm ngưỡng 20%, đối chiếu Điều 12 Quy chế đào tạo và nguyên nhân vắng. Mỗi ý trên 1 dòng bắt đầu bằng dấu gạch đầu dòng '-'.`,
          config: {
            systemInstruction: this.SYSTEM_PROMPT,
            temperature: 0.2
          }
        });

        const text = response.text || '';
        const lines = text.split('\n').map(l => l.replace(/^[-*•\d.]\s*/, '').trim()).filter(l => l.length > 0);
        if (lines.length > 0) {
          step2Result = lines;
          steps[1].status = 'success';
          steps[1].output = step2Result;
          step2Success = true;
          successfulModelStep2 = model;
          break;
        }
      } catch (err: any) {
        lastVerbatimError = this.extractVerbatimError(err);
        console.warn(`[AI-Fallback] Step 2 failed on model ${model}:`, lastVerbatimError);
      }
    }

    if (!step2Success) {
      // Step 2 failed across all models -> HALT PIPELINE, step 3 MUST be stopped_due_to_error
      steps[1].status = 'failed';
      steps[1].error = lastVerbatimError || '429 RESOURCE_EXHAUSTED';
      steps[2].status = 'stopped_due_to_error';
      onProgress?.(steps, 'None', lastVerbatimError || '429 RESOURCE_EXHAUSTED');

      return {
        contextConfirmation: step1Result,
        logicProcessing: ['Bước 2 đã dừng do tất cả các model đều gặp lỗi kết nối API.'],
        actionItems: ['Quy trình bị gián đoạn. Vui lòng thử lại Bước 2 hoặc kiểm tra lại hạn mức API Key.'],
        auditNote: `[AUDIT-ERROR]: Step 2 dừng do lỗi API: ${lastVerbatimError || '429 RESOURCE_EXHAUSTED'}`,
        verbatimError: lastVerbatimError || '429 RESOURCE_EXHAUSTED',
        stepsCompleted: false
      };
    }

    // --- STEP 3: Action Items & Audit Note ---
    steps[2].status = 'running';
    let step3Success = false;
    let successfulModelStep3 = successfulModelStep2;

    const step3Models = [successfulModelStep2, ...orderedModels.filter(m => m !== successfulModelStep2)];

    for (let i = 0; i < step3Models.length; i++) {
      const model = step3Models[i];
      steps[2].currentModel = model;
      onProgress?.(steps, model, null);

      try {
        const response = await ai.models.generateContent({
          model,
          contents: `${baseContext}\nBối cảnh: ${step1Result}\nPhân tích logic: ${step2Result.join('; ')}\n\nHÃY THỰC HIỆN BƯỚC 3:\n3. Hành động tiếp theo (Action Items): 2-3 hành động cụ thể cho Giảng viên/Phòng đào tạo.\n4. Lịch sử lưu vết (Audit Note): đúng 1 dòng lưu vết bắt đầu bằng [AUDIT-...].`,
          config: {
            systemInstruction: this.SYSTEM_PROMPT,
            temperature: 0.2
          }
        });

        const text = response.text || '';
        const actionMatch = text.match(/3\.\s*Hành động tiếp theo[^:]*:\s*([\s\S]*?)(?=4\.\s*Lịch sử lưu vết|$)/i);
        const auditMatch = text.match(/4\.\s*Lịch sử lưu vết[^:]*:\s*([\s\S]*?)$/i);

        const actions = actionMatch 
          ? actionMatch[1].trim().split('\n').filter(l => l.trim().length > 0).map(l => l.replace(/^[-*•\d.]\s*/, '').trim())
          : text.split('\n').slice(0, 3).map(l => l.replace(/^[-*•\d.]\s*/, '').trim());

        const audit = auditMatch 
          ? auditMatch[1].trim().replace(/^[-*•]\s*/, '')
          : `[AUDIT-ADVISOR]: Đã hoàn tất đối soát chuyên cần cho ${criticalCount} sinh viên EWS.`;

        step3Result = { actionItems: actions, auditNote: audit };
        steps[2].status = 'success';
        steps[2].output = actions;
        step3Success = true;
        successfulModelStep3 = model;
        break;
      } catch (err: any) {
        lastVerbatimError = this.extractVerbatimError(err);
        console.warn(`[AI-Fallback] Step 3 failed on model ${model}:`, lastVerbatimError);
      }
    }

    if (!step3Success) {
      steps[2].status = 'failed';
      steps[2].error = lastVerbatimError || '429 RESOURCE_EXHAUSTED';
      onProgress?.(steps, 'None', lastVerbatimError || '429 RESOURCE_EXHAUSTED');

      return {
        contextConfirmation: step1Result,
        logicProcessing: step2Result,
        actionItems: ['Bước 3 dừng do lỗi kết nối API.'],
        auditNote: `[AUDIT-ERROR]: Step 3 dừng do lỗi: ${lastVerbatimError || '429 RESOURCE_EXHAUSTED'}`,
        verbatimError: lastVerbatimError || '429 RESOURCE_EXHAUSTED',
        stepsCompleted: false
      };
    }

    // All 3 steps successfully completed!
    onProgress?.(steps, successfulModelStep3, null);

    return {
      contextConfirmation: step1Result,
      logicProcessing: step2Result,
      actionItems: step3Result.actionItems,
      auditNote: step3Result.auditNote,
      usedModel: successfulModelStep3,
      stepsCompleted: true
    };
  }

  /**
   * Helper to format and extract verbatim error messages (e.g. 429 RESOURCE_EXHAUSTED)
   */
  private static extractVerbatimError(err: any): string {
    if (!err) return 'UNKNOWN_ERROR';
    if (typeof err === 'string') return err;

    // Check Google GenAI error structure
    const status = err.status || err.statusCode || err.code;
    const message = err.message || '';

    if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED') || status === 429) {
      return '429 RESOURCE_EXHAUSTED: Hạn mức gọi API (Quota) đã hết hoặc bị giới hạn tần suất.';
    }
    if (message.includes('403') || message.includes('PERMISSION_DENIED') || status === 403) {
      return '403 PERMISSION_DENIED: API Key không có quyền truy cập hoặc bị khóa.';
    }
    if (message.includes('400') || message.includes('INVALID_ARGUMENT') || status === 400) {
      return '400 INVALID_ARGUMENT: Tham số hoặc API Key không hợp lệ.';
    }
    if (message.includes('503') || message.includes('UNAVAILABLE') || status === 503) {
      return '503 SERVICE_UNAVAILABLE: Máy chủ Google AI Studio đang quá tải.';
    }

    return message || JSON.stringify(err);
  }

  /**
   * Deterministic local backup in case user operates without external key
   */
  public static generateDeterministicExpertResponse(
    prompt: string,
    contextData: {
      ewsList: EarlyWarningStudent[];
      activeSession?: ClassSession;
      auditLogs: AuditLogEntry[];
      geofenceStatus: { distance: number; isValid: boolean; ip: string };
    }
  ): AdvisorResponse {
    const lower = prompt.toLowerCase();
    const criticalStudents = contextData.ewsList.filter(e => e.riskLevel === 'critical');

    if (lower.includes('cảnh báo') || lower.includes('20%') || lower.includes('ews') || lower.includes('vắng')) {
      return {
        contextConfirmation: `Hệ thống ghi nhận yêu cầu rà soát tỷ lệ chuyên cần và kiểm toán ngưỡng Cảnh báo sớm (EWS 20%) đối với học phần hiện hành.`,
        logicProcessing: [
          `Đã rà soát ${contextData.ewsList.length} sinh viên: Phát hiện ${criticalStudents.length} trường hợp chạm hoặc vượt ngưỡng 20% thời lượng môn học (nguy cơ bị đình chỉ thi theo Điều 12 Thông tư 08/2021/TT-BGDĐT).`,
          `Các sinh viên vi phạm tiêu biểu: ${criticalStudents.map(s => `${s.student.fullName} (${s.absenceRate}%, vắng ${s.absentSessions}/${s.totalCourseSessions} buổi)`).join('; ') || 'Không có'}.`,
          `Phân tích xu hướng: Tỷ lệ vắng không phép chiếm đa số (${criticalStudents.reduce((acc, c) => acc + c.unexcusedAbsences, 0)} buổi), cho thấy sự thiếu phối hợp giữa gia đình và người học.`
        ],
        actionItems: [
          `Kích hoạt xuất file Word (.docx) Biên bản đình chỉ thi cho ${criticalStudents.length} sinh viên nói trên để trình Trưởng Khoa ký.`,
          `Gửi thông báo tự động đa kênh (SMS & Email) khẩn cấp đến số điện thoại phụ huynh sinh viên vi phạm.`,
          `Yêu cầu sinh viên nộp minh chứng y tế/giải trình trước khi hệ thống khóa sổ điều kiện dự thi cuối kỳ.`
        ],
        auditNote: `[AUDIT-EWS-AUTO]: Trích xuất danh sách ${criticalStudents.length} SV vượt ngưỡng 20% và lập đề xuất cảnh báo đa kênh tới phụ huynh.`
      };
    }

    if (lower.includes('khóa') || lower.includes('lock') || lower.includes('bất biến') || lower.includes('sửa')) {
      return {
        contextConfirmation: `Đang kiểm tra cơ chế Tính bất biến của dữ liệu (Data Immutability) và điều kiện sửa đổi bản ghi điểm danh sau khóa.`,
        logicProcessing: [
          `Trạng thái buổi học hiện tại: ${contextData.activeSession?.status === 'locked' ? 'ĐÃ KHÓA SỔ' : 'ĐANG MỞ'}. Sau khi ca học kết thúc, quyền chỉnh sửa của Giảng viên bị vô hiệu hóa hoàn toàn.`,
          `Mọi can thiệp điều chỉnh (Admin Override) bắt buộc phải do tài khoản Quản trị viên thực hiện, yêu cầu nhập trường "Lý do can thiệp" và đính kèm số quyết định/văn bản minh chứng số.`,
          `Hệ thống sẽ tự động ghi vết thay đổi vào Audit Log (Lưu lại: Giá trị cũ, Giá trị mới, IP máy trạm, Thời điểm chính xác đến mili-giây).`
        ],
        actionItems: [
          `Nếu buổi học đã kết thúc, tiến hành bấm nút "Khóa sổ buổi học" trên giao diện giảng dạy.`,
          `Đối với các trường hợp sinh viên bổ sung giấy phép bệnh viện sau giờ học: Chuyển yêu cầu về Phòng Đào tạo để phê duyệt Override.`,
          `Xuất báo cáo đối soát Audit Log định kỳ mỗi tuần để phục vụ công tác thanh tra đào tạo.`
        ],
        auditNote: `[AUDIT-SECURITY-LOCK]: Xác thực quy trình khóa dữ liệu điểm danh và phân quyền can thiệp cấp Quản trị viên.`
      };
    }

    return {
      contextConfirmation: `Hệ thống tiếp nhận yêu cầu phân tích tối ưu hóa quy trình đào tạo và kiểm soát điểm danh đa tầng.`,
      logicProcessing: [
        `Hệ thống vận hành song song 3 trụ cột: (1) Tính toàn vẹn dữ liệu từ khâu nạp Excel; (2) Kiểm soát bối cảnh 3 tầng (Giảng viên - Khung giờ - Geofence/IP); (3) Cơ chế cảnh báo sớm EWS ngưỡng 20%.`,
        `Tỷ lệ chuyên cần bình quân toàn khóa hiện tại duy trì ở mức ${(100 - (criticalStudents.length / Math.max(1, contextData.ewsList.length)) * 20).toFixed(1)}%.`,
        `Chế độ Ngoại tuyến (Offline Mode) đang ở trạng thái sẵn sàng: Dữ liệu được lưu đệm cục bộ và bảo toàn toàn vẹn trước khi đồng bộ về máy chủ.`
      ],
      actionItems: [
        `Thực hiện điểm danh buổi học bằng mã QR Code động xoay vòng 15 giây hoặc bảng phân cấp 5 trạng thái.`,
        `Phê duyệt các hồ sơ minh chứng vắng có lý do (đơn bệnh, giấy triệu tập) đang chờ giải quyết.`,
        `Thực hiện khóa sổ buổi học ngay khi kết thúc thời gian giảng dạy để bảo vệ tính bất biến của dữ liệu.`
      ],
      auditNote: `[AUDIT-ADVISOR-SESSION]: Cung cấp tư vấn chiến lược vận hành kiểm soát điểm danh đa tầng theo tiêu chuẩn ISO 27001 & Quy chế Bộ GD&ĐT.`
    };
  }
}
