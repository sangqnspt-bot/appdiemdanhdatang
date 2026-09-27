# Smart Attendance Expert - Quản Lý Điểm Danh Đa Tầng

Hệ thống quản lý đào tạo và điểm danh trực tuyến tích hợp kiểm soát đa tầng: Geofencing, Dynamic QR (TOTP 15s), Cảnh báo sớm EWS 20%, Chuẩn hóa dữ liệu đầu vào Excel, Cổng đồng bộ Moodle LMS và Audit Log bất biến theo tiêu chuẩn ISO 27001 và Quy chế Đào tạo Bộ GD&ĐT (Thông tư 08/2021/TT-BGDĐT).

---

## 🚀 Triển khai trên Vercel (Deployment Guide)

Dự án đã được cấu hình tối ưu để triển khai trực tiếp từ GitHub sang **Vercel**:
1. Kết nối kho mã nguồn GitHub của bạn với [Vercel](https://vercel.com).
2. Dự án đã có sẵn file `vercel.json` cấu hình Single Page Application (SPA) routing, đảm bảo khi người dùng tải lại trang (F5) hoặc chuyển tab không bị lỗi `404 Not Found`.
3. Framework Preset: **Vite**.
4. Build Command: `vite build` (hoặc `npm run build`).
5. Output Directory: `dist`.

---

## 🔑 Cấu hình API Key Gemini Người Dùng Tự Nhập

Ứng dụng tuân thủ nghiêm ngặt quy tắc trong `AI_INSTRUCTIONS.md`:
* **Nhập key trực tiếp qua giao diện**: Người dùng không cần cấu hình biến môi trường trên Vercel. Khi truy cập ứng dụng lần đầu, hệ thống sẽ tự động bật Modal cài đặt để nhập API Key.
* **Lấy key miễn phí**: Nhấp vào nút **Settings (API Key)** trên Header hoặc truy cập trực tiếp: [Google AI Studio API Keys](https://aistudio.google.com/api-keys).
* **Lưu trữ an toàn**: API Key được lưu trực tiếp trong `localStorage` của trình duyệt người dùng, ưu tiên cao nhất khi thực thi các tác vụ AI.
* **Nút cảnh báo chữ đỏ**: Nút **Settings (API Key)** kèm dòng chữ đỏ *"Lấy API key để sử dụng app"* luôn hiển thị trên thanh Header giúp người dùng dễ dàng đổi khóa khi hết hạn mức (Quota).

---

## 🤖 Cơ Chế AI Fallback & Retry 3 Bước

Hệ thống tích hợp quy trình Cố vấn AI EdTech 3 bước (3-Step Pipeline) với cơ chế tự động Fallback và Retry:
* **Thứ tự Fallback**:
  1. `gemini-3-flash-preview` *(Mặc định / Tốc độ cao)*
  2. `gemini-3-pro-preview` *(Tư duy chuyên sâu)*
  3. `gemini-2.5-flash` *(Ổn định, dự phòng)*
* **Cơ chế Retry độc lập**: Khi một bước (Bước 1, Bước 2, Bước 3) gặp lỗi API, hệ thống chỉ thử lại bước đó với model tiếp theo trong danh sách, giữ nguyên kết quả các bước trước đó.
* **Xử lý lỗi nguyên văn**: Nếu tất cả các model đều thất bại, hệ thống hiển thị thông báo lỗi màu đỏ nguyên văn mã lỗi từ API (VD: `429 RESOURCE_EXHAUSTED`). Trạng thái các bước đang chờ lập tức chuyển thành **"Đã dừng do lỗi"**, tuyệt đối không hiện tích xanh nếu quy trình bị gián đoạn.

---

## 🎓 Các Tính Năng Nâng Cấp Từ Thư Mục `SKILL EDUCATION`

1. 📝 **Xuất Văn Bản Hành Chính Word (.docx/.doc)**:
   * Tự động xuất *Biên bản Đình chỉ thi học phần* cho các sinh viên chạm ngưỡng vắng $\ge 20\%$ theo chuẩn thể thức văn bản hành chính Việt Nam và Thông tư 08/2021/TT-BGDĐT.
   * Tự động xuất *Giấy báo tình hình chuyên cần gửi Phụ huynh* cho từng sinh viên.
2. 📊 **Xuất Slide Thuyết Trình Báo Cáo Giao Ban (.pptx/.ppt)**:
   * 1-click xuất trọn bộ bài thuyết trình PowerPoint phục vụ cuộc họp giao ban Ban Giám Hiệu và Trưởng Bộ Môn.
3. 📈 **Trực Quan Hóa Dữ Liệu D3.js (Attendance Heatmap & Risk Curve)**:
   * Bản đồ nhiệt tỷ lệ vắng theo 7 ngày trong tuần và 3 ca học (Sáng, Chiều, Tối), giúp phát hiện "điểm mù chuyên cần".
   * Biểu đồ đường cong phân phối dải rủi ro EWS (An toàn, Báo động, Nguy hiểm).
4. 🏫 **Cổng Tích Hợp LMS Moodle (`mod_attendance`)**:
   * Xuất gói dữ liệu điểm danh chuẩn Moodle CSV/XML.
   * Trình giả lập kết nối Moodle External Web Service REST API.
5. 🎮 **Gamification Chuyên Cần (Streak & Badges)**:
   * Động viên người học bằng chuỗi chuyên cần (Streaks), bảng xếp hạng lớp thi đua và cấp huy hiệu số.
